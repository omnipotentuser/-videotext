
require('./crypt.js')();

module.exports = function(){

    this.populateAll = async function(query){
        await addPatronUser(query, ['nick', 'buchanan', 'nbuchanan@protonmail.com', '9169557707', '9927 bilbrook', 'Austin', 'TX', '78748', 'nick', 'nickpass']);
        //addPatronUser('anthony', 'anthonypass');
        //addPatronUser('jon', 'jonpass');
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
    /*
    try {
        return await processSomeData(foo);
    } catch (e){
        return null;
    }
    */
}
