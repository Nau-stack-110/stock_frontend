import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaPlus,
  FaEdit,
  FaTrash,  
  FaExclamationTriangle,
  FaMinus,
  FaSearch,
} from 'react-icons/fa';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  // Pour le modal d'augmentation/diminution de quantité
  const [isQuantityModalOpen, setQuantityModalOpen] = useState(false);
  const [quantityValue, setQuantityValue] = useState("");
  const [quantityOperation, setQuantityOperation] = useState(""); // "increment" ou "decrement"
  const [productForQuantity, setProductForQuantity] = useState(null);

  const [productForm, setProductForm] = useState({
    nom: '',
    categorie: '',
    reference: '',
    prix: '',
    quantite: '',
    fournisseur: '',
  });

  // Fonction utilitaire pour récupérer l'ID du produit,
  // qu'il soit défini dans _id ou id
  const getProductId = (product) => product._id || product.id;

  // Seuils critiques pour le stock
  const MIN_THRESHOLD = 10;
  const MAX_THRESHOLD = 100;

  const API_URL = 'http://localhost:4000/api/products';

  // Fonction de récupération des produits
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Erreur de chargement:', err);
    }
  };

  // Récupération des produits au montage
  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setProductForm({
      nom: '',
      categorie: '',
      reference: '',
      prix: '',
      quantite: '',
      fournisseur: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductForm({
      nom: product.nom,
      categorie: product.categorie,
      reference: product.reference,
      prix: product.prix.toString(),
      quantite: product.quantite.toString(),
      fournisseur: product.fournisseur,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const formattedData = {
        ...productForm,
        prix: parseFloat(productForm.prix),
        quantite: parseInt(productForm.quantite, 10)
      };

      if (productForQuantity) {
        await axios.put(
          `${API_URL}/${getProductId(productForQuantity)}`,
          formattedData,
          config
        );
      } else {
        await axios.post(API_URL, formattedData, config);
      }
      Swal.fire({
        icon: 'success',
        title: 'Opération réussie',
        text: 'Le produit a été modifié avec succès.',
        showConfirmButton: false,
        timer: 1500,
      });

      // Rafraîchir la liste des produits
      fetchProducts();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.response?.data?.message || 'Opération échouée'
      });
    }
    setModalOpen(false);
  };

  const handleDeleteProduct = async (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire({
            icon: 'success',
            title: 'Supprimé',
            text: 'Le produit a été supprimé.',
          });
          // Rafraîchir la liste des produits
          fetchProducts();
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.response?.data?.message || 'Suppression échouée'
          });
        }
      }
    });
  };

  // Ouvre le modal de quantité pour l'incrémentation ou la décrémentation
  const openQuantityModal = (product, operation) => {
    setProductForQuantity(product);
    setQuantityOperation(operation);
    setQuantityValue("");
    setQuantityModalOpen(true);
  };

  // Gestion de la soumission du formulaire de quantité
  const handleQuantitySubmit = async (e) => {
    e.preventDefault();
    if (!productForQuantity) return;
    const token = localStorage.getItem('token');
    const adjustment = parseInt(quantityValue, 10);
    if (isNaN(adjustment) || adjustment <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Veuillez entrer un nombre positif.",
      });
      return;
    }
    let newQuantity;
    if (quantityOperation === "increment") {
      newQuantity = productForQuantity.quantite + adjustment;
    } else if (quantityOperation === "decrement") {
      newQuantity = productForQuantity.quantite - adjustment;
      if (newQuantity < 0) newQuantity = 0;
    }
    try {
      await axios.put(
        `${API_URL}/${getProductId(productForQuantity)}`,
        { quantite: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: 'success',
        title: 'Quantité mise à jour',
        text: `Nouvelle quantité : ${newQuantity}`,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchProducts();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.response?.data?.message || 'Echec de la mise à jour',
      });
    }
    setQuantityModalOpen(false);
    setQuantityValue("");
    setProductForQuantity(null);
    setQuantityOperation("");
  };

  // Filtrage des produits en fonction de la barre de recherche
  const filteredProducts = products.filter((prod) => 
    prod.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.categorie.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.fournisseur.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      className="p-4"
    >
      <h1 className="text-3xl font-bold mb-4">Gestion des Produits</h1>
      
      {/* Barre de recherche améliorée */}
      <div className="mb-4 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Recherche par nom, catégorie ou fournisseur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg text-sm md:text-base focus:ring-2 focus:ring-blue-400"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center text-sm md:text-base">
          {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter un produit
        </button>
      </div>

      {/* Tableau responsive */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="py-3 px-2 md:px-4 font-semibold hidden md:table-cell">ID</th>
              <th className="py-3 px-2 md:px-4 font-semibold">Nom</th>
              <th className="py-3 px-2 md:px-4 font-semibold hidden md:table-cell">Catégorie</th>
              <th className="py-3 px-2 md:px-4 font-semibold hidden md:table-cell">Référence</th>
              <th className="py-3 px-2 md:px-4 font-semibold">Prix</th>
              <th className="py-3 px-2 md:px-4 font-semibold">Quantité</th>
              <th className="py-3 px-2 md:px-4 font-semibold hidden md:table-cell">Fournisseur</th>
              <th className="py-3 px-2 md:px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((prod) => (
              <tr key={getProductId(prod)} className="hover:bg-gray-50">
                <td className="py-3 px-2 md:px-4 hidden md:table-cell">{prod.id}</td>
                <td className="py-3 px-2 md:px-4 font-medium">{prod.nom}</td>
                <td className="py-3 px-2 md:px-4 hidden md:table-cell">{prod.categorie}</td>
                <td className="py-3 px-2 md:px-4 hidden md:table-cell">{prod.reference}</td>
                <td className="py-3 px-2 md:px-4">{prod.prix} Ar</td>
                <td className="py-3 px-2 md:px-4 flex items-center justify-center">
                  {prod.quantite}
                  {(prod.quantite < MIN_THRESHOLD || prod.quantite > MAX_THRESHOLD) && (
                    <FaExclamationTriangle
                      className="text-red-500 ml-1"
                      title="Niveau critique"
                    />
                  )}
                </td>
                <td className="py-3 px-2 md:px-4 hidden md:table-cell">{prod.fournisseur}</td>
                <td className="py-3 px-2 md:px-4 space-x-2">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="text-green-600 hover:text-green-800 mx-1"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(getProductId(prod))}
                      className="text-red-600 hover:text-red-800 mx-1"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => openQuantityModal(prod, "increment")}
                      className="text-blue-600 hover:text-blue-800 mx-1"
                      title="Ajouter une quantité"
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => openQuantityModal(prod, "decrement")}
                      className="text-orange-600 hover:text-orange-800 mx-1"
                      title="Retirer une quantité"
                    >
                      <FaMinus />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour l'ajout/modification de produit */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {productForQuantity ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={productForm.nom}
                    onChange={handleFormChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Catégorie</label>
                  <input
                    type="text"
                    name="categorie"
                    value={productForm.categorie}
                    onChange={handleFormChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Référence</label>
                  <input
                    type="text"
                    name="reference"
                    value={productForm.reference}
                    onChange={handleFormChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Prix (Ar)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="prix"
                    value={productForm.prix}
                    onChange={handleFormChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Quantité</label>
                  <input
                    type="number"
                    name="quantite"
                    value={productForm.quantite}
                    onChange={handleFormChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Fournisseur</label>
                  <input
                    type="text"
                    name="fournisseur"
                    value={productForm.fournisseur}
                    onChange={handleFormChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border rounded"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    {productForQuantity ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal pour la saisie de la quantité à ajouter ou retirer */}
      <AnimatePresence>
        {isQuantityModalOpen && productForQuantity && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuantityModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {quantityOperation === "increment" 
                  ? "Ajouter une quantité" 
                  : "Retirer une quantité"}
              </h2>
              <form onSubmit={handleQuantitySubmit} className="space-y-4">
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Entrez la quantité"
                    value={quantityValue}
                    onChange={(e) => setQuantityValue(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setQuantityModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Valider
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Products; 