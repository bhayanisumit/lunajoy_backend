import mysql from 'mysql2'

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  console.log("error" , err)
  if (err) throw err;
  console.log('Connected to the MySQL database.');
});

export default connection