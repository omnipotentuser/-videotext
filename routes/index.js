'use strict';
var express = require('express');
var router = express.Router();


const { Pool } = require('pg')
const pool = new Pool({
    user: 'nick',
    host: 'localhost',
    database: 'registration',
    password: 'nobis',
    port: 5432
})


// EXAMPLE REGISTRATION SECTION

router.post('/register', function(req, res, next) {
    console.log('/REGISTER request');
    console.log('req.body ', req.body);

    if (!Array.isArray(req.body.allergies))
        req.body.allergies = [req.body.allergies];

    var regform = {
        gfn: req.body.guardian_first_name,
        gln: req.body.guardian_last_name,
        cfn: req.body.child_first_name,
        cln: req.body.child_last_name,
        allergies: req.body.allergies,
        gender: req.body.gender
    };

    var allergyarray = [false, false, false, false];
    regform.allergies.forEach(function(value){
        switch(value){
            case "lactose":
                allergyarray[0] = true;
                break;
            case "latex":
                allergyarray[3] = true;
                break;
            case "penicillin":
                allergyarray[2] = true;
                break;
            case "peanuts":
                allergyarray[1] = true;
                break;
            default:
                break;

        }
    });

    var allergy = "INSERT INTO allergies (lactose, peanuts, penicillin, latex) VALUES ($1, $2, $3, $4) RETURNING id";
    var gender = "INSERT INTO gender (code) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id";
    var register = "INSERT INTO registrant (guardian_first_name, guardian_last_name, student_first_name, student_last_name, allergies_id, gender_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING";

    var allergy_id, gender_id;
    pool.query(allergy, allergyarray, (error, results) => {
        if (error) {
            throw error;
            res.send({msg: "error"});
        } else {
            //console.log('allergy query results: ', results);
            //console.log('allergy query results id: ', results.rows[0].id);
            allergy_id = results.rows[0].id;
            pool.query(gender, [regform.gender], (error, results) => {
                if (error){
                    throw error;
                    res.send({msg: "error"});
                } else {
                    gender_id = results.rows[0].id;
                    pool.query(register, [regform.gfn, regform.gln, regform.cfn, regform.cln, allergy_id, gender_id], (error, results) => {
                        if (error){
                            throw error;
                            res.send({msg: "error"});
                        } else {
                            res.send({msg: "success"});
                        }
                    });
                }
            });
        }
    })

    /*
    } else {
        res.status(404).send({msg: "Unknown error occured"});
    }
    */
});




// ADMINISTRATOR SECTION

var crypto = require('crypto');

var Users = [];

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };

};


var salted = genRandomString(16);
var hashedpw = sha512('nick', salted);
var addUserParam = ['nick', hashedpw.passwordHash, salted];

var addUser = 'INSERT INTO users (name, psw_hash, salt) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING';

pool.query(addUser, addUserParam, (error, results) => {
    if (error){
        throw error;
    }
    console.log('create default user: ', results);
});

// example of getting salt and hash
function saltHashPassword(userpw){
    var salt = genRandomString(16);
    var pwData = sha512(usrpw, salt);
};



// temporary
Users.push({uname: "nick", psw: "nick"});


var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid){
        res.redirect('/videochat');
    } else {
        next();
    }
};

router.get('/', sessionChecker, function(req, res, next) {
  res.render('index', 
      { title: 'videochat Login',
        subtitle: 'Login Page',
        page: 'login'});
});

router.get('/login', function(req, res, next) {
    res.redirect("/");
});

router.post('/login', function(req, res, next) {
    console.log('login request');
    if (!req.body.uname || !req.body.psw){
        res.status(404).send({msg: "Please enter both id and password"});
    } else {
        console.log('uname='+req.body.uname+", psw="+req.body.psw);
        Users.filter(function(user){
            console.log('user.uname='+user.uname+", user.psw="+user.psw);
            if(user.uname === req.body.uname && user.psw === req.body.psw){
                console.log('login creds matches');
                req.session.user = user;
                res.redirect('/videochat');
            } else {
                res.status(404).send({msg: "credentials failed"});
            }
        });
    }
});

router.get('/logout', function(req, res, next) {
    console.log('logout request');
    if(req.session.user && req.cookies.user_sid){
        console.log('logout clearing cookies');
        res.clearCookie('user_sid');
        res.redirect("/login");
    } else {
        res.redirect("/login");
    }
});

router.get('/videochat', function(req, res, next) {
    console.log('requesting videochat');
    console.log('user_sid=%s', req.cookies.user_sid);
    console.log('session user=%s', JSON.stringify(req.session));
    if (req.session.user && req.cookies.user_sid){
        console.log('rendering videochat');
        res.render('videochat');
    } else {
        res.redirect('/login');
    }
});


// LOGIN-FREE videotext
router.get('/vc', function(req, res, next) {
    console.log('requesting member-free videochat');
    console.log('rendering videochat');
    res.render('videochat');
});

// LOGIN-FREE videophone
router.get('/vp', function(req, res, next) {
    console.log('requesting member-free videophone');
    console.log('rendering videophone');
    res.render('videophone');
});
router.get('/vpexit', function(req, res, next) {
    res.redirect("/vp");
});


module.exports = router;
