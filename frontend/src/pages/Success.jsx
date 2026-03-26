import { useNavigate } from 'react-router-dom';

export default function Success() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-emerald-100 text-center transform animate-fade-in-up">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                    ✓
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-emerald-700 mb-8 font-medium">
                    Welcome to the Tour. Your account is now fully active.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-8 text-sm text-gray-600 text-left">
                    <p className="mb-2"><strong>Order Status:</strong> Confirmed</p>
                    <p>Your subscription unlocks score tracking and entry into the monthly prize draw.</p>
                </div>

                {/* Move to the Next Page Button */}
                <button 
                    onClick={() => navigate('/charities')}
                    className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 hover:shadow-lg transition-all"
                >
                    Next Step: Select Your Charity ➔
                </button>
            </div>
        </div>
    );
}