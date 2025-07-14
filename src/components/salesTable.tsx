import { useEffect, useState } from "react";
import { getSalesDetailsByDateRange, ProductoVendido, diagnosticarBaseDatos } from "../db/db";

const PosVentasScreen = () => {
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroAplicado, setFiltroAplicado] = useState(false);
  const [diagnosticoInfo, setDiagnosticoInfo] = useState<{
    salesExists: boolean;
    salesCount: number;
    detailsExists: boolean;
    detailsCount: number;
    productsCount: number;
    joinWorks: boolean;
  } | null>(null);

  // Configurar fechas por defecto (hoy)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFechaInicio(today);
    setFechaFin(today);
    
    // Ejecutar diagnóstico al cargar
    ejecutarDiagnostico();
  }, []);

  const ejecutarDiagnostico = async () => {
    console.log("🔍 Ejecutando diagnóstico de base de datos...");
    const resultado = await diagnosticarBaseDatos();
    setDiagnosticoInfo(resultado);
  };

  const fetchProductosVendidos = async (inicio?: string, fin?: string) => {
    setLoading(true);
    try {
      const startDate = inicio || fechaInicio;
      const endDate = fin || fechaFin;
      
      console.log(`🔎 Buscando ventas del ${startDate} al ${endDate}`);
      
      const data = await getSalesDetailsByDateRange(startDate, endDate);
      console.log("📊 Datos de ventas obtenidos:", data);
      console.log("📈 Cantidad de productos encontrados:", data?.length || 0);
      
      setProductosVendidos(data || []);
      setFiltroAplicado(true);
    } catch (error) {
      console.error("💥 Error fetching sales details:", error);
      setProductosVendidos([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = () => {
    fetchProductosVendidos();
  };

  const limpiarFiltro = () => {
    const today = new Date().toISOString().split('T')[0];
    setFechaInicio(today);
    setFechaFin(today);
    fetchProductosVendidos(today, today);
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      fetchProductosVendidos();
    }
  }, []);

  // Calcular totales
  const totalProductosVendidos = productosVendidos.reduce((sum, item) => sum + item.cantidad_vendida, 0);
  const totalVentasGeneral = productosVendidos.reduce((sum, item) => sum + item.total_vendido, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Cargando historial de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Historial de Ventas</h1>
            <p className="text-purple-100">Consulta el desempeño de tus productos y ventas</p>
          </div>
          <div className="hidden md:block">
            <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <svg className="text-purple-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="font-semibold text-gray-700">Filtrar por fechas:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          
          <button
            onClick={aplicarFiltro}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Aplicar Filtro
          </button>
          
          <button
            onClick={limpiarFiltro}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Información de Diagnóstico */}
      {diagnosticoInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
            </svg>
            Estado de la Base de Datos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className={`p-2 rounded ${diagnosticoInfo.salesExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Tabla Sales</div>
              <div>{diagnosticoInfo.salesExists ? `✅ ${diagnosticoInfo.salesCount} registros` : '❌ No existe'}</div>
            </div>
            <div className={`p-2 rounded ${diagnosticoInfo.detailsExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Tabla SalesDetails</div>
              <div>{diagnosticoInfo.detailsExists ? `✅ ${diagnosticoInfo.detailsCount} registros` : '❌ No existe'}</div>
            </div>
            <div className={`p-2 rounded ${diagnosticoInfo.joinWorks ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Relación JOIN</div>
              <div>{diagnosticoInfo.joinWorks ? '✅ Funciona' : '❌ Error'}</div>
            </div>
          </div>
          {(!diagnosticoInfo.salesExists || !diagnosticoInfo.detailsExists || !diagnosticoInfo.joinWorks) && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
              <strong>⚠️ Acción requerida:</strong> Las nuevas tablas de ventas no están configuradas. 
              Por favor ejecuta la migración de la base de datos como se describe en la documentación.
            </div>
          )}
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total de Productos</p>
              <p className="text-3xl font-bold text-purple-600">{productosVendidos.length}</p>
              <p className="text-xs text-gray-500 mt-1">Productos únicos vendidos</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Unidades Vendidas</p>
              <p className="text-3xl font-bold text-green-600">{totalProductosVendidos}</p>
              <p className="text-xs text-gray-500 mt-1">Total de artículos</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total de Ventas</p>
              <p className="text-3xl font-bold text-amber-600">${totalVentasGeneral.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Ingresos generados</p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos vendidos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Productos Vendidos
            {filtroAplicado && (
              <span className="text-sm text-gray-500 ml-2 font-normal">
                ({fechaInicio === fechaFin ? 
                  `${new Date(fechaInicio).toLocaleDateString('es-ES')}` : 
                  `${new Date(fechaInicio).toLocaleDateString('es-ES')} - ${new Date(fechaFin).toLocaleDateString('es-ES')}`})
              </span>
            )}
          </h2>
        </div>
        
        {productosVendidos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500">No se encontraron ventas para el período seleccionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    ID Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Nombre del Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Cantidad Vendida
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Total Vendido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosVendidos.map((item, index) => (
                  <tr key={item.producto_id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-amber-50 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{item.producto_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.product}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800">
                        {item.cantidad_vendida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-amber-600">
                      ${item.total_vendido.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900">
                    TOTAL GENERAL
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-purple-600 text-white">
                      {totalProductosVendidos}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-amber-600">
                    ${totalVentasGeneral.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosVentasScreen;