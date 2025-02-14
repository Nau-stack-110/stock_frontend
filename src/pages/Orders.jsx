import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import DatePicker from "react-datepicker";
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import "react-datepicker/dist/react-datepicker.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' ou 'oldest'
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Non authentifié',
            text: 'Veuillez vous connecter.',
          });
          return;
        }
        const response = await axios.get('http://localhost:4000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
     
        setOrders(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const filter = searchFilter.toLowerCase();
    const orderDate = new Date(order.createdAt);
    
    // Filtre par date
    const dateInRange = (!startDate || orderDate >= startDate) && 
                        (!endDate || orderDate <= endDate);

    // Filtre par recherche
    const searchMatch = order.id.toString().includes(filter) ||
                       (order.User?.name.toLowerCase().includes(filter)) ||
                       order.status.toLowerCase().includes(filter);

    return dateInRange && searchMatch;
  });

  // Tri des résultats par date
  const sortedOrders = filteredOrders.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      className="p-4"
    >
      <h1 className="text-3xl font-bold mb-4">Commandes</h1>
      <p className="mb-4">Visualisez les commandes passées à la pharmacie.</p>

      {/* Barre de recherche et filtres */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Recherchez par ID, client ou statut..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1">
            <DatePicker
              selected={startDate}
              onChange={(dates) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end);
              }}
              selectsRange
              startDate={startDate}
              endDate={endDate}
              placeholderText="Filtrer par période"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              dateFormat="dd/MM/yyyy"
              locale="fr"
            />
            <FaCalendarAlt className="text-gray-400" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <FaCalendarAlt className="mr-2" />
              {sortOrder === 'newest' ? 'Plus récentes' : 'Plus anciennes'}
            </button>
            
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center min-w-[120px]">
              {filteredOrders.length} résultat{filteredOrders.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="py-3 px-4 font-semibold hidden md:table-cell">ID</th>
              <th className="py-3 px-4 font-semibold">Vendeur</th>
              <th className="py-3 px-4 font-semibold">Total (Ar)</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Statut</th>
              <th className="py-3 px-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 hidden md:table-cell">{order.id}</td>
                  <td className="py-3 px-4 font-medium">
                    {order.User ? order.User.name : '-'}
                  </td>
                  <td className="py-3 px-4">{order.prix_total}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  Aucune commande ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Orders; 