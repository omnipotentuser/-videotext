require('createtables.js')();
require('populatetables.js')();

const util = require('util');
const { Pool } = require('pg');
const pool = new Pool({
    user: 'nick',
    host: 'localhost',
    database: 'mca',
    password: 'nobis',
    port: 5432
});

const query = util.promisfy(pool.query).bind(pool);

create_all(query);
populate_all(query);

pool.end();
