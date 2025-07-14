import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, obtenerTotalVentas } from "../db/db";

interface QuickStats {
  totalProducts: number;
  totalSales: number;
  lowStockItems: number;
}

const Menu = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuickStats>({
    totalProducts: 0,
    totalSales: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, totalSales] = await Promise.all([
          getAllProducts(),
          obtenerTotalVentas()
        ]);

        const lowStock = products?.filter(p => p.quantity <= 5).length || 0;

        setStats({
          totalProducts: products?.length || 0,
          totalSales: totalSales || 0,
          lowStockItems: lowStock
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const navigationCards = [
    {
      title: "Punto de Venta",
      description: "Registra ventas y gestiona el carrito",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V10H7V18M19,5V3H15.5L14.5,2H9.5L8.5,3H5V5H19M6,7V18A1,1 0 0,0 7,19H17A1,1 0 0,0 18,18V7H6Z"/>
        </svg>
      ),
      path: "/sales",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Inventario",
      description: "Gestiona productos y stock",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
        </svg>
      ),
      path: "/inventory",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Historial de Ventas",
      description: "Consulta reportes y estadísticas",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
        </svg>
      ),
      path: "/salesRecord",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl shadow-xl text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">¡Bienvenido a Corazón y Fuego!</h1>
              <div className="flex items-center space-x-4 text-blue-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>Sirviendo con amor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"/>
                  </svg>
                  <span>Construyendo comunidad</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2,21V19H20V21H2M20,8V5L18,5V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V3H20Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Productos</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500">Total en inventario</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Ventas Totales</h3>
              <p className="text-3xl font-bold text-emerald-600">${stats.totalSales.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Ingresos generados</p>
            </div>
            <div className="bg-emerald-100 rounded-full p-3">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Stock Bajo</h3>
              <p className="text-3xl font-bold text-rose-600">{stats.lowStockItems}</p>
              <p className="text-sm text-gray-500">Productos ≤ 5 unidades</p>
            </div>
            <div className="bg-rose-100 rounded-full p-3">
              <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {navigationCards.map((card, index) => (
            <button
              key={index}
              onClick={() => navigate(card.path)}
              className={`${card.bgColor} rounded-xl p-6 text-left hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100`}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${card.color} text-white mb-4`}>
                {card.icon}
              </div>
              <h3 className={`text-xl font-bold ${card.textColor} mb-2`}>{card.title}</h3>
              <p className="text-gray-600">{card.description}</p>
              <div className="mt-4 flex items-center text-gray-500">
                <span className="text-sm">Ir a {card.title}</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;