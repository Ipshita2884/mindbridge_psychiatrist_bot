const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database connected successfully');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection failed:', err.message);
        console.error('Make sure MySQL is running and credentials are correct');
        // process.exit(1);
    });

async function initializeDatabase() {
    const queries = [
        // 1. Users Table
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            display_name VARCHAR(100),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('user', 'psychiatrist', 'admin') DEFAULT 'user',
            psychiatrist_id INT NULL,
            phone VARCHAR(20),
            gender VARCHAR(20),
            dob DATE,
            can_message TINYINT(1) DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            deleted_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (psychiatrist_id) REFERENCES users(id) ON DELETE SET NULL
        )`,

        // 2. Chat Sessions
        `CREATE TABLE IF NOT EXISTS chat_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ended_at TIMESTAMP NULL,
            avg_stress_score FLOAT DEFAULT 0,
            sentiment_label ENUM('positive', 'neutral', 'negative'),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 3. Messages
        `CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            sender ENUM('user', 'bot') NOT NULL,
            content TEXT NOT NULL,
            sentiment_score FLOAT DEFAULT 0,
            stress_score FLOAT DEFAULT 0,
            flagged_keywords JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (session_id),
            INDEX (created_at),
            FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        )`,

        // 4. Stress Logs
        `CREATE TABLE IF NOT EXISTS stress_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            score FLOAT NOT NULL,
            source ENUM('chat', 'quiz', 'face', 'manual') DEFAULT 'chat',
            mood VARCHAR(100),
            notes TEXT,
            triggers TEXT,
            activity_context TEXT,
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id, logged_at),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 5. Quiz Results
        `CREATE TABLE IF NOT EXISTS quiz_results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            quiz_type VARCHAR(50) NOT NULL,
            score INT NOT NULL,
            severity VARCHAR(50),
            answers JSON NULL,
            taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 6. Direct Messages (Psychiatrist <-> Patient)
        \`CREATE TABLE IF NOT EXISTS direct_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            content TEXT NOT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )\`,
        // 7. Emergency Alerts
        `CREATE TABLE IF NOT EXISTS emergency_alerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            trigger_type ENUM('stress_threshold', 'keyword') NOT NULL,
            severity ENUM('high', 'critical') DEFAULT 'high',
            notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP NULL,
            notes TEXT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 7. User Preferences
        `CREATE TABLE IF NOT EXISTS user_preferences (
            user_id INT PRIMARY KEY,
            voice_enabled TINYINT(1) DEFAULT 0,
            voice_name VARCHAR(100),
            autoplay TINYINT(1) DEFAULT 0,
            theme ENUM('light', 'dark') DEFAULT 'light',
            notifications_enabled TINYINT(1) DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 8. Therapy Reminders
        `CREATE TABLE IF NOT EXISTS therapy_reminders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            reminder_time TIME,
            reminder_days VARCHAR(100) DEFAULT 'Daily',
            icon VARCHAR(50) DEFAULT '🔔',
            color VARCHAR(20),
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 9. Medical History
        `CREATE TABLE IF NOT EXISTS medical_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            \`condition\` TEXT,
            medications TEXT,
            allergies TEXT,
            previous_therapy TEXT,
            notes TEXT,
            diagnosed_by VARCHAR(255),
            status VARCHAR(50) DEFAULT 'Active',
            diagnosed_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 10. Medications
        `CREATE TABLE IF NOT EXISTS medications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            dosage VARCHAR(100),
            frequency VARCHAR(100),
            started_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 11. Game Sessions
        `CREATE TABLE IF NOT EXISTS game_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            game_type VARCHAR(100) NOT NULL,
            score INT DEFAULT 0,
            duration_seconds INT DEFAULT 0,
            level_reached INT DEFAULT 1,
            moves_count INT DEFAULT 0,
            completed TINYINT(1) DEFAULT 0,
            stress_reduction FLOAT DEFAULT 0,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 12. User Profiles
        `CREATE TABLE IF NOT EXISTS user_profiles (
            user_id INT PRIMARY KEY,
            city VARCHAR(100),
            country VARCHAR(100),
            emergency_contact_name VARCHAR(100),
            emergency_contact_phone VARCHAR(20),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 13. Therapy Sessions (NEW)
        `CREATE TABLE IF NOT EXISTS therapy_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            exercise_type VARCHAR(100) NOT NULL,
            stress_before INT,
            stress_after INT,
            duration_seconds INT DEFAULT 0,
            completion_percentage INT DEFAULT 0,
            notes TEXT,
            completed TINYINT(1) DEFAULT 0,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    ];

    try {
        for (const query of queries) {
            await pool.query(query);
        }

        // Migration: Check and add columns if they don't exist
        const [columns] = await pool.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map((c) => c.Field);
        
        if (!columnNames.includes('gender')) {
            await pool.query('ALTER TABLE users ADD COLUMN gender VARCHAR(20) AFTER phone');
        }
        if (!columnNames.includes('dob')) {
            await pool.query('ALTER TABLE users ADD COLUMN dob DATE AFTER gender');
        }
        if (!columnNames.includes('can_message')) {
            await pool.query('ALTER TABLE users ADD COLUMN can_message TINYINT(1) DEFAULT 0 AFTER dob');
        }

        // Migration for medical_history
        const [medCols] = await pool.query('SHOW COLUMNS FROM medical_history');
        const medColNames = medCols.map((c) => c.Field);
        if (!medColNames.includes('medications')) {
            await pool.query('ALTER TABLE medical_history ADD COLUMN medications TEXT AFTER \`condition\`');
        }
        if (!medColNames.includes('allergies')) {
            await pool.query('ALTER TABLE medical_history ADD COLUMN allergies TEXT AFTER medications');
        }
        if (!medColNames.includes('previous_therapy')) {
            await pool.query('ALTER TABLE medical_history ADD COLUMN previous_therapy TEXT AFTER allergies');
        }

        console.log('✅ MindBridge Database initialized with PRD v1.0.0 schema');
    } catch (error) {
        console.error('❌ Database Initialization Failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.sql) console.error('Failed SQL:', error.sql);
        throw error;
    }
}

// Ensure the pool is ready before initializing
pool.getConnection()
    .then(async (connection) => {
        connection.release();
        await initializeDatabase();
    })
    .catch(err => {
        console.error('❌ Initial Database Connection Error:', err.message);
    });

module.exports = pool;