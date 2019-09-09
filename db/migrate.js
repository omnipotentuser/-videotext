const {promisify} = require('util');
require('./createtables.js')();
require('./droptables.js')();
require('./populatetables.js')();

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
    await dropAll(query);
    await createAll(query);
    await populateAll(query);
    pool.end();
}

build();


