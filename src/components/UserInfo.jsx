import { jwtDecode } from 'jwt-decode';
import { FaUser } from 'react-icons/fa';

const UserInfo = () => {
  const token = localStorage.getItem('token');
  let email = '';
  let role = '';

  if (token) {
    try {
      const decoded = jwtDecode(token);
      email = decoded.email || '';
      role = decoded.role === 1 ? "Administrateur" : "Vendeur";
    } catch (error) {
      console.error("Erreur lors du décodage du token :", error);
    }
  }

  //const initial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <div className="bg-gray-800 text-white p-2 mr-6 rounded shadow flex items-center space-x-2 justify-center mx-auto md:mx-4">
      {/* Avatar - icône avec fond arrondi */}
      <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
        <FaUser className="text-white text-lg" />
      </div>
      
      <div className="hidden sm:flex sm:flex-col">
        <p className="text-sm font-medium">{email}</p>
        <p className="text-xs text-gray-300">{role}</p>
      </div>
    
    </div>
  );
};

export default UserInfo; 