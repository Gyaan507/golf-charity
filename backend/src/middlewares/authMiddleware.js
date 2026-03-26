const supabase = require('../config/supabase');

// Bouncer 1: Are you logged in?
const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

const { data: blacklistedToken } = await supabase
        .from('blacklisted_tokens')
        .select('id')
        .eq('token', token)
        .single();

    if (blacklistedToken) {
        return res.status(401).json({ error: 'Unauthorized: Token has been revoked. Please log in again.' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    req.user = user; 
    next();
};

// Bouncer 2: Do you have the right VIP role?
const requireRole = (requiredRole) => {
    return async (req, res, next) => {
        const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !userData) return res.status(403).json({ error: 'Forbidden: Profile not found' });

        // Admins override everything. Otherwise, the role must match.
        if (userData.role !== requiredRole && userData.role !== 'admin') {
            return res.status(403).json({ error: `Forbidden: Requires ${requiredRole} access` });
        }

        req.user.role = userData.role; 
        next();
    };
};

module.exports = { requireAuth, requireRole };