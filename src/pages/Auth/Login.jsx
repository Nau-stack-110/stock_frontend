import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value.length >= 6);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.post(`${baseUrl}/api/auth/login`, { email, password });
      
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
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-4"
    >
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex-col md:flex-row">
        {/* Left Section - Branding */}
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white flex flex-col justify-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-6">🏥</div>
            <h1 className="text-3xl font-bold mb-4">Bienvenue sur MedStock</h1>
            <p className="text-lg opacity-90">
              Gestion intelligente de stock pharmaceutique
            </p>
          </motion.div>
        </motion.div>

        {/* Right Section - Form */}
        <motion.div
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          className="w-full md:w-1/2 p-8 md:p-12"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold mb-8 text-center text-gray-800"
          >
            Connexion
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="flex items-center border-b border-gray-300 pb-2">
                  <FaEnvelope className="text-gray-500 mr-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => setEmailValid(validateEmail(email))}
                    className="w-full outline-none bg-transparent pr-8"
                    placeholder="Entrez votre email"
                    required
                  />
                  {emailValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-2 top-2 text-green-500"
                    >
                      <FaCheck />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="flex items-center border-b border-gray-300 pb-2">
                  <FaLock className="text-gray-500 mr-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => setPasswordValid(password.length >= 6)}
                    className="w-full outline-none bg-transparent pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {passwordValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-10 top-2 text-green-500"
                    >
                      <FaCheck />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg"
            >
              🔑 Se connecter
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-sm text-gray-600"
            >
              Pas de compte?{' '}
              <Link 
                to="/signup" 
                className="text-blue-600 hover:underline font-medium"
              >
                Créez un compte ici
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login; 