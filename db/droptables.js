require('./crypt.js')();

module.exports = function(){

    this.dropAll = async function(query){
        await dropPatronActivityTable(query);
        await dropInterpreterActivityTable(query);
        await dropPatronSettingsTable(query);
        await dropInterpreterSettingsTable(query);
        await dropServicesTable(query);
        await dropLanguagesTable(query);
        await dropInterpretersTable(query);
        await dropPatronsTable(query);
        await dropCodesTable(query);
    }

    let dropInterpretersTable = async function(query){

        let dropInterpreters = 'DROP TABLE INTERPRETERS';

        try {
            const result  = await query(dropInterpreters);
            console.log('drop Interpreters table: ', result);
        } catch(e) {

            console.log('dropInterpretersTable query failed');
            console.log(e);
        }
    }
    let dropInterpreterActivityTable = async function(query){

        let dropInterpreterActivity = 'DROP TABLE INTERPRETER_ACTIVITY';

        try {
            const result  = await query(dropInterpreterActivity);
            console.log('drop InterpreterActivity table: ', result);
        } catch(e) {

            console.log('dropInterpreterActivityTable query failed');
            console.log(e);
        }
    }
    let dropInterpreterSettingsTable = async function(query){

        let dropInterpreterSettings = 'DROP TABLE INTERPRETER_SETTINGS';

        try {
            const result  = await query(dropInterpreterSettings);
            console.log('drop Interpreter_Settings table: ', result);
        } catch(e) {

            console.log('dropInterpreterSettingsTable query failed');
            console.log(e);
        }
    }
    let dropPatronsTable = async function(query){

        let dropPatrons = 'DROP TABLE PATRONS';

        try {
            const result  = await query(dropPatrons);
            console.log('drop Patrons table: ', result);
        } catch(e) {

            console.log('dropPatronsTable query failed');
            console.log(e);
        }
    }
    let dropPatronActivityTable = async function(query){

        let dropPatronActivity = 'DROP TABLE PATRON_ACTIVITY';

        try {
            const result  = await query(dropPatronActivity);
            console.log('drop Patron_Activity table: ', result);
        } catch(e) {

            console.log('dropPatronsActivityTable query failed');
            console.log(e);
        }
    }
    let dropPatronSettingsTable = async function(query){

        let dropPatronSettings = 'DROP TABLE PATRON_SETTINGS';

        try {
            const result  = await query(dropPatronSettings);
            console.log('drop Patron_Settings table: ', result);
        } catch(e) {

            console.log('dropPatronsSettingsTable query failed');
            console.log(e);
        }
    }
    let dropLanguagesTable = async function(query){

        let dropLanguages = 'DROP TABLE LANGUAGES';

        try {
            const result  = await query(dropLanguages);
            console.log('drop Languages table: ', result);
        } catch(e) {

            console.log('dropLanguagesTable query failed');
            console.log(e);
        }
    }
    let dropServicesTable = async function(query){

        let dropServices = 'DROP TABLE SERVICES';

        try {
            const result  = await query(dropServices);
            console.log('drop Services table: ', result);
        } catch(e) {

            console.log('dropServicesTable query failed');
            console.log(e);
        }
    }
    let dropCodesTable = async function(query){

        let dropCodes = 'DROP TABLE CODES';

        try {
            const result  = await query(dropCodes);
            console.log('drop Codes table: ', result);
        } catch(e) {

            console.log('dropCodesTable query failed');
            console.log(e);
        }
    }
}
