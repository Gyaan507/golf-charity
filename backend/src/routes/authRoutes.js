const express = require('express');
const { registerUser, loginUser,logoutUser } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware'); 
const supabase = require('../config/supabase');


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', requireAuth, logoutUser); 


// router.get('/profile', requireAuth, (req, res) => {
//     res.json({ message: 'Welcome to your profile!', userId: req.user.id });
// });

router.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard!' });
});

router.get('/profile', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('name,role')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        
        res.json({ name: data.name, role:data.role});
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

module.exports = router;