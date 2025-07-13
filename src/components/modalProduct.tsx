import { useState } from "react";


interface ModalProductoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: { product: string; quantity: number; price: number, image_url?: string; }) => void;
  }

const ModalProducto = ({ isOpen, onClose, onSave }: ModalProductoProps) => {
    const [product, setProduct] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [image_url, setImageUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || quantity <= 0 || price <= 0) {
          alert("Por favor, completa todos los campos correctamente.");
          return;
        }
        onSave({ product, quantity, price, image_url });
        onClose();
        // Reset
        setProduct("");
        setQuantity(0);
        setPrice(0);
      };
    
      if (!isOpen) return null;
    
      return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 inset-ring-2 border-black">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
            <h2 className="text-xl font-semibold mb-4">Agregar producto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Nombre del producto</label>
                <input
                  type="text"
                  value={product}
                  placeholder="Nombre del producto"
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Cantidad</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Precio</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  min={0.01}
                  step={0.01}
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Imagen del producto</label>
                <input
                  type="text"
                  placeholder="URL de la imagen (opcional)"
                  value={image_url}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      );
};

export default ModalProducto;