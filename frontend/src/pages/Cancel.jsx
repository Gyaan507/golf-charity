import { useNavigate } from 'react-router-dom';

export default function Cancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Cancelled</h2>
                <p className="text-gray-500 mb-8">
                    Your payment was not processed and you haven't been charged. You can complete your subscription whenever you're ready.
                </p>
                
                {/* The Back Button Option */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}