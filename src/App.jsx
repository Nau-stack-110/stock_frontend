import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import StockAlerts from './pages/StockAlerts';
import Users from './pages/Users';
import SellerDashboard from './pages/SellerDashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import { jwtDecode } from 'jwt-decode';

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  
  if (!token) return <Navigate to="/login" />;
  
  const decoded = jwtDecode(token);
  if (requiredRole && decoded.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={
          <PrivateRoute requiredRole={1}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reports" element={<Reports />} />
          <Route path="alerts" element={<StockAlerts />} />
          <Route path="users" element={<Users />} />
        </Route>
        
        <Route path="/seller" element={
          <PrivateRoute requiredRole={2}>
            <SellerDashboard />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
  );
};

export default App;




















