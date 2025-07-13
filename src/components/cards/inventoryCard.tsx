import { useState, useRef, useEffect } from "react";

interface InventoryProps {
  id: number;
  product: string;
  quantity: number;
  price: number;
  image_url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
  onUpdateQuantity: (id: number, newQuantity: number) => void;
} 

const InventoryCard = ({ id, product, quantity, image_url, price, onEdit, onDelete, onUpdateQuantity }: InventoryProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showQuantityConfirm, setShowQuantityConfirm] = useState(false);
  const [pendingQuantityChange, setPendingQuantityChange] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCardClick = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit({ id, product, quantity, price, image_url });
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
    setShowMenu(false);
  };

  const handleQuantityChange = (e: React.MouseEvent, change: number) => {
    e.stopPropagation();
    const newQuantity = quantity + change;
    if (newQuantity >= 0) {
      setPendingQuantityChange(newQuantity);
      setShowQuantityConfirm(true);
      setShowMenu(false);
    }
  };

  const handleConfirmQuantityChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingQuantityChange !== null) {
      onUpdateQuantity(id, pendingQuantityChange);
      setShowQuantityConfirm(false);
      setPendingQuantityChange(null);
    }
  };

  const handleCancelQuantityChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuantityConfirm(false);
    setPendingQuantityChange(null);
  };

  return (
    <div className="relative">
      <div 
        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200"
        onClick={handleCardClick}
      >
        <img 
          className="w-full h-48 object-cover rounded-lg mb-4" 
          src={image_url} 
          alt={product} 
        />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product}</h3>
        <p className="text-gray-600 mb-1">{quantity} unidades</p>
        <p className="text-green-600 font-bold text-xl">${price.toFixed(2)}</p>
      </div>

      {/* Menú de opciones */}
      {showMenu && !showQuantityConfirm && (
        <div 
          ref={menuRef}
          className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden"
        >
          <button
            onClick={handleEdit}
            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            onClick={(e) => handleQuantityChange(e, 1)}
            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-150"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Sumar inventario
          </button>
          <button
            onClick={(e) => handleQuantityChange(e, -1)}
            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150"
            disabled={quantity <= 0}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Restar inventario
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      )}

      {/* Modal de confirmación para cambio de cantidad */}
      {showQuantityConfirm && pendingQuantityChange !== null && (
        <div 
          className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4 min-w-[200px]"
        >
          <p className="text-sm text-gray-700 mb-3">
            ¿Cambiar cantidad de <strong>{quantity}</strong> a <strong>{pendingQuantityChange}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmQuantityChange}
              className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-150"
            >
              Confirmar
            </button>
            <button
              onClick={handleCancelQuantityChange}
              className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors duration-150"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryCard;
