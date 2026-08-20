const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool without specifying database first to allow creating it
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initDB() {
    try {
        // Create database if it doesn't exist
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        
        // Use the database
        await pool.query(`USE ${process.env.DB_NAME}`);
        
        // Create the table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.upload_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                original_filename VARCHAR(255) NOT NULL,
                compressed_filename VARCHAR(255) NOT NULL,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(createTableQuery);
        console.log("Database and table initialized successfully.");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initDB();

module.exports = pool;
