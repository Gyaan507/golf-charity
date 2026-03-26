import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Charities from './pages/Charities';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/register" element={<Register />} />
        
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
          } 
          />
          <Route 
            path="/success" 
            element={ <ProtectedRoute><Success /></ProtectedRoute> } 
        />
        <Route 
            path="/cancel" 
            element={ <ProtectedRoute><Cancel /></ProtectedRoute> } 
        />

        <Route 
            path="/charities" 
            element={ <ProtectedRoute><Charities /></ProtectedRoute> } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;