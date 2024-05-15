const mysql = require('mysql2/promise');


async function getDbConnection() {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'with_them'
  });
}

module.exports = getDbConnection;