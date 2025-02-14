import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FaShoppingCart, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';

const SellerDashboard = () => {
  // État pour le nom et l'id du vendeur connecté
  const [sellerName, setSellerName] = useState("");
  const [sellerId, setSellerId] = useState(null);

  // Liste initiale des produits avec leur stock (les vendeurs ne modifient pas directement ces valeurs)
  const [products, setProducts] = useState([]);
  
  // États pour le formulaire de vente
  const [selectedProduct, setSelectedProduct] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('');
  
  // Liste des ventes / commandes enregistrées
  const [orders, setOrders] = useState([]);
  
  const API_URL = 'http://localhost:4000/api';

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    // Vous pouvez rediriger l'utilisateur vers la page de connexion
    window.location.href = '/login';
  };

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
        
        // Récupération des informations utilisateur
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSellerName(userResponse.data.name);
        setSellerId(userResponse.data.id);

        const productsResponse = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(productsResponse.data);

        const ordersResponse = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(ordersResponse.data);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.response?.data?.message || 'Impossible de charger la page',
        });
      }
    };
    fetchData();
  }, []);

  // Enregistrement d'une vente
  const handleSaleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !saleQuantity || saleQuantity <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Champs manquant ou invalide',
        text: 'Veuillez sélectionner un produit et saisir une quantité valide.',
      });
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Non authentifié',
        text: 'Veuillez vous connecter pour effectuer une vente.',
      });
      return;
    }
    
    const productId = parseInt(selectedProduct, 10);
    const quantity = parseInt(saleQuantity, 10);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      Swal.fire({
        icon: 'error',
        title: 'Produit non trouvé',
        text: 'Le produit sélectionné n\'existe pas.',
      });
      return;
    }
    
    if (quantity > product.quantite) {
      Swal.fire({
        icon: 'error',
        title: 'Stock insuffisant',
        text: `Le stock disponible pour ${product.nom} est insuffisant.`,
      });
      return;
    }
    
    try {
      // Appel au nouvel endpoint pour créer la commande/vente
      await axios.post(`${API_URL}/orders`, {
        orderDetails: [{
          product_id: productId,
          quantite: quantity
        }]
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Rafraîchir les données après la création
      const [productsResponse, ordersResponse] = await Promise.all([
        axios.get(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setProducts(productsResponse.data);
      setOrders(ordersResponse.data);

      // Réinitialisation du formulaire
      setSelectedProduct('');
      setSaleQuantity('');
      
      Swal.fire({
        icon: 'success',
        title: 'Vente enregistrée',
        text: 'La vente a été enregistrée avec succès.',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error("Erreur lors de la création de la vente :", err);
      Swal.fire('Erreur', err.response?.data?.message || 'Échec de la vente', 'error');
    }
  };

  // Filtrer les commandes propres à l'utilisateur connecté
  const userOrders = sellerId
    ? orders.filter(order => order.User && order.User.id === sellerId)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="min-h-screen bg-gray-100 py-4"
    >
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* En-tête sticky */}
        <header className="bg-white p-4 rounded shadow-md flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold">Dashboard Vendeur</h1>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-300"
          >
            Déconnexion
          </button>
        </header>
        
        {/* Informations du vendeur */}
        <p className="text-center text-lg font-medium">
          Connecté en tant que : <span className="font-bold">{sellerName}</span>
        </p>
        
        {/* Sections Vente et Stocks côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section vente d'un produit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded shadow hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaShoppingCart className="mr-2" />
              Vendre un produit
            </h2>
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Produit</label>
                <select 
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Sélectionnez un produit --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Quantité</label>
                <input 
                  type="number"
                  min="1"
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Saisir la quantité"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-300"
              >
                <FaShoppingCart />
                Enregistrer la vente
              </motion.button>
            </form>
          </motion.div>
          
          {/* Section des stocks actuels */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded shadow hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaBoxOpen className="mr-2" />
              Stocks Actuels
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4 border">Produit</th>
                    <th className="py-2 px-4 border">Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="text-center hover:bg-gray-50">
                      <td className="py-2 px-4 border">{product.nom}</td>
                      <td className="py-2 px-4 border">{product.quantite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Section commandes/ventes avec conteneur scrollable pour limiter la hauteur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded shadow hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaShoppingCart className="mr-2" />
            Vos commandes / ventes
          </h2>
          <div className="overflow-x-auto max-h-80">
            <table className="min-w-full bg-white table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">ID Commande</th>
                  <th className="py-2 px-4 border">Statut</th>
                  <th className="py-2 px-4 border">Prix total</th>
                  <th className="py-2 px-4 border">Quantité Vendue</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.length > 0 ? (
                  userOrders.map(order => {
                    let soldQuantity = 0;
                    if (order.OrderDetails && order.OrderDetails.length > 0) {
                      const detail = order.OrderDetails[0];
                      const product = products.find(p => p.id === detail.product_id);
                      if (product && product.prix > 0) {
                        const orderTotal = detail.quantite * detail.unit_price;
                        soldQuantity = orderTotal / product.prix;
                      }
                    }
                    return (
                      <tr key={order.id} className="text-center hover:bg-gray-50">
                        <td className="py-2 px-4 border">{order.id}</td>
                        <td className="py-2 px-4 border">{order.status}</td>
                        <td className="py-2 px-4 border">
                          {order.OrderDetails && order.OrderDetails.length > 0
                            ? order.OrderDetails[0].quantite * order.OrderDetails[0].unit_price
                            : "N/A"}
                        </td>
                        <td className="py-2 px-4 border">{soldQuantity}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-2 px-4 border text-center">
                      Aucune commande enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SellerDashboard; 