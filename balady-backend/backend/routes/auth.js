const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Environment Variable Admin Check (Always works as a backdoor/primary)
        const adminUser = process.env.ADMIN_USERNAME || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || '123456';

        if (username === adminUser && password === adminPass) {
            const token = jwt.sign({ id: 'static_admin_id', username: adminUser }, process.env.JWT_SECRET, { expiresIn: '8h' });
            return res.json({ token });
        }

        // 2. Database Check
        const admin = await Admin.findOne({ username });
        if (admin) {
            const ok = await bcrypt.compare(password, admin.passwordHash);
            if (ok) {
                const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
                return res.json({ token });
            }
        }

        return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/change-password', async (req, res) => {
    try {
        const { username, newPassword, masterKey } = req.body;

        // Check Master Key
        const configuredMasterKey = process.env.MASTER_KEY || 'Shimaa666!';
        if (masterKey !== configuredMasterKey) {
            return res.status(401).json({ message: 'الماستر كاي غير صحيح' });
        }

        if (!username || !newPassword) {
            return res.status(400).json({ message: 'يجب إدخال اسم المستخدم وكلمة المرور' });
        }

        // Hash new password
        const hash = await bcrypt.hash(newPassword, 10);

        // Update or create user in DB
        await Admin.findOneAndUpdate(
            { username },
            { username, passwordHash: hash },
            { upsert: true, new: true }
        );

        res.json({ message: 'تم تغيير كلمة المرور بنجاح!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;