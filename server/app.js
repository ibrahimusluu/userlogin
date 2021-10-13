require('dotenv').config({ path: '../userlogin/.env' })
var express = require("express")
var app = express()
var bodyParser = require('body-parser')
var cors = require('cors')

let conn = require('./connection')
let mail = require('./mail')

app.use(cors());
app.use(bodyParser.json())

var code;
var id
var counter = 0

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

app.get("/users", function (req, res) {
    conn.query(`SELECT * FROM user_info`,
        function (err, result) {
            if (err) throw err
            res.send(result)
        })
})

app.get("/onlineUsers", function (req, res) {
    conn.query(`SELECT * FROM user_info WHERE online = '1'`,
        function (err, result) {
            if (err) throw err
            res.send(result)
        })
})

app.get("/offlineUsers", function (req, res) {
    conn.query('SELECT * FROM user_info WHERE online = 0',
        function (err, result) {
            if (err) throw err
            const d = new Date()
            for (var i = 0; i <= result.length - 1; i++) {
                if (d - result[i].date > 86400000) { // 86400000 24 hours
                    counter += 1
                }
            }
            res.send({ counter: counter })
            counter = 0
        })
})

app.get("/registered", function (req, res) {
    conn.query(`SELECT * FROM user_info`,
        function (err, result) {
            if (err) throw err
            const d = new Date()

            for (var i = 0; i <= result.length - 1; i++) {
                if (d - result[i].date < 86400000) { // 86400000 24 hours
                    counter += 1
                }
            }
            res.send({ counter: counter })
            counter = 0
        })
})

app.get("/loginTime", function (req, res) {
    conn.query('SELECT * FROM user_info WHERE online = 1',
        function (err, result) {
            if (err) throw err
            res.send({ second: (result[result.length - 1].loginDate - result[result.length - 1].date) / 1000 })
        })
})

app.get("/verify", function (req, res) {
    res.send({ id: id, code: code, status: true })
})

app.post('/register', function (req, res) {
    const d = new Date()
    conn.query('INSERT INTO user_info (name,surname,email,password,date) VALUES (?,?,?,?,?)', [
        req.body.name, req.body.surname, req.body.email, req.body.password, d
    ], (err, result) => {
        if (err) {
            res.send({ status: false, message: 'Happened an error while register.' })
            throw err;
        }
        result.insertId != null ? res.send({ status: true, id: result.insertId, message: 'Succesful' }) : res.send({ status: false, message: 'Register already exists or İnformations are wrong!' })

        var user_id = result.insertId
        var random = getRndInteger(100000, 999999)

        var mailOptions = {
            from: process.env.APP_EMAIL,
            to: req.body.email,
            subject: 'Verify Your Account!(User Login Application)',
            text: 'Your activation code : ' + random
        };

        mail.sendMail(mailOptions, function (error, info) {
            if (error) {
                throw error
            } else {
                res.send('Email sent: ' + info.response);
            }
        });

        conn.query('INSERT INTO activation_codes (user_id,activation_code) VALUES (?,?)', [user_id, random], (err, result) => {
            if (err) {
                throw err;
            }
            conn.query(
                "SELECT * FROM activation_codes WHERE user_id =" + user_id,
                function (err, result) {
                    if (err) throw err;
                    code = result[0].activation_code;
                    id = user_id
                }
            );
        })
    });
})

app.post("/forgetPassword", function (req, res) {
    conn.query(
        `SELECT * FROM user_info WHERE email='${req.body.email}'`,
        function (err, result) {
            if (result[0] == undefined)  // or null
            {
                res.send({ status: false, message: "There is no email address like you typed!" })
            }
            else if (result[0] != undefined) {
                var random = getRndInteger(100000, 999999)
                conn.query(`UPDATE user_info SET password = '${random}' WHERE email = '${req.body.email}'`,
                    function (err, result) {
                        if (err) throw err
                    })
                var mailOptions = {
                    from: process.env.APP_EMAIL,
                    to: req.body.email,
                    subject: 'Verify Your Account!(User Login Application)',
                    text: 'Your new password : ' + random
                };

                mail.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        throw error
                    } else {
                        res.send('Email sent: ' + info.response);
                    }
                });
                result[0].email != null ? res.send({ status: true, message: 'Your new password was sent to your email address. Check it!', password: random }) : res.send({ status: false, message: 'Bir Hata Oluştu!' })
            }
        }
    );
})

app.post("/activated", function (req, res) {
    conn.query(`UPDATE activation_codes SET activated = '1' WHERE user_id = '${req.body.id}'`,
        function (err, result) {
            if (err) throw err
            result.insertId != null ? res.send({ status: true, message: 'Your account was activated. You can login!', activated: 1 }) : res.send({ status: false, message: 'Bir Hata Oluştu!' })
        }
    )
})

app.post("/login", function (req, res) {
    conn.query(`SELECT * from user_info WHERE email = '${req.body.email}'`,
        function (err, resultAccount) {
            if (resultAccount[0] == undefined) {
                res.send({ status: 0, message: "Email address or password is wrong!" })
            }
            else if (resultAccount[0] != undefined) {
                conn.query(`SELECT * from activation_codes WHERE user_id = '${resultAccount[0].id}'`,
                    function (err, result) {
                        if (result[0].activated == 1) {
                            const d = new Date()
                            Date.prototype.addHours = function (h) {
                                this.setTime(this.getTime() + (h * 60 * 60 * 1000));
                                return this;
                            }
                            d.addHours(3)
                            conn.query(`UPDATE user_info SET loginDate = '${d.toISOString()}' WHERE email = '${req.body.email}'`,)
                            res.send({ status: 1, email: resultAccount[0].email, password: resultAccount[0].password, message: "Login is successful" })
                        }
                        else {
                            res.send({ status: 2, message: "Your account was not activated yet!" })
                        }
                    }
                )

            }
        }
    )
})

app.post("/online", function (req, res) {
    conn.query(`UPDATE user_info SET online = '${req.body.online}' WHERE email = '${req.body.email}'`,
        function (err, result) {
            if (err) throw err
            if (req.body.online == 1) {
                result.insertId != null ? res.send({ status: true, message: 'You are online now.' }) : res.send({ status: false, message: "You couldn't login!" })
            }
            else if (req.body.online == 0) {
                result.insertId != null ? res.send({ status: true, message: 'You are offline now.' }) : res.send({ status: false, message: "You couldn't logout!" })
            }
        })
})

var server = app.listen(3000, function () {
    server.address().port
})

