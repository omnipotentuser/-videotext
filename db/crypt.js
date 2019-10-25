let crypto = require('crypto');

module.exports = function(){

    let genRandomString = function(length){
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    };

    this.sha512 = async function(password, salt){
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        let value = hash.digest('hex');
        return value;
    };

    this.saltPassword = async function(userpw){
        let salt = await genRandomString(16);
        let hashedPW = await sha512(userpw, salt);
        return [salt, hashedPW];
    };

    /*
    let salted = genRandomString(16);
    let hashedPW = sha512('nickpass', salted);
    let addUserParam = ['nick', hashedPW, salted];
    */
}
