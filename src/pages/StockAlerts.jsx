import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaPlus,
  FaEdit,
  FaTrash,  
  FaExclamationTriangle,
  FaSearch,
  FaBox,
  FaList,
  FaBarcode,
  FaCoins,
  FaTruck,
  FaMinus,
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Fonction utilitaire pour récupérer l'ID du produit,
  const getProductId = (product) => product._id || product.id;

  // Seuils critiques pour le stock
  const MIN_THRESHOLD = 10;
  const MAX_THRESHOLD = 100;

  const API_URL = 'http://localhost:4000/api/products';


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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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
          <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
            <FaExclamationTriangle className="text-red-500" /> Alertes de Stock
          </h1>
          <p className="text-gray-600">Surveillance des niveaux de stock critiques</p>
        </motion.div>

        {/* Barre de recherche améliorée */}
        <motion.div 
          className="mb-2 bg-white p-4 rounded-xl shadow-lg"
          whileHover={{ y: -2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, catégorie ou fournisseur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center min-w-[120px] flex items-center justify-center">
              {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''}
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
              <thead className="bg-gradient-to-r from-red-50 to-red-100">
                <tr>
                  <th className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FaBarcode /> ID
                    </div>
                  </th>
                  <th className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FaBox /> Nom
                    </div>
                  </th>
                  <th className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FaList /> Catégorie
                    </div>
                  </th>
                  <th className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FaBarcode /> Référence
                    </div>
                  </th>
                  <th className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FaCoins /> Prix
                    </div>
                  </th>
                  <th className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FaExclamationTriangle /> Quantité
                    </div>
                  </th>
                  <th className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FaTruck /> Fournisseur
                    </div>
                  </th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((prod, index) => (
                  <motion.tr
                    key={getProductId(prod)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-red-50 group"
                  >
                    <td className="py-3 px-4 hidden md:table-cell">{prod.id}</td>
                    <td className="py-3 px-4 font-medium">{prod.nom}</td>
                    <td className="py-3 px-4 hidden md:table-cell">{prod.categorie}</td>
                    <td className="py-3 px-4 hidden md:table-cell">{prod.reference}</td>
                    <td className="py-3 px-4">{prod.prix} Ar</td>
                    <td className="py-3 px-4 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => openQuantityModal(prod, "decrement")}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaMinus />
                        </motion.button>
                        
                        <span className={`font-semibold ${
                          prod.quantite < MIN_THRESHOLD ? 'text-red-600' : 
                          prod.quantite > MAX_THRESHOLD ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {prod.quantite}
                          {(prod.quantite < MIN_THRESHOLD || prod.quantite > MAX_THRESHOLD) && (
                            <FaExclamationTriangle
                              className="ml-2 inline-block"
                              title="Niveau critique"
                            />
                          )}
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => openQuantityModal(prod, "increment")}
                          className="text-green-500 hover:text-green-700"
                        >
                          <FaPlus />
                        </motion.button>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">{prod.fournisseur}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => openEditModal(prod)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDeleteProduct(getProductId(prod))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
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
            className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50"
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
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-50 hover:bg-red-100'
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
            className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50"
          >
            Suivant →
          </motion.button>
        </motion.div>

        <div className="mt-4">
          <button
            onClick={openAddModal}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Ajouter un produit
          </button>
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
          {isQuantityModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-white p-6 rounded-xl w-96"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {quantityOperation === "increment" ? (
                    <><FaPlus className="text-green-500" /> Augmenter le stock</>
                  ) : (
                    <><FaMinus className="text-red-500" /> Réduire le stock</>
                  )}
                </h3>
                
                <form onSubmit={handleQuantitySubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Quantité à {quantityOperation === "increment" ? "ajouter" : "retirer"} :
                    </label>
                    <input
                      type="number"
                      value={quantityValue}
                      onChange={(e) => setQuantityValue(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantityModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg ${
                        quantityOperation === "increment" 
                          ? "bg-green-500 text-white hover:bg-green-600" 
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      Confirmer
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Products; 