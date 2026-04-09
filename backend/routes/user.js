// routes/user.js - MYSQL VERSION
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ============================================
// GET user profile
// ============================================
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    console.log('📊 Fetching MySQL profile for user ID:', userId);

    const [users] = await db.query(`
      SELECT 
        u.id, u.email, u.display_name, u.role, u.phone, u.gender, u.dob, u.created_at, u.can_message,
        up.city, up.country, up.emergency_contact_name, up.emergency_contact_phone
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ?
    `, [userId]);

    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Get latest stress level
    const [stressLogs] = await db.query(
      'SELECT score FROM stress_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 1',
      [userId]
    );

    user.stressLevel = stressLogs.length > 0 ? stressLogs[0].score : 50;

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Profile fetch error:', error.message);
    res.status(500).json({ success: false, message: 'MySQL error', error: error.message });
  }
});

// ============================================
// UPDATE user profile
// ============================================
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { 
      name, phone, gender, dob,
      city, country, emergencyContactName, emergencyContactPhone
    } = req.body;

    // Update users table
    await db.query(
      'UPDATE users SET display_name = ?, phone = ?, gender = ?, dob = ? WHERE id = ?',
      [name, phone, gender, dob, userId]
    );

    // Update or Insert into user_profiles table using UPSERT equivalent in MySQL
    await db.query(`
      INSERT INTO user_profiles (user_id, city, country, emergency_contact_name, emergency_contact_phone)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        city = VALUES(city),
        country = VALUES(country),
        emergency_contact_name = VALUES(emergency_contact_name),
        emergency_contact_phone = VALUES(emergency_contact_phone)
    `, [userId, city, country, emergencyContactName, emergencyContactPhone]);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('❌ Profile update error:', error.message);
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});

// ============================================
// GET user statistics
// ============================================
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const [chats] = await db.query('SELECT COUNT(*) as count FROM chat_sessions WHERE user_id = ?', [userId]);
    const [games] = await db.query('SELECT COUNT(*) as count FROM game_sessions WHERE user_id = ?', [userId]);
    const [stress] = await db.query('SELECT COUNT(*) as count FROM stress_logs WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      stats: {
        chatSessions: chats[0].count,
        therapySessions: 0, 
        gamesPlayed: games[0].count,
        currentStreak: stress[0].count
      }
    });
  } catch (error) {
    console.error('❌ Stats error:', error.message);
    res.status(500).json({ success: false, message: 'Stats failed' });
  }
});

module.exports = router;


// Get messages for user (with their psychiatrist)
router.get('/messages/:psychiatristId', authenticate, async (req, res) => {
    try {
        const [msgs] = await db.execute(
            'SELECT dm.*, u.display_name as sender_name FROM direct_messages dm JOIN users u ON dm.sender_id = u.id WHERE (dm.sender_id = ? AND dm.receiver_id = ?) OR (dm.sender_id = ? AND dm.receiver_id = ?) ORDER BY dm.created_at ASC',
            [req.user.userId, req.params.psychiatristId, req.params.psychiatristId, req.user.userId]
        );
        res.json({ success: true, data: msgs });
    } catch (err) {
        console.error(err);
        res.json({ success: false, data: [] });
    }
});

// Send message to psychiatrist
router.post('/messages/:psychiatristId', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        await db.execute(
            'INSERT INTO direct_messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, NOW())',
            [req.user.userId, req.params.psychiatristId, content]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});
