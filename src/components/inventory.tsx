import { useEffect, useState } from "react";
import { addProduct, getAllProducts, updateProduct, deleteProduct } from "../db/db";
import InventoryCard from "./cards/inventoryCard";
import ModalProducto from "./modalProduct";
import DeleteConfirmationModal from "./modals/deleteModal";
import EditProductModal from "./modals/editModal";

interface ProductInventory {
  id: number;
  product: string;
  quantity: number;
  price: number;
  image_url: string;
}

const Inventory = () => {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductInventory | null>(null);
  
  // Estados para editar
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductInventory | null>(null);

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

  const handleSaveProduct = async (product: { product: string; quantity: number; price: number, image_url?: string; }) => {
    try {
      await addProduct(product);
      await fetchProducts(); // actualiza la lista
    } catch (error) {
      console.error("Error al agregar producto:", error);
    } finally {
      setIsOpen(false);
    }
  };

  // Función para manejar la eliminación
  const handleDeleteClick = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        await fetchProducts(); // actualiza la lista
        setShowDeleteModal(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Función para manejar la edición
  const handleEditClick = (product: ProductInventory) => {
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedProduct: ProductInventory) => {
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
      await fetchProducts(); // actualiza la lista
      setShowEditModal(false);
      setProductToEdit(null);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setProductToEdit(null);
  };

  // Función para manejar la actualización de cantidad
  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    try {
      await updateProduct(productId, { quantity: newQuantity });
      await fetchProducts(); // actualiza la lista
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
    }
  };

  // Estadísticas del inventario
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.quantity <= 5).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Inventario */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Inventario</h1>
            <p className="text-blue-100">Administra los productos de tu café con amor</p>
          </div>
          <div className="hidden md:block">
            <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Total de Productos</h3>
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border border-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Stock Bajo</h3>
              <p className="text-2xl font-bold text-rose-600">{lowStockItems}</p>
            </div>
            <div className="bg-rose-100 rounded-full p-2">
              <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Valor Total</h3>
              <p className="text-2xl font-bold text-emerald-600">${totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-100 rounded-full p-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Botón Agregar Producto */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Productos en Stock</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span className="font-semibold">Agregar Producto</span>
        </button>
      </div>

      <ModalProducto
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Grid de Productos */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
          <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A3,3 0 0,1 15,5V6.17C16.17,6.58 17,7.69 17,9V19A3,3 0 0,1 14,22H10A3,3 0 0,1 7,19V9C7,7.69 7.83,6.58 9,6.17V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V6H13V5A1,1 0 0,0 12,4M9,8V19A1,1 0 0,0 10,20H14A1,1 0 0,0 15,19V8H9Z"/>
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay productos en el inventario</h3>
          <p className="text-gray-500 mb-4">¡Comienza agregando tu primer producto!</p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Primer Producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <InventoryCard
              key={product.id}
              id={product.id}
              product={product.product}
              quantity={product.quantity}
              image_url={product.image_url}
              price={product.price}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        productName={productToDelete?.product || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Modal para editar producto */}
      <EditProductModal
        isOpen={showEditModal}
        product={productToEdit}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default Inventory;