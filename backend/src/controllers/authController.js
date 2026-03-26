const supabase = require('../config/supabase');

const registerUser = async (req, res) => {
    const { email, password, name, role = 'subscriber' } = req.body;

    try {
        // 1. Create secure user in Supabase Auth
        console.log(`\n--- New Registration Attempt: ${email} ---`);
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

      if (authError) {
            console.error(" Supabase Auth Error:", authError);
            return res.status(400).json({ error: authError.message });
        }
         console.log("Auth successful! Attempting database insert...");

        // 2. Create the associated profile in our custom users table
        const userId = authData.user.id;
        const { error: userError } = await supabase
            .from('users')
            .insert([{ id: userId, email, name, role }]);

        if (userError) {
            console.error(" Supabase Database Insert Error:", userError);
            return res.status(400).json({ error: userError.message });
        }
                console.log("Registration completely successful!");


        res.status(201).json({ message: 'User registered successfully', user: authData.user });
    } catch (err) {
              console.error("Critical Server Error:", err);

        res.status(500).json({ error: 'Server error during registration' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: 'Login successful', session: data.session });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
};

const logoutUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
        return res.status(400).json({ error: 'No token provided for logout' });
    }

    try {
        const { error } = await supabase
            .from('blacklisted_tokens')
            .insert([{ token }]);

        if (error) {
            // Error code 23505 means unique constraint violation (token is already blacklisted)
            if (error.code === '23505') {
                return res.status(200).json({ message: 'Token is already invalidated' });
            }
            throw error;
        }

        console.log('Token successfully blacklisted');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout Error:', err);
        res.status(500).json({ error: 'Server error during logout' });
    }
};

module.exports = { registerUser, loginUser, logoutUser };
