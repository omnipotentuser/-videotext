//require('./crypt.js')();

module.exports = function(){

    this.createAll = async function(query){
        await createCodesTable(query);
        await createServicesTable(query);
        await createLanguagesTable(query);
        await createPatronsTable(query);
        await createInterpretersTable(query);
        await createPatronActivityTable(query);
        await createPatronSettingsTable(query);
        await createInterpreterActivityTable(query);
        await createInterpreterSettingsTable(query);

    }

    let createInterpretersTable = async function(query){

        let createInterpreters = 'CREATE TABLE IF NOT EXISTS INTERPRETERS (ID SERIAL PRIMARY KEY NOT NULL, FIRST_NAME CHAR(32) NOT NULL, LAST_NAME CHAR(32) NOT NULL, Email CHAR(100) NOT NULL, Phone CHAR(16), Street TEXT, City CHAR(32), Country CHAR(32), Postal INT, Gender CHAR(12), Age INT, Username CHAR(32), PWD_Salt TEXT NOT NULL, PWD_Hash TEXT NOT NULL, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';

        try {
            const result  = await query(createInterpreters);
            //console.log('create Interpreters table: ', result);
            console.log('created Interpreters table');
        } catch(e) {

            console.log('createInterpretersTable query failed');
            console.log(e);
        }
    }
    let createPatronActivityTable = async function(query){

        let createPatronActivity = 'CREATE TABLE IF NOT EXISTS PATRON_ACTIVITY (ID SERIAL PRIMARY KEY NOT NULL, PATRON_ID INT REFERENCES PATRONS(ID) ON DELETE CASCADE, SERVICE_ID INT REFERENCES SERVICES(ID) ON DELETE CASCADE, LOGIN_COUNT INT, TOTAL_CONN_COUNT INT, TOTAL_CONN_DURATION INT, LOGIN_DURATION INT, SYSTEM_OS TEXT, BROWSER TEXT, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';

        try {
            const result  = await query(createPatronActivity);
            //console.log('create PatronActivity table: ', result);
            console.log('created PatronActivity table');
        } catch(e) {

            console.log('createPatronActivityTable query failed');
            console.log(e);
        }
    }
    let createPatronSettingsTable = async function(query){

        let createPatronSettings = 'CREATE TABLE IF NOT EXISTS PATRON_SETTINGS (ID SERIAL NOT NULL, PATRON_ID INT REFERENCES PATRONS(ID) ON DELETE CASCADE, VIDEO_DEFAULT_ON BOOLEAN, MIC_DEFAULT_ON BOOLEAN, SPEAKER_DEFAULT_ON BOOLEAN, VIDEO_TRACK CHAR(100), AUDIO_TRACK CHAR(100), BITRATE_MIN INT, BITRATE_MAX INT, RESOLUTION_MIN INT ARRAY[2], RESOLUTION_MAX INT ARRAY[2], RESOLUTION_DEFAULT INT ARRAY[2], Created_At Timestamp default current_timestamp, Updated_At Timestamp, PRIMARY KEY (ID))';

        try {
            const result  = await query(createPatronSettings);
            //console.log('create PatronSettings table: ', result);
            console.log('created PatronSettings table');
        } catch(e) {

            console.log('createPatronSettingsTable query failed');
            console.log(e);
        }
    }
    let createInterpreterSettingsTable = async function(query){

        let createInterpreterSettings = 'CREATE TABLE IF NOT EXISTS INTERPRETER_SETTINGS (ID SERIAL NOT NULL, INTERPRETER_ID INT REFERENCES INTERPRETERS(ID) ON DELETE CASCADE, VIDEO_DEFAULT_ON BOOLEAN, MIC_DEFAULT_ON BOOLEAN, SPEAKER_DEFAULT_ON BOOLEAN, VIDEO_TRACK CHAR(100), AUDIO_TRACK CHAR(100), BITRATE_MIN INT, BITRATE_MAX INT, RESOLUTION_MIN INT ARRAY[2], RESOLUTION_MAX INT ARRAY[2], RESOLUTION_DEFAULT INT ARRAY[2], Created_At Timestamp default current_timestamp, Updated_At Timestamp, PRIMARY KEY (ID))';

        try {
            const result  = await query(createInterpreterSettings);
            //console.log('create InterpreterSettings table: ', result);
            console.log('created InterpreterSettings table');
        } catch(e) {

            console.log('createInterpreterSettingsTable query failed');
            console.log(e);
        }
    }
    let createInterpreterActivityTable = async function(query){

        let createInterpreterActivity = 'CREATE TABLE IF NOT EXISTS INTERPRETER_ACTIVITY (ID SERIAL PRIMARY KEY NOT NULL, INTERPRETER_ID INT REFERENCES INTERPRETERS(ID) ON DELETE CASCADE, SERVICE_ID INT REFERENCES SERVICES(ID) ON DELETE CASCADE, LOGIN_COUNT INT, TOTAL_CONN_COUNT INT, TOTAL_CONN_DURATION INT, LOGIN_DURATION INT, SYSTEM_OS TEXT, BROWSER TEXT, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';

        try {
            const result  = await query(createInterpreterActivity);
            //console.log('create InterpreterActivity table: ', result);
            console.log('created InterpreterActivity table');
        } catch(e) {

            console.log('createInterpreterActivityTable query failed');
            console.log(e);
        }
    }
    let createServicesTable = async function(query){

        let createServices = 'CREATE TABLE IF NOT EXISTS SERVICES (ID SERIAL PRIMARY KEY NOT NULL, SERVICE_TYPE TEXT NOT NULL, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';

        try {
            const result  = await query(createServices);
            //console.log('create Services table: ', result);
            console.log('created Services table');
        } catch(e) {

            console.log('createServicesTable query failed');
            console.log(e);
        }
    }
    let createLanguagesTable = async function(query){

        let createLanguages = 'CREATE TABLE IF NOT EXISTS LANGUAGES (ID SERIAL PRIMARY KEY NOT NULL, USER_ID INT, LANGUAGE TEXT NOT NULL, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';

        try {
            const result  = await query(createLanguages);
            //console.log('create Languages table: ', result);
            console.log('created Languages table');
        } catch(e) {

            console.log('createLanguagesTable query failed');
            console.log(e);
        }
    }
    let createCodesTable = async function(query){

        let createCodes = 'CREATE TABLE IF NOT EXISTS CODES (ID SERIAL PRIMARY KEY NOT NULL, ENUM SERIAL, NAME TEXT NOT NULL, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';
        try {
            const result  = await query(createCodes);
            //console.log('create Codes table: ', result);
            console.log('created Codes table');
        } catch(e) {

            console.log('createCodesTable query failed');
            console.log(e);
        }
    }
    let createPatronsTable = async function(query){

        let createPatron = 'CREATE TABLE IF NOT EXISTS PATRONS (ID SERIAL PRIMARY KEY NOT NULL, FIRST_NAME CHAR(32) NOT NULL, LAST_NAME CHAR(32) NOT NULL, Email CHAR(100) NOT NULL, Phone CHAR(16), Street TEXT, City CHAR(32), Country CHAR(32), Postal INT, Username CHAR(32), PWD_Salt TEXT NOT NULL, PWD_Hash TEXT NOT NULL, Created_At Timestamp default current_timestamp, Updated_At Timestamp)';

        try {
            const result  = await query(createPatron);
            //console.log('create Patrons table: ', result);
            console.log('created Patrons table');
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
