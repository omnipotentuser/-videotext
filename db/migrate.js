const {promisify} = require('util');
require('./createtables.js')();
require('./droptables.js')();
//require('./populatetables.js')();

const { Pool } = require('pg');
const pool = new Pool({
    user: 'nick',
    host: 'localhost',
    database: 'mca',
    password: 'nobis',
    port: 5432
});


async function build(){
    const query = promisify(pool.query).bind(pool);
    await createAll(query);
    await dropAll(query);
    await populateAll(query);
    pool.end();
}

build();


