import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import DatePicker from "react-datepicker";
import { FaSearch, FaCalendarAlt, FaReceipt, FaUser, FaBox, FaCoins, FaCalendarDay } from 'react-icons/fa';
import Swal from 'sweetalert2';
import "react-datepicker/dist/react-datepicker.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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

        const [ordersResponse, productsResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:4000/api/products', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : [ordersResponse.data]);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    fetchData();
  }, []);

  const filteredOrders = orders.filter(order => {
    const filter = searchFilter.toLowerCase();
    const orderDate = new Date(order.createdAt);
    
    // Filtre par date
    const dateInRange = (!startDate || orderDate >= startDate) && 
                        (!endDate || orderDate <= endDate);

    // Filtre par recherche
    const searchMatch = order.id.toString().includes(filter) ||
                       (order.User?.name.toLowerCase().includes(filter));

    return dateInRange && searchMatch;
  });

  // Tri des résultats par date
  const sortedOrders = filteredOrders.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      className="p-4 lg:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <FaReceipt className="text-blue-500" /> Historique des Commandes
          </h1>
          <p className="text-gray-600">Suivi des transactions et gestion des ventes</p>
        </motion.div>

        {/* Filtres améliorés */}
        <motion.div 
          className="mb-6 bg-white p-4 rounded-xl shadow-lg"
          whileHover={{ y: -2 }}
        >
          <div className="mb-4 flex flex-col gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Recherchez par ID, Vendeur..."
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
        </motion.div>

        {/* Tableau responsive */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
        >
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="py-4 px-4 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <FaReceipt /> ID
                  </div>
                </th>
                <th className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <FaUser /> Vendeur
                  </div>
                </th>
                <th className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <FaCoins /> Total
                  </div>
                </th>
                <th className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <FaBox /> Produit
                  </div>
                </th>
                <th className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <FaBox className="opacity-0" /> Quantité
                  </div>
                </th>
                <th className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarDay /> Date
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-blue-50 group border-b"
                >
                  <td className="py-3 px-4 text-center md:text-left">
                    <div className="md:hidden font-semibold mb-1 flex items-center gap-2">
                      <FaReceipt /> ID
                    </div>
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-center md:text-left">
                    <div className="md:hidden font-semibold mb-1 flex items-center gap-2">
                      <FaUser /> Vendeur
                    </div>
                    {order.User ? order.User.name : '-'}
                  </td>
                  <td className="py-3 px-4 text-center md:text-left">
                    <div className="md:hidden font-semibold mb-1 flex items-center gap-2">
                      <FaCoins /> Total
                    </div>
                    {order.prix_total}
                  </td>
                  <td className="py-3 px-4 text-center md:text-left">
                    <div className="md:hidden font-semibold mb-1 flex items-center gap-2">
                      <FaBox /> Produit
                    </div>
                    {order.OrderDetails && order.OrderDetails.length > 0 ? (
                      products.find(p => p.id === order.OrderDetails[0].product_id)?.nom || 'Produit inconnu'
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center md:text-left">
                    <div className="md:hidden font-semibold mb-1 flex items-center gap-2">
                      <FaBox className="opacity-0" /> Quantité
                    </div>
                    {order.OrderDetails[0]?.quantite || '-'}
                  </td>
                  <td className="py-3 px-4 text-center md:text-left">
                    <div className="md:hidden font-semibold mb-1 flex items-center gap-2">
                      <FaCalendarDay /> Date
                    </div>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Pagination améliorée */}
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

export default Orders; 