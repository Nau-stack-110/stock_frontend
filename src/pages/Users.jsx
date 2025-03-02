import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FaUserShield, FaUserAlt, FaSearch, FaIdCard, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="p-4 lg:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <FaUserShield className="text-blue-500" /> Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">Administration des comptes utilisateurs</p>
        </motion.div>

        {/* Barre de recherche améliorée */}
        <motion.div 
          className="mb-6 bg-white p-4 rounded-xl shadow-lg"
          whileHover={{ y: -2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher par ID, nom, email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center min-w-[120px] flex items-center justify-center">
              {filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>

        {/* Tableau responsive */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FaIdCard /> ID
                    </div>
                  </th>
                  <th className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FaUserAlt /> Nom
                    </div>
                  </th>
                  <th className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FaUserShield /> Rôle
                    </div>
                  </th>
                  <th className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FaEnvelope /> Email
                    </div>
                  </th>
                  <th className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FaPhone /> Téléphone
                    </div>
                  </th>
                  <th className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FaCalendar /> Création
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50 group"
                  >
                    <td className="py-3 px-4 hidden md:table-cell">{user.id}</td>
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 flex justify-center">
                      {getRoleIcon(user.role_id)}
                    </td>
                    <td className="py-3 px-4 break-all">{user.email}</td>
                    <td className="py-3 px-4 hidden md:table-cell">+261{user.tel}</td>
                    <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        <motion.div 
          className="mt-6 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            ← Précédent
          </motion.button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <motion.button
                key={i+1}
                onClick={() => setCurrentPage(i+1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i+1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-50 hover:bg-blue-100'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {i+1}
              </motion.button>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            Suivant →
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Users; 