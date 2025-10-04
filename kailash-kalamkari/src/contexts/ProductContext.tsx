import React, { createContext, useContext, useState, ReactNode } from "react";

interface Product {
  date: string;
  activity: string;
  details: string;
  // add other product properties
}

interface ProductsContextType {
  allProducts: Product[];
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([
    {
      date: "2023-11-15 10:00 AM",
      activity: "Product Added",
      details: "New 'Silk Saree' added to inventory",
    },
    {
      date: "2023-11-15 09:30 AM",
      activity: "Order Processed",
      details: "Order #12345 for 'Cotton Kurta' completed",
    },
    {
      date: "2023-11-14 05:00 PM",
      activity: "Stock Alert",
      details: "Low stock alert for 'Printed Dupatta'",
    },
    {
      date: "2023-11-14 02:15 PM",
      activity: "Customer Registered",
      details: "New customer 'Priya Sharma' registered",
    },
    {
      date: "2023-11-14 11:45 AM",
      activity: "Report Generated",
      details: "Daily sales report generated",
    },
  ]);

  return (
    <ProductsContext.Provider value={{ allProducts, setAllProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
