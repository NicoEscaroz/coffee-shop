interface DeleteConfirmationModalProps {
    isOpen: boolean;
    productName: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  
  const DeleteConfirmationModal = ({ isOpen, productName, onConfirm, onCancel }: DeleteConfirmationModalProps) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar el producto <strong>"{productName}"</strong>? 
            Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default DeleteConfirmationModal;