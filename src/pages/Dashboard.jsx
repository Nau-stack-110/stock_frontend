import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <div className="md:ml-64">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-4"
      >
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p>Bienvenue sur le dashboard de votre pharmacie. Suivez ici l&apos;activité globale et les statistiques clés.</p>
      </motion.div>
    </div>
  );
};

export default Dashboard; 