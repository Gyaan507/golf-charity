const supabase = require('../config/supabase');

const generateWinningNumbers = () => {
    const nums = new Set();
    while (nums.size < 5) {
        nums.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(nums);
};

const calculateDrawResults = async () => {
    const { data: users, error: usersError } = await supabase.from('users').select('id, name').eq('role', 'subscriber');
    if (usersError || !users.length) throw new Error('No eligible subscribers found.');

    const { data: allScores, error: scoresError } = await supabase.from('scores').select('user_id, stableford_points').order('date', { ascending: false });
if (scoresError) throw new Error(`Database Error: ${scoresError.message}`);

    const userScores = {};
    allScores.forEach(score => {
        if (!userScores[score.user_id]) userScores[score.user_id] = [];
        if (userScores[score.user_id].length < 5) {
            userScores[score.user_id].push(score.stableford_points);
        }
    });

    const basePool = users.length * 5.00;

    const { data: rolloverData } = await supabase.from('system_settings').select('value').eq('key', 'jackpot_rollover').single();
    const rolloverAmount = rolloverData ? parseFloat(rolloverData.value) : 0;

    const winningNumbers = generateWinningNumbers();

    const winners = { match5: [], match4: [], match3: [] };

    users.forEach(user => {
        const scores = userScores[user.id] || [];
        // Count how many of the user's scores are in the winning numbers
        const matchCount = scores.filter(score => winningNumbers.includes(score)).length;

        if (matchCount === 5) winners.match5.push(user);
        if (matchCount === 4) winners.match4.push(user);
        if (matchCount === 3) winners.match3.push(user);
    });

    const tier5Total = (basePool * 0.40) + rolloverAmount;
    const tier4Total = basePool * 0.35;
    const tier3Total = basePool * 0.25;

    const newRollover = winners.match5.length === 0 ? tier5Total : 0;

    return {
        winningNumbers,
        basePool,
        rolloverApplied: rolloverAmount,
        totalPool: basePool + rolloverAmount,
        results: {
            tier5: {
                matches: 5,
                winners: winners.match5,
                payoutPerWinner: winners.match5.length > 0 ? (tier5Total / winners.match5.length) : 0,
                rolledOver: winners.match5.length === 0
            },
            tier4: {
                matches: 4,
                winners: winners.match4,
                payoutPerWinner: winners.match4.length > 0 ? (tier4Total / winners.match4.length) : 0
            },
            tier3: {
                matches: 3,
                winners: winners.match3,
                payoutPerWinner: winners.match3.length > 0 ? (tier3Total / winners.match3.length) : 0
            }
        },
        newRollover
    };
};

const simulateMonthlyDraw = async (req, res) => {
    try {
        const simulation = await calculateDrawResults();
        res.status(200).json({ message: 'Simulation Complete', data: simulation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const executeMonthlyDraw = async (req, res) => {
    try {
        const officialDraw = await calculateDrawResults();

        const { error: drawError } = await supabase.from('draws').insert([{
            prize_amount: officialDraw.totalPool,
            winning_numbers: officialDraw.winningNumbers,
            results: officialDraw.results
        }]);
        if (drawError) throw drawError;

        const { error: rolloverError } = await supabase.from('system_settings')
            .update({ value: officialDraw.newRollover })
            .eq('key', 'jackpot_rollover');
        if (rolloverError) throw rolloverError;

        res.status(200).json({ message: 'Official Draw Executed Successfully!', data: officialDraw });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { simulateMonthlyDraw, executeMonthlyDraw };