require('./crypt.js')();

module.exports = function(){

    this.createAll = async function(query){
        createPatronsTable(query);

    }
    let createPatronsTable = async function(query){

        let createPatron = 'CREATE TABLE IF NOT EXISTS PATRONS (ID SERIAL PRIMARY KEY NOT NULL, FIRST_NAME CHAR(32) NOT NULL, LAST_NAME CHAR(32) NOT NULL, Email CHAR(100) NOT NULL, Phone CHAR(16), Street TEXT, City CHAR(32), Country CHAR(32), Postal INT, Username CHAR(32), PWD_Salt TEXT NOT NULL, PWD_Hash TEXT NOT NULL, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';

        try {
            const result  = await query(createPatron);
            console.log('create Patrons table: ', result);
        } catch(e) {

            console.log('createPatronsTable query failed');
            console.log(e);
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
