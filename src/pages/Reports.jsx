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
import { FaChartBar, FaDolly } from 'react-icons/fa';

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

  // Adresse de base de l'API backend
  const API_URL = 'http://localhost:4000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [bestSellerResponse, productsResponse] = await Promise.all([
          axios.get(`${API_URL}/reports/best-seller-products/`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/products/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        // Récupérer uniquement le premier élément du tableau (le meilleur vendeur)
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
              : entry.week || entry.month
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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="p-4"
    >
      <h1 className="text-3xl font-bold mb-6">Rapports</h1>

      {/* Nouveau sélecteur de période */}
      <div className="mb-6 flex justify-end">
        <select 
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="daily">Journalier</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuel</option>
        </select>
      </div>

      {/* Cartes d'indicateurs clés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cartes.map((carte, index) => (
          <motion.div
            key={index}
            className="flex items-center p-4 bg-white rounded shadow hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
          >
            <div className="mr-4">{carte.icon}</div>
            <div>
              <p className="text-gray-500">{carte.title}</p>
              <p className="text-xl font-semibold">{carte.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Section des graphiques modifiée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div className="bg-white rounded shadow p-4" whileHover={{ scale: 1.02 }}>
          {salesData ? (
            <Line data={salesData} options={salesOptions} />
          ) : (
            <div className="text-center p-4">Chargement des données de vente...</div>
          )}
        </motion.div>
        {/* Graphique des stocks critiques */}
        <motion.div className="bg-white rounded shadow p-4" whileHover={{ scale: 1.02 }}>
          <Bar data={stockData} options={stockOptions} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Reports; 