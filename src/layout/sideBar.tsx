import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SideBar = () => {

  const [activeTab, setActiveTab] = useState('main');
  const navigate = useNavigate();

  const handleNavigation = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  }

    return (
      <div className="flex w-64">
        <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-slate-600">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2,21V19H20V21H2M20,8V5L18,5V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V3H20Z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Café Shop</h2>
                <p className="text-sm text-slate-300">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 px-2">
                Menú Principal
              </h3>
              
              <button 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'main' 
                    ? 'bg-indigo-600 text-slate-100 shadow-lg' 
                    : 'text-slate-200 hover:bg-slate-700 hover:text-slate-100'
                }`}
                onClick={() => handleNavigation('main', '/menu')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
                <span className="font-medium">Inicio</span>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 px-2">
                Operaciones
              </h3>
              
              <button 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'sales' 
                    ? 'bg-indigo-600 text-slate-100 shadow-lg' 
                    : 'text-slate-200 hover:bg-slate-700 hover:text-slate-100'
                }`}
                onClick={() => handleNavigation('sales', '/sales')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V10H7V18M19,5V3H15.5L14.5,2H9.5L8.5,3H5V5H19M6,7V18A1,1 0 0,0 7,19H17A1,1 0 0,0 18,18V7H6Z"/>
                </svg>
                <span className="font-medium">Punto de Venta</span>
              </button>
              
              <button 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'inventory' 
                    ? 'bg-indigo-600 text-slate-100 shadow-lg' 
                    : 'text-slate-200 hover:bg-slate-700 hover:text-slate-100'
                }`}
                onClick={() => handleNavigation('inventory', '/inventory')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
                </svg>
                <span className="font-medium">Inventario</span>
              </button>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 px-2">
                Reportes
              </h3>
              
              <button 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'salesRecord' 
                    ? 'bg-indigo-600 text-slate-100 shadow-lg' 
                    : 'text-slate-200 hover:bg-slate-700 hover:text-slate-100'
                }`}
                onClick={() => handleNavigation('salesRecord', '/salesRecord')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
                </svg>
                <span className="font-medium">Historial de Ventas</span>
              </button>
            </div>
          </nav>

          {/* Footer del sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-600">
            <div className="flex items-center justify-center space-x-2 text-slate-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-sm font-medium">Con amor y fe</span>
            </div>
          </div>
        </aside>
      </div>
    )
}

export default SideBar;