import { useEffect, useState } from "react";
import { getDeletedProducts, restoreProduct, Product } from "../db/db";

const DeletedProducts = () => {
    const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDeletedProducts();
    }, []);

    const loadDeletedProducts = async () => {
        setLoading(true);
        const products = await getDeletedProducts();
        if (products) {
            setDeletedProducts(products);
        }
        setLoading(false);
    };

    const handleRestore = async (id: number, productName: string) => {
        if (window.confirm(`¿Está seguro que desea restaurar el producto "${productName}"?`)) {
            const success = await restoreProduct(id);
            if (success) {
                alert(`Producto "${productName}" restaurado exitosamente`);
                loadDeletedProducts(); // Recargar la lista
            } else {
                alert("Error al restaurar el producto");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-lg">Cargando productos eliminados...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Productos Eliminados</h2>
            
            {deletedProducts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No hay productos eliminados</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deletedProducts.map((product) => (
                        <div key={product.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-800">{product.product}</h3>
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                    Eliminado
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Precio:</span> ${product.price}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Stock:</span> {product.quantity}
                                </p>
                            </div>
                            
                            <button
                                onClick={() => handleRestore(product.id, product.product)}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                            >
                                Restaurar Producto
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Información</h3>
                <p className="text-blue-700 text-sm">
                    Los productos eliminados se conservan para mantener la integridad del historial de ventas. 
                    Puedes restaurarlos en cualquier momento si los necesitas nuevamente.
                </p>
            </div>
        </div>
    );
};

export default DeletedProducts; 