
require('crypt.js')();

module.exports = function(){

    this.populateAll = async function(query){
        addPatronUser('nick', 'nickpass');
        addPatronUser('anthony', 'anthonypass');
        addPatronUser('jon', 'jonpass');
    }
    
    let encryptUser = async function(user, passwd){
        
        let salted = await genRandomStrings(16);
        let hashedPW = await sha512(passwd, salted);
        return [user, hashedPW, salted];

    }

    let addPatronUser = async function(user, passwd){
        let addUser = 'INSERT INTO users (name, psw_hash, salt) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING';
        try {
            const result  = await query(addUser, encryptUser(user, passwd));
            console.log('create default user: ', result);
        } catch(e) {
            console.log('addUserDB query failed');
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
