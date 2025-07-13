import { useEffect, useState } from "react";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            {/* Logo/Icono de la iglesia */}
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-full">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-indigo-800 tracking-wide">Corazón y Fuego</h1>
              <p className="text-sm text-indigo-600 font-medium">Café con Propósito</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Fecha y hora */}
            <div className="text-right">
              <div className="text-sm font-semibold text-indigo-800">
                {currentTime.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-lg font-bold text-indigo-700">
                {currentTime.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            {/* Iconos de acción */}
            <div className="flex items-center space-x-3">
              {/* Notificaciones */}
              <div className="relative">
                <button className="bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow border border-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
              
              {/* Usuario */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default Header