import { useEffect, useState } from "react";
import ProductCard from "./cards/productCard";
import { getAllProducts } from "../db/db";
import SalesSideBar from "../layout/salesSideBar";

export interface ProductSales {
  id: number;
  product: string;
  price: number;
  image_url: string;
}

interface ProductSalesWithQuantity extends ProductSales {
  quantity: number;
}

const Sales = () => {
  const [products, setProducts] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<ProductSalesWithQuantity[]>([]);

  const handleAddProduct = (product: ProductSales) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p: ProductSalesWithQuantity) => p.id === product.id);
      if (existing) {
        return prev.map((p: ProductSalesWithQuantity) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen gap-6">
      {/* Sección principal de productos */}
      <div className="w-full lg:w-3/4">
        {/* Header del Punto de Venta */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg text-white p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Punto de Venta</h1>
              <p className="text-emerald-100">Selecciona productos para crear una nueva venta</p>
            </div>
            <div className="hidden md:block">
              <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7,18A2,2 0 0,0 9,20H15A2,2 0 0,0 17,18V10H7V18M19,5V3H15.5L14.5,2H9.5L8.5,3H5V5H19M6,7V18A1,1 0 0,0 7,19H17A1,1 0 0,0 18,18V7H6Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Productos disponibles */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-500">Agrega productos al inventario para comenzar a vender</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Productos Disponibles</h2>
              <p className="text-gray-600">{products.length} productos en stock</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product.product}
                  price={product.price}
                  image_url={product.image_url}
                  onClick={() => handleAddProduct(product)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sidebar del carrito */}
      <div className="w-full lg:w-1/4">
        <div className="lg:sticky lg:top-6">
          <SalesSideBar 
            selectedProducts={selectedProducts} 
            setSelectedProducts={setSelectedProducts} 
          />
        </div>
      </div>
    </div>
  );
};

export default Sales;