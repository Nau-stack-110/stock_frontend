import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Line, Bar} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaChartBar, FaDolly, FaChartLine, FaBoxOpen, FaCoins, FaExclamationTriangle, FaUser } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  // États pour stocker le produit le plus vendu et la liste des produits depuis le backend
  const [bestSeller, setBestSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState(null);
  const [timePeriod, setTimePeriod] = useState('daily');
  const [stockRotation, setStockRotation] = useState([]);
  const [topSeller, setTopSeller] = useState(null);

  // Adresse de base de l'API backend
  const API_URL = 'http://localhost:4000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [bestSellerResponse, productsResponse, ordersResponse] = await Promise.all([
          axios.get(`${API_URL}/reports/best-seller-products/`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/products/`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/orders/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Calcul du top vendeur
        const sellerSales = ordersResponse.data.reduce((acc, order) => {
          const sellerId = order.User?.id;
          if (sellerId) {
            acc[sellerId] = (acc[sellerId] || 0) + 1;
          }
          return acc;
        }, {});

        const topSellerEntry = Object.entries(sellerSales).sort((a, b) => b[1] - a[1])[0];
        const topSellerData = ordersResponse.data.find(order => 
          order.User?.id === parseInt(topSellerEntry?.[0], 10)
        )?.User;

        setTopSeller(topSellerData ? { 
          name: topSellerData.name, 
          salesCount: topSellerEntry?.[1] 
        } : null);

        setBestSeller(bestSellerResponse.data[0]);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    fetchData();
  }, [API_URL]);

  // Nouvel effet pour charger les rapports de ventes
  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = `${API_URL}/reports/sales/${timePeriod}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSalesData({
          labels: response.data.map(entry => 
            timePeriod === 'daily' 
              ? new Date(entry.date).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                }) 
              : timePeriod === 'weekly' 
                ? `Semaine ${entry.week}`
                : new Date(2024, entry.month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })
          ),
          datasets: [{
            label: 'Ventes',
            data: response.data.map(entry => entry.totalSales),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
          }]
        });
      } catch (error) {
        console.error("Erreur lors du chargement des ventes :", error);
      }
    };
    
    fetchSalesReport();
  }, [timePeriod, API_URL]);

  // Nouvel effet pour charger les données de rotation des stocks
  useEffect(() => {
    const fetchStockRotation = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/reports/rotate-stock`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStockRotation(response.data);
      } catch (error) {
        console.error("Erreur rotation stocks :", error);
      }
    };
    fetchStockRotation();
  }, [API_URL]);

  // Calculer la rotation de stock uniquement pour le produit bestSeller
  const bestSellerRotation = bestSeller
    ? stockRotation.find(item => item.Product.nom === bestSeller.Product.nom)
    : null;
  
  // Cartes d'indicateurs clés
  const cartes = [
    {
      title: 'Produit le plus vendu',
      value: bestSeller ? bestSeller.Product.nom : 'Chargement...',
      icon: <FaChartBar className="text-4xl text-blue-500" />,
    },
    {
      title: 'Top Vendeur',
      value: topSeller ? topSeller.name : 'Non disponible',
      icon: <FaUser className="text-4xl text-purple-500" />,
      subInfo: topSeller && `(${topSeller.salesCount} ventes)`
    },
    {
      title: 'Rotation de stocks',
      value: bestSeller
        ? (bestSellerRotation ? `${bestSellerRotation.rotationRatio}x/mois` : 'Non disponible')
        : 'Chargement...',
      icon: <FaDolly className="text-4xl text-green-500" />,
    },
  ];

  // Définir un seuil pour déterminer le stock critique
  const critikabe = 75;  

  // Filtrer les produits pour ne garder que ceux avec un stock critique
  const criticalProducts = products
    .filter(product => {
      const qty = parseInt(product.quantite, 10);
      return qty < 10 || qty > critikabe;
    })
    .slice(0, 4);

  const stockData = {
    labels: criticalProducts.map(product => product.nom),
    datasets: [
      {
        label: 'Stock Critique',
        data: criticalProducts.map(product => parseInt(product.quantite, 10)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ].slice(0, criticalProducts.length),
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
        ].slice(0, criticalProducts.length),
        borderWidth: 1,
      },
    ],
  };

  const stockOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stocks Critiques',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y;
            // Ajouter un signe + devant les valeurs positives
            label += (value > 10 ? '+' : '-') + value;
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return (value > 0 ? '+' : '') + value;
          },
        },
      },
    },
  };

  // Options modifiées pour le graphique des ventes
  const salesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Tendances des ventes (${timePeriod === 'daily' ? 'Journalières' : timePeriod === 'weekly' ? 'Hebdomadaires' : 'Mensuelles'})`,
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const label = salesData.labels[context[0].dataIndex];
            return timePeriod === 'daily' 
              ? `Ventes du ${label}` 
              : `Ventes ${timePeriod === 'weekly' ? 'semaine' : 'mois'} ${label}`;
          },
          label: (context) => {
            return `Montant: Ar${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Montant des ventes (Ar)'
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête amélioré */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center"
        >
          {/* Titre à gauche */}
          <div className="md:flex-1">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FaChartLine className="text-blue-600" /> Tableau de Bord Analytique
            </h1>
          </div>
          
          {/* Contrôles à droite */}
          <div className="flex flex-col gap-4 md:items-end">
            
            {/* Sélecteur de période */}
            <motion.div 
              className="flex gap-2 bg-white p-2 mt-8 rounded-xl shadow-sm w-fit"
              whileHover={{ scale: 1.02 }}
            >
              {['daily', 'weekly', 'monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    timePeriod === period 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {period === 'daily' ? 'Journalier' : period === 'weekly' ? 'Hebdo' : 'Mensuel'}
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Cartes de statistiques améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cartes.map((carte, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  {carte.icon}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{carte.title}</p>
                  <p className="text-2xl font-bold mt-1">{carte.value}</p>
                  {carte.subInfo && <p className="text-sm text-gray-500 mt-1">{carte.subInfo}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section des graphiques améliorée */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaCoins className="text-green-500 text-2xl" />
              <h2 className="text-xl font-semibold">Évolution des Ventes</h2>
            </div>
            <div className="h-[400px]">
              {salesData ? (
                <Line 
                  data={salesData} 
                  options={{ 
                    ...salesOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...salesOptions.plugins,
                      legend: { display: false }
                    }
                  }} 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Chargement des données...
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
              <h2 className="text-xl font-semibold">Alertes de Stock</h2>
            </div>
            <div className="h-[400px]">
              <Bar 
                data={stockData} 
                options={{
                  ...stockOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    ...stockOptions.plugins,
                    legend: { display: false }
                  }
                }} 
              />
            </div>
          </motion.div>
        </div>

        {/* Section supplémentaire pour les produits critiques */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaBoxOpen className="text-orange-500 text-2xl" />
            <h2 className="text-xl font-semibold">Produits Requérant Attention</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {criticalProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{product.nom}</h3>
                  <span className={`text-sm ${
                    product.quantite < 10 ? 'text-red-500' : 'text-orange-500'
                  }`}>
                    {product.quantite} unités
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{product.categorie}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Reports; 