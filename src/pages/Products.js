import React, { useEffect, useMemo, useState } from "react";
import UploadProduct from "../components/UploadProduct";
import SummaryApi from "../common/API";
import AdminProductCard from "../components/AdminProductCard";
import AdminEditProduct from "../components/AdminEditProduct";
import {
  FaPlus,
  FaSearch,
  FaBoxOpen,
  FaLayerGroup,
  FaDollarSign,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  const [openUploadProduct, setopenUploadProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // 🔥 NEW (User modal pattern)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getProduct.url, {
        method: SummaryApi.getProduct.method,
      });

      const data = await response.json();
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔥 Edit handlers (same pattern as AllUsers)
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
  return products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      product.productName?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText);

    const matchCategory =
      category === "all" || product.category === category;

    return matchSearch && matchCategory;
  });
}, [products, search, category]);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalValue = products.reduce(
    (acc, item) => acc + (item.sellingPrice || 0),
    0
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05 },
  };

  return (
    <div className="flex flex-col gap-6">

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <FaBoxOpen size={22} className="text-blue-600" />
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <h2 className="text-2xl font-bold">{totalProducts}</h2>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <FaLayerGroup size={22} className="text-green-600" />
          <div>
            <p className="text-gray-500 text-sm">Categories</p>
            <h2 className="text-2xl font-bold">{totalCategories}</h2>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <FaDollarSign size={22} className="text-purple-600" />
          <div>
            <p className="text-gray-500 text-sm">Total Value</p>
            <h2 className="text-2xl font-bold">৳ {totalValue}</h2>
          </div>
        </div>
      </div>

      {/* 🔍 Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white p-5 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            All Products
          </h1>
          <p className="text-sm text-gray-500">
            Manage and control your product listings
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setopenUploadProduct(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl"
          >
            <FaPlus />
            Upload
          </button>
        </div>
      </div>
     {/* 🔎 Premium Search & Filter */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-[1px] shadow-lg">

  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 flex flex-col md:flex-row gap-5 items-center justify-between">

    {/* 🔍 Search Bar */}
    <div className="relative w-full md:w-1/2 group">
      <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" />
      <input
        type="text"
        placeholder="Search products by name or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 shadow-sm"
      />
    </div>

    {/* 📂 Category Dropdown */}
    <div className="relative w-full md:w-1/4">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full py-3 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 shadow-sm cursor-pointer"
      >
        <option value="all">🌍 All Categories</option>
        {categories.map((cat, index) => (
          <option key={index} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>

    {/* ❌ Clear Filter Button */}
    {(search || category !== "all") && (
      <button
        onClick={() => {
          setSearch("");
          setCategory("all");
        }}
        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
      >
        Clear
      </button>
    )}

  </div>
</div>

      {/* Upload Modal */}
      {openUploadProduct && (
        <UploadProduct
          onClose={() => setopenUploadProduct(false)}
          fetchData={fetchProducts}
        />
      )}

      {/* Product Grid */}
      <div className="bg-white p-5 rounded-2xl shadow-md">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id || index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <AdminProductCard
                    product={product}
                    onEdit={handleEditProduct}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 🔥 EDIT MODAL (Parent Controlled — Like AllUsers) */}
      {selectedProduct && isEditModalOpen && (
        <AdminEditProduct
          product={selectedProduct}
          onClose={handleEditClose}
          fetchData={fetchProducts}
        />
      )}
    </div>
  );
};

export default Products;