import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tel: '',
    password: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (pass.match(/[A-Z]/)) strength += 1;
    if (pass.match(/[0-9]/)) strength += 1;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    if (e.target.name === 'password') {
      checkPasswordStrength(e.target.value);
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        tel: String(formData.tel)
      };

      await axios.post(
        'http://localhost:4000/api/auth/signup',
        submissionData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      await Swal.fire({
        icon: 'success',
        title: 'Inscription réussie!',
        text: 'Vous pouvez maintenant vous connecter',
        showConfirmButton: true
      });
      
      navigate('/login');

    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur d\'inscription',
        text: error.response?.data?.message || 'Une erreur est survenue'
      });
    }
  };

  const strengthLabels = {
    0: { text: 'Faible', color: 'bg-red-500', width: 'w-1/4' },
    1: { text: 'Moyen', color: 'bg-yellow-500', width: 'w-1/2' },
    2: { text: 'Bon', color: 'bg-blue-500', width: 'w-3/4' },
    3: { text: 'Fort', color: 'bg-green-500', width: 'w-full' },
    4: { text: 'Très fort', color: 'bg-green-600', width: 'w-full' }
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
          🏥 Inscription
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-2" />
              Téléphone
            </label>
            <input
              type="tel"
              name="tel"
              onChange={handleChange}
              pattern="[0-9]{10}"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <FaLock className="text-gray-500 mr-3" />
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                  placeholder="Créez un mot de passe"
                  required
                />
              </div>
            </motion.div>
            
            {formData.password && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${strengthLabels[passwordStrength]?.color} 
                    ${strengthLabels[passwordStrength]?.width} transition-all duration-500`}
                  />
                </div>
                <p className="text-sm mt-1 text-gray-600">
                  Sécurité: {strengthLabels[passwordStrength]?.text} 
                  {passwordStrength >= 3 ? ' 🔒' : ' ⚠️'}
                </p>
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg"
          >
            🎉 S&apos;inscrire
          </motion.button>
          <p className="text-center text-sm text-gray-600">
            Déjà inscrit?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Connectez-vous ici
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default Signup; 