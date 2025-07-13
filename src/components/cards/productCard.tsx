interface ProductProps {
  product: string;
  price: number;
  image_url: string;
  onClick?: () => void;
  onAdd?: () => void;
}

const ProductCard = ({ product, price, image_url, onClick }: ProductProps) => {
  return (
    <button className="transform transition-transform hover:scale-105" onClick={onClick}>
    <div className="bg-white shadow-lg rounded-lg p-4">
      <img src={image_url} alt={product} className="w-full h-40 object-cover rounded-md" />
      <h3 className="text-lg font-semibold mt-2">{product}</h3>
      <p className="text-gray-600">${price.toFixed(2)}</p>
    </div>
    </button>
  );
};

export default ProductCard;
