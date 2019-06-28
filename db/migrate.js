const util = require('util');
const { Pool } = require('pg');
const pool = new Pool({
    user: 'nick',
    host: 'localhost',
    database: 'registration',
    password: 'nobis',
    port: 5432
});

const query = util.promisify(pool.query).bind(pool);

let crypto = require('crypto');
let genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
};
let sha512 = function(password, salt){
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

// example of getting salt and hash
function saltHashPassword(userpw){
    let salt = genRandomString(16);
    let pwData = sha512(usrpw, salt);
};

let salted = genRandomString(16);
let hashedPW = sha512('nick', salted);
let addUserParam = ['nick', hashedPW, salted];


async function addUserDB(){
    let addUser = 'INSERT INTO users (name, psw_hash, salt) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING';
    try {
        const result  = await query(addUser, addUserParam);
        console.log('create default user: ', result);
    } catch(e) {
        console.log('addUserDB query failed');
    }
    /*
    try {
        return await processSomeData(foo);
    } catch (e){
        return null;
    }
    */
    pool.end();
}

addUserDB();
