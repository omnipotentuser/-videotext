const util = require('util');

let crypto = require('crypto');
// example of getting salt and hash


module.exports = function(){

    this.genRandomString = function(length){
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    };

    this.sha512 = function(password, salt){
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        let value = hash.digest('hex');
        return {
            salt: salt,
            passwordHash: value
        };
    };

    this.saltHashPassword = function(userpw){
        let salt = await genRandomString(16);
        let pwData = await sha512(usrpw, salt);
    };

    /*
    let salted = genRandomString(16);
    let hashedPW = sha512('nickpass', salted);
    let addUserParam = ['nick', hashedPW, salted];
    */
}
