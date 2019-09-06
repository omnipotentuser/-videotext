const {promisify} = require('util');
require('./createtables.js')();
//require('./populatetables.js')();

const { Pool } = require('pg');
const pool = new Pool({
    user: 'nick',
    host: 'localhost',
    database: 'mca',
    password: 'nobis',
    port: 5432
});

const query = promisify(pool.query).bind(pool);

createAll(query)
    .then(dropAll(query));
//populateAll(query);

pool.end();
