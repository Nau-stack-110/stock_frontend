import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UserInfo from '../components/UserInfo';

const AdminLayout = () => {
  return (
    <div className="relative min-h-screen">
      {/* Informations de l'utilisateur fixes en haut à droite */}
      <div className="fixed top-4 right-4 z-50">
        <UserInfo />
      </div>

      <div className="flex">
        <Sidebar />
        {/* Zone de contenu principale avec marge à gauche pour éviter le chevauchement
            (ici md:ml-64 correspond à la largeur de la sidebar non réduite) */}
        <main className="flex-1 p-4 md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 