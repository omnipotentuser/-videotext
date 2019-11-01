
const path = require('path');
require(path.join("../", "util","crypt.js"))();

module.exports = function(){

    this.populateAll = async function(query){
        await addPatronUser(query, ['nick', 'buchanan', 'nbuchanan@protonmail.com', '9169557707', '9927 bilbrook', 'Austin', 'TX', '78748', 'nick', 'nickpass']);
        await addPatronUser(query, ['jon', 'soukup', 'soukup@naturaltcapital.com', '5125554433', 'wolfridge', 'Colorado Springs', 'CO', '88989', 'jon', 'jonpass']);
        await addPatronUser(query, ['anthony', 'mowl', 'anthony@chilmarketing.com', '212343456', 'clearspring', 'Austin', 'TX', '78748', 'anthony', 'anthonypass']);
        await addInterpreterUser(query, ['padre', 'pio', 'terp1@mca.com', '212343456', 'my address', 'Austin', 'TX', '78748', 'M', 32, 'terp1', 'terppass']);
        await addInterpreterUser(query, ['janet', 'dorn', 'terp2@mca.com', '212343456', 'my address', 'Austin', 'TX', '78748', 'F', 22, 'terp2', 'terppass']);
        await addInterpreterUser(query, ['bob', 'hope', 'terp3@mca.com', '212343456', 'my address', 'Austin', 'TX', '78748', 'M', 42, 'terp3', 'terppass']);
    }
    
    let addPatronUser = async function(query, userinfo){
        let addUser = 'INSERT INTO PATRONS (first_name, last_name, email, phone, street, city, country, postal, username, pwd_salt, pwd_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING';

        let encryptedpw = await saltPassword(userinfo.pop()); // pop out the password
        userinfo = userinfo.concat(encryptedpw); // append the salt and hashed password

        try {
            //console.log(userinfo);
            const result  = await query(addUser, userinfo);
            console.log('create default user: ', result);
        } catch(e) {
            console.log('addUserDB query failed: ', e);
        }
    }
    let addInterpreterUser = async function(query, userinfo){
        let addUser = 'INSERT INTO INTERPRETERS (first_name, last_name, email, phone, street, city, country, postal, gender, age, username, pwd_salt, pwd_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT DO NOTHING';

        let encryptedpw = await saltPassword(userinfo.pop()); // pop out the password
        userinfo = userinfo.concat(encryptedpw); // append the salt and hashed password

        try {
            //console.log(userinfo);
            const result  = await query(addUser, userinfo);
            console.log('create default user: ', result);
        } catch(e) {
            console.log('addUserDB query failed: ', e);
        }
    }
}
