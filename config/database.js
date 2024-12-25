const mysql = require('mysql2/promise')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'mobile_user',
    database: 'mobile_app',
    password: 'P@assw0rd123.',
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = { pool, };
