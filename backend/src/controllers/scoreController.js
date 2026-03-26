const supabase = require('../config/supabase');

const addScore = async (req, res) => {
    const { score, date_played } = req.body;
    const userId = req.user.id; 
    // 1. Strict Validation
    if (!score || !date_played) {
        return res.status(400).json({ error: 'Score and date_played are required' });
    }
    if (score < 1 || score > 45) {
        return res.status(400).json({ error: 'Score must be in Stableford format (1-45)' });
    }

    try {
        // 2. Insert the new score
        const { error: insertError } = await supabase
            .from('scores')
            .insert([{ user_id: userId, score, date_played }]);

        if (insertError) throw insertError;

       
        const { data: userScores, error: fetchError } = await supabase
            .from('scores')
            .select('id')
            .eq('user_id', userId)
            .order('date_played', { ascending: true }); 

        if (fetchError) throw fetchError;

        // If they have more than 5, slice off the oldest ones and delete them
        if (userScores.length > 5) {
            const scoresToDelete = userScores.slice(0, userScores.length - 5);
            const idsToDelete = scoresToDelete.map(s => s.id);

            const { error: deleteError } = await supabase
                .from('scores')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) throw deleteError;
        }

        res.status(201).json({ message: 'Score logged successfully and rolling list updated!' });
    } catch (error) {
        console.error('Score Error:', error);
        res.status(500).json({ error: 'Failed to process score' });
    }
};

const getMyScores = async (req, res) => {
    const userId = req.user.id;

    try {
        // 4. Fetch the latest 5 scores in reverse chronological order
        const { data, error } = await supabase
            .from('scores')
            .select('*')
            .eq('user_id', userId)
            .order('date_played', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Fetch Score Error:', error);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
};

module.exports = { addScore, getMyScores };