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
  FaSyncAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// .env থেকে ডোমেইনটি নিয়ে আসা হচ্ছে
const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_DOMAIN;

const Products = () => {
  const [openUploadProduct, setopenUploadProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // SummaryApi এর URL যদি হার্ডকোডেড থাকে তবে সেটিও ডাইনামিকলি হ্যান্ডেল করা উচিত
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

  // --- Fixed Delete Product Functionality with .env ---
  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this product!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-[2rem]',
      }
    });

    if (result.isConfirmed) {
      try {
        // 🔥 URL updated with BACKEND_DOMAIN
        const response = await fetch(`${BACKEND_DOMAIN}/api/delete-product/${productId}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            "authorization" : localStorage.getItem('token') 
          },
          credentials: 'include' 
        });

        const dataResponse = await response.json();

        if (dataResponse.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: dataResponse.message,
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
              popup: 'rounded-[2rem]',
            }
          });
          fetchProducts();
        } else {
          toast.error(dataResponse.message);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

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

  return (
    <div className="flex flex-col gap-8">
      
      {/* 📊 Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-surface-100 p-6 rounded-3xl shadow-soft flex items-center gap-5">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
            <FaBoxOpen size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Products</p>
            <h2 className="text-2xl font-extrabold text-slate-800">{totalProducts}</h2>
          </div>
        </div>

        <div className="bg-white border border-surface-100 p-6 rounded-3xl shadow-soft flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <FaLayerGroup size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Categories</p>
            <h2 className="text-2xl font-extrabold text-slate-800">{totalCategories}</h2>
          </div>
        </div>

        <div className="bg-white border border-surface-100 p-6 rounded-3xl shadow-soft flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <FaDollarSign size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Inventory Value</p>
            <h2 className="text-2xl font-extrabold text-slate-800">৳ {totalValue.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* 🔍 Header & Actions */}
      <div className="bg-white p-6 rounded-3xl border border-surface-100 shadow-soft">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-800">Product Inventory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage stock, prices and product categories</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={fetchProducts}
              className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-100"
              title="Refresh Data"
            >
              <FaSyncAlt className={`${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setopenUploadProduct(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
            >
              <FaPlus /> Add Product
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300"
            />
          </div>

          <div className="md:w-64">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 cursor-pointer font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {(search || category !== "all") && (
             <button
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="px-6 py-3 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 📦 Product Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium">Fetching your products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <AdminProductCard
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={() => handleDeleteProduct(product._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
             <FaBoxOpen size={50} className="mx-auto text-slate-200 mb-4" />
             <h3 className="text-xl font-bold text-slate-800">No Products Found</h3>
             <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {openUploadProduct && (
        <UploadProduct
          onClose={() => setopenUploadProduct(false)}
          fetchData={fetchProducts}
        />
      )}

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