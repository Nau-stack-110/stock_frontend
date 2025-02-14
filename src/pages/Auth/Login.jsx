import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import {jwtDecode}from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      const decoded = jwtDecode(response.data.token);

      if(decoded.role === 1) {
        navigate('/');
      } else if(decoded.role === 2) {
        navigate('/seller');
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Connexion réussie!',
        showConfirmButton: false,
        timer: 1500
      });

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: error.response?.data?.message || 'Identifiants incorrects'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100"
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          🏥 Connexion
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div whileFocus={{ scale: 1.02 }}>
            <div className="flex items-center border-b border-gray-300 pb-2">
              <FaEnvelope className="text-gray-500 mr-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none bg-transparent"
                placeholder="Entrez votre email"
                required
              />
            </div>
          </motion.div>

          <motion.div whileFocus={{ scale: 1.02 }}>
            <div className="flex items-center border-b border-gray-300 pb-2">
              <FaLock className="text-gray-500 mr-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none bg-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg"
          >
            🔑 Se connecter
          </motion.button>

          <p className="text-center text-sm text-gray-600">
            Pas de compte?{' '}
            <Link 
              to="/signup" 
              className="text-blue-600 hover:underline font-medium"
            >
              Créez un compte ici
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default Login; 