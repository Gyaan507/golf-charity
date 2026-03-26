import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAPI } from '../services/api';

export default function Dashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('subscriber');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // Plan Loading State
    const [loadingPlan, setLoadingPlan] = useState(null);
    
    // Admin States
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawResult, setDrawResult] = useState(null);

    // --- NEW: Score Logging States ---
    const [scores, setScores] = useState([]);
    const [submittingScore, setSubmittingScore] = useState(false);
    const [scoreForm, setScoreForm] = useState({
        date: new Date().toISOString().split('T')[0], // Defaults to today
        courseName: '',
        strokes: '',
        stablefordPoints: ''
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 1. Load Profile
                const profileData = await fetchAPI('/auth/profile');
                setUserName(profileData.name || 'Golfer');
                setUserRole(profileData.role || 'subscriber');

                // 2. If it's a normal user, load their score history
                if (profileData.role !== 'admin') {
                    const scoreData = await fetchAPI('/scores');
                    setScores(scoreData);
                }
            } catch (error) {
                console.error('Failed to load dashboard data', error);
                setUserName('Golfer');
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetchAPI('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const handleSubscribe = async (planType) => {
        setLoadingPlan(planType);
        try {
            const data = await fetchAPI('/subscriptions/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({ planType })
            });
            if (data.url) window.location.href = data.url; 
        } catch (error) {
            alert(error.message || 'Failed to initialize checkout');
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleExecuteDraw = async () => {
        setIsDrawing(true);
        setDrawResult(null);
        try {
            const data = await fetchAPI('/draws/execute', { method: 'POST' });
            setDrawResult(data);
        } catch (error) {
            alert(error.message || 'Failed to execute draw.');
        } finally {
            setIsDrawing(false);
        }
    };

    // --- NEW: Submit Score Logic ---
    const handleScoreSubmit = async (e) => {
        e.preventDefault();
        setSubmittingScore(true);
        try {
            await fetchAPI('/scores', {
                method: 'POST',
                body: JSON.stringify({
                    date: scoreForm.date,
                    courseName: scoreForm.courseName,
                    strokes: parseInt(scoreForm.strokes),
                    stablefordPoints: parseInt(scoreForm.stablefordPoints)
                })
            });
            
            // Clear the form and reload the scores!
            setScoreForm({ ...scoreForm, courseName: '', strokes: '', stablefordPoints: '' });
            const updatedScores = await fetchAPI('/scores');
            setScores(updatedScores);
            alert('Score successfully logged! ⛳');
        } catch (error) {
            alert(error.message || 'Failed to submit score.');
        } finally {
            setSubmittingScore(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
                    <span className="text-xl font-bold text-gray-800">Golf Charity</span>
                    {userRole === 'admin' && <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">ADMIN</span>}
                </div>
                
                <div className="flex items-center gap-6">
                    <span className="text-sm font-medium text-gray-600">
                        {isLoading ? 'Loading...' : `Hello, ${userName}`}
                    </span>
                    
                    {/* --- NEW: The Charity Button (Hidden from Admins) --- */}
                    {userRole !== 'admin' && (
                        <Link to="/charities" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                            Manage Charity
                        </Link>
                    )}

                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="cursor-pointer text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-8 py-12">
                {userRole === 'admin' ? (
                    /* ADMIN UI */
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Control Center</h1>
                        <p className="text-gray-500 mb-8">Manage the charity tour and execute monthly events.</p>
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 text-center">
                            <h2 className="text-2xl font-bold text-purple-900 mb-4">Monthly Prize Draw</h2>
                            <button onClick={handleExecuteDraw} disabled={isDrawing} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50">
                                {isDrawing ? 'Calculating...' : 'Execute Official Draw 🎲'}
                            </button>
                            {drawResult && (
                                <div className="mt-8 bg-white p-6 rounded-lg text-left shadow-sm">
                                    <h3 className="text-lg font-bold text-green-600 mb-2">✅ Draw Successful</h3>
                                    <p><strong>Winner:</strong> {drawResult.winnerName}</p>
                                    <p><strong>Prize Pool:</strong> ${drawResult.prize_amount.toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* NORMAL USER UI */
                    <div className="space-y-12">
                        
                        {/* 1. Score Logging Section */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900">Log a Round</h2>
                                    <p className="text-gray-500 text-sm">Submit your latest 18-hole Stableford score.</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleScoreSubmit} className="grid md:grid-cols-5 gap-4 items-end">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Date</label>
                                    <input type="date" required value={scoreForm.date} onChange={(e) => setScoreForm({...scoreForm, date: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Course Name</label>
                                    <input type="text" placeholder="e.g. Pebble Beach" required value={scoreForm.courseName} onChange={(e) => setScoreForm({...scoreForm, courseName: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Strokes</label>
                                    <input type="number" min="1" required value={scoreForm.strokes} onChange={(e) => setScoreForm({...scoreForm, strokes: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Points</label>
                                    <input type="number" min="0" required value={scoreForm.stablefordPoints} onChange={(e) => setScoreForm({...scoreForm, stablefordPoints: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="col-span-5 mt-2">
                                    <button type="submit" disabled={submittingScore} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                        {submittingScore ? 'Logging Score...' : 'Submit Round'}
                                    </button>
                                </div>
                            </form>

                            {/* Recent Scores Display */}
                            {scores.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Your Recent Rounds</h3>
                                    <div className="space-y-3">
                                        {scores.map((score) => (
                                            <div key={score.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="font-bold text-gray-900">{score.course_name}</p>
                                                    <p className="text-xs text-gray-500">{new Date(score.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-extrabold text-emerald-600">{score.stableford_points} pts</p>
                                                    <p className="text-xs text-gray-500">{score.strokes} strokes</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Subscription Plans Section */}
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Subscription Status</h2>
                            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Monthly Tour</h3>
                                    <div className="mb-4"><span className="text-3xl font-extrabold text-gray-900">$10</span><span className="text-gray-500">/mo</span></div>
                                    <button onClick={() => handleSubscribe('monthly')} disabled={loadingPlan !== null} className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70">
                                        {loadingPlan === 'monthly' ? 'Loading...' : 'Subscribe'}
                                    </button>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-200">
                                    <h3 className="text-lg font-bold text-emerald-900 mb-2">Annual Pass</h3>
                                    <div className="mb-4"><span className="text-3xl font-extrabold text-gray-900">$100</span><span className="text-gray-500">/yr</span></div>
                                    <button onClick={() => handleSubscribe('yearly')} disabled={loadingPlan !== null} className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70">
                                        {loadingPlan === 'yearly' ? 'Loading...' : 'Subscribe'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}