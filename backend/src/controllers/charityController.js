const supabase = require('../config/supabase');

// Fetch all charities (Public access)
const getCharities = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('charities')
            .select('*')
            .order('is_featured', { ascending: false }); // Put featured ones at the top

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Charity Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch charities' });
    }
};

// Update user's charity preference (Protected access)
const selectCharity = async (req, res) => {
    const { charityId, contributionPct } = req.body;
    const userId = req.user.id; // From our auth bouncer

    // 1. Strict Validation: Enforce the 10% minimum rule
    if (!charityId) {
        return res.status(400).json({ error: 'Charity ID is required' });
    }
    if (contributionPct < 10) {
        return res.status(400).json({ error: 'Minimum contribution must be at least 10%' });
    }

    try {
        // 2. Update the user's profile in the database
        const { error } = await supabase
            .from('users')
            .update({ 
                charity_id: charityId, 
                charity_contribution_pct: contributionPct 
            })
            .eq('id', userId);

        if (error) throw error;

        res.status(200).json({ message: 'Charity preferences successfully updated!' });
    } catch (error) {
        console.error('Charity Update Error:', error);
        res.status(500).json({ error: 'Failed to update charity preferences' });
    }
};

module.exports = { getCharities, selectCharity };