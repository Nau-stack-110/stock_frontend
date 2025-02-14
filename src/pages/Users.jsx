import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FaUserShield, FaUserAlt, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:4000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Impossible de récupérer les utilisateurs depuis la base de données.",
        });
      });
  }, []);

  // Détermine l'icône et sa couleur en fonction du rôle (role_id)
  const getRoleIcon = (roleId) => {
    if (roleId === 1) {
      return <FaUserShield className="text-blue-500 text-xl" title="Administrateur" />;
    }
    return <FaUserAlt className="text-orange-500 text-xl" title="Vendeur" />;
  };

  // Filtrage amélioré
  const filteredUsers = users.filter(user => {
    const filter = searchFilter.toLowerCase();
    return (
      user.id && user.id.toString().includes(filter) ||
      user.name && (user.name?.toLowerCase().includes(filter)) ||
      user.email && (user.email?.toLowerCase().includes(filter))
    );
  });

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Utilisateurs</h1>
      <p className="mb-4 text-sm md:text-base">Liste des utilisateurs enregistrés.</p>

      {/* Barre de recherche améliorée */}
      <div className="mb-4 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ID, nom, email..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg text-sm md:text-base focus:ring-2 focus:ring-blue-400"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg md:w-48 text-center text-sm md:text-base">
          {filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau responsive */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="py-3 px-2 md:px-4 font-semibold hidden md:table-cell">ID</th>
              <th className="py-3 px-2 md:px-4 font-semibold">Nom</th>
              <th className="py-3 px-2 md:px-4 font-semibold text-center">Rôle</th>
              <th className="py-3 px-2 md:px-4 font-semibold">Email</th>
              <th className="py-3 px-2 md:px-4 font-semibold hidden md:table-cell">Téléphone</th>
              <th className="py-3 px-2 md:px-4 font-semibold hidden md:table-cell">Création</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-2 md:px-4 whitespace-nowrap hidden md:table-cell">{user.id}</td>
                  <td className="py-3 px-2 md:px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-2 md:px-4 flex justify-center">
                    {getRoleIcon(user.role_id)}
                  </td>
                  <td className="py-3 px-2 md:px-4 break-all">{user.email}</td>
                  <td className="py-3 px-2 md:px-4 hidden md:table-cell">+261{user.tel}</td>
                  <td className="py-3 px-2 md:px-4 whitespace-nowrap hidden md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500 text-sm md:text-base">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Users; 