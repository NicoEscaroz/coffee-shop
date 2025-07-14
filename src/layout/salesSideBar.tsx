import { ProductSales } from "../components/sales";
import { crearVentaCompleta, validarStockDisponible } from "../db/db";

interface SelectedProduct extends ProductSales {
  quantity: number;
}

interface Props {
    selectedProducts: SelectedProduct[];
    setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
}

const SalesSideBar = ({ selectedProducts, setSelectedProducts }: Props) => {
  const increaseQuantity = (id: number) => {
    setSelectedProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, quantity: product.quantity + 1 } : product
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setSelectedProducts(prev =>
      prev
        .map(product =>
          product.id === id ? { ...product, quantity: product.quantity - 1 } : product
        )
        .filter(product => product.quantity > 0)
    );
  };

  const removeProduct = (id: number) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== id));
  };

  const totalVenta = selectedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const totalItems = selectedProducts.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  const handleConfirmarVenta = async () => {
    if (selectedProducts.length === 0) return;

    const items = selectedProducts.map((prod) => ({
      productoId: prod.id, // Ya es number, no convertir a string
      cantidad: prod.quantity,
    }));

    const stockValido = await validarStockDisponible(items);
    if (!stockValido) {
      alert("Uno o más productos no tienen suficiente stock.");
      return;
    }

    // Usar la nueva función crearVentaCompleta en lugar de crear venta y detalles por separado
    const venta = await crearVentaCompleta(
      items,
      'efectivo', // método de pago por defecto
      undefined,  // vendedor opcional
      undefined,  // notas opcionales
      0          // sin descuento por defecto
    );
    
    if (!venta) {
      alert("Error al procesar la venta");
      return;
    }

    setSelectedProducts([]);
    alert("¡Venta registrada con éxito!");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-fit">
      {/* Header del carrito */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Carrito de Ventas</h2>
            <p className="text-emerald-100 text-sm">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V10H7V18M19,5V3H15.5L14.5,2H9.5L8.5,3H5V5H19M6,7V18A1,1 0 0,0 7,19H17A1,1 0 0,0 18,18V7H6Z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6">
        {selectedProducts.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto w-12 h-12 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V10H7V18M19,5V3H15.5L14.5,2H9.5L8.5,3H5V5H19M6,7V18A1,1 0 0,0 7,19H17A1,1 0 0,0 18,18V7H6Z"/>
            </svg>
            <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
            <p className="text-gray-400 text-xs mt-1">Selecciona productos para comenzar</p>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {selectedProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={product.image_url} 
                        alt={product.product} 
                        className="h-12 w-12 object-cover rounded-lg border border-gray-200" 
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{product.product}</h4>
                        <p className="text-emerald-600 font-bold text-sm">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeProduct(product.id)}
                      className="text-rose-500 hover:text-rose-700 transition-colors p-1"
                      title="Eliminar producto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => decreaseQuantity(product.id)}
                        className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                        </svg>
                      </button>
                      <span className="font-bold text-gray-800 min-w-[2rem] text-center">{product.quantity}</span>
                      <button 
                        onClick={() => increaseQuantity(product.id)}
                        className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="font-bold text-gray-800">${(product.quantity * product.price).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Productos ({totalItems})</span>
                  <span>${totalVenta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>${totalVenta.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmarVenta}
                disabled={selectedProducts.length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Confirmar Venta</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesSideBar;
