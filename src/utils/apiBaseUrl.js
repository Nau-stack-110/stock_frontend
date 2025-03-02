export const getApiBaseUrl = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Vérification simple de la présence du mot "Android" dans le userAgent
  if (/android/i.test(userAgent)) {
    // Remplacez par l'adresse IP de votre machine sur le réseau local
    return 'http://192.168.43.19:4000';
  }
  return 'http://localhost:4000';
}; 