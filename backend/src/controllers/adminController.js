
const supabase = require('../config/supabase');

// 1. Fetch Top-Level Analytics
const getDashboardMetrics = async (req, res) => {
    try {
        // Metric A: Total Subscribers
        const { count: totalUsers, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'subscriber');
            
        if (usersError) throw usersError;

        // Metric B: Total Historical Prize Pool Distributed
        const { data: draws, error: drawsError } = await supabase
            .from('draws')
            .select('prize_amount');
            
        if (drawsError) throw drawsError;
        const totalPrizePool = draws.reduce((sum, draw) => sum + parseFloat(draw.prize_amount || 0), 0);

        // Metric C: Current Jackpot Rollover (From our system_settings table)
        const { data: rolloverData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'jackpot_rollover')
            .single();
        const currentRollover = rolloverData ? parseFloat(rolloverData.value) : 0;

        // Metric D: Estimated Monthly Charity Contribution
        // (Assuming $10/month per active user, and averaging the standard 10% minimum)
        const estimatedMonthlyCharity = (totalUsers * 10.00) * 0.10;

        res.status(200).json({
            totalUsers: totalUsers || 0,
            totalPrizePoolDistributed: totalPrizePool,
            currentRollover: currentRollover,
            estimatedMonthlyCharity: estimatedMonthlyCharity
        });

    } catch (error) {
        console.error('Admin Metrics Error:', error);
        res.status(500).json({ error: 'Failed to fetch admin metrics' });
    }
};

// 2. Fetch All Users for the Management Table
const getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, charity_contribution_pct, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(users);
    } catch (error) {
        console.error('Admin Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

module.exports = { getDashboardMetrics, getAllUsers };