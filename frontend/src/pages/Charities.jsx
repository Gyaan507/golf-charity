import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api';

export default function Charities() {
    const [charities, setCharities] = useState([]);
    const [selectedCharity, setSelectedCharity] = useState(null);
    const [contributionPct, setContributionPct] = useState(10); // Default to the 10% minimum
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch the directory when the page loads
    useEffect(() => {
        const loadCharities = async () => {
            try {
                const data = await fetchAPI('/charities');
                setCharities(data);
            } catch (err) {
                setError('Failed to load charities. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadCharities();
    }, []);

    const handleSave = async () => {
        if (!selectedCharity) {
            setError('Please select a charity first.');
            return;
        }
        
        setSaving(true);
        setError('');
        
        try {
            await fetchAPI('/charities/select', {
                method: 'POST',
                body: JSON.stringify({ 
                    charityId: selectedCharity, 
                    contributionPct: parseInt(contributionPct) 
                })
            });
            
            // Success! Send them back to their dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to save your preference.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Simple Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Choose Your Cause</h1>
                        <p className="text-gray-500 mt-1">Select where your monthly contribution goes.</p>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-4xl w-full mx-auto px-8 py-8">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">{error}</div>}
                
                {loading ? (
                    <div className="text-center text-gray-500 py-12">Loading charities...</div>
                ) : (
                    <div className="grid gap-6">
                        {/* Charity List */}
                        {charities.map((charity) => (
                            <div 
                                key={charity.id}
                                onClick={() => setSelectedCharity(charity.id)}
                                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                                    selectedCharity === charity.id 
                                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md transform -translate-y-1' 
                                        : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{charity.name}</h3>
                                            {charity.is_featured && (
                                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">FEATURED</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600">{charity.description}</p>
                                    </div>
                                    {/* Selection Indicator */}
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        selectedCharity === charity.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                    }`}>
                                        {selectedCharity === charity.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Contribution Slider */}
                        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Set Your Contribution</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                A minimum of 10% of your subscription fee goes directly to your selected charity. You can choose to give more!
                            </p>
                            
                            <div className="flex items-center gap-6">
                                <input 
                                    type="range" 
                                    min="10" 
                                    max="100" 
                                    value={contributionPct} 
                                    onChange={(e) => setContributionPct(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <div className="text-2xl font-extrabold text-emerald-600 w-20 text-right">
                                    {contributionPct}%
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={saving || !selectedCharity}
                                className="w-full mt-8 bg-gray-900 text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Confirm Selection & Return to Dashboard'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}