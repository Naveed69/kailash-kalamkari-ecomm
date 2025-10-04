import ProductList from "../components/ProductList";

const Products = ({ allProducts, setAllProducts }) => {
  return (
    <ProductList allProducts={allProducts} setAllProducts={setAllProducts} />
  );
};

export default Products;
