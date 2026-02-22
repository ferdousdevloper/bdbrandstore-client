import React, { useState, useCallback } from "react";
import ProductCategory from "../helpers/ProductCategory";
import { FaCloudUploadAlt, FaBoxOpen } from "react-icons/fa";
import UploadImage from "../helpers/UploadImage";
import DisplayImage from "./DisplayImage";
import { MdDelete, MdClose } from "react-icons/md";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const UploadProduct = ({ onClose, fetchData }) => {
  const [productData, setProductData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    productDesc: "",
    price: "",
    sellingPrice: "",
  });

  const [fullScreenImage, setFullScreenImage] = useState("");
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      const uploadImageToCloudinary = await UploadImage(file);
      setProductData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, uploadImageToCloudinary.url],
      }));
      toast.success("Image added to gallery");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadProductImage = async (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const handleDeleteProductImage = (index) => {
    const newImages = [...productData.productImage];
    newImages.splice(index, 1);
    setProductData((prev) => ({ ...prev, productImage: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(SummaryApi.createProduct.url, {
        method: SummaryApi.createProduct.method,
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onClose();
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to upload product");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // z-index বাড়িয়ে [9999] করা হয়েছে যাতে হেডারের উপরে থাকে
        className="fixed pt-20 inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 z-[9999]"
      >
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.98 }}
          // max-w-2xl করে সাইজ ছোট করা হয়েছে এবং height কন্ট্রোল করা হয়েছে
          className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
        >
          {/* --- Header (Reduced Padding) --- */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <FaBoxOpen size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Add Product</h2>
                <p className="text-xs text-slate-500 font-medium">Create a new item listing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-red-500 hover:shadow-md transition-all border border-slate-100"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* --- Form Body (Optimized Spacing) --- */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">Product Title</label>
                <input
                  type="text"
                  name="productName"
                  value={productData.productName}
                  onChange={handleOnChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all text-sm shadow-sm"
                  placeholder="Product name..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  value={productData.brandName}
                  onChange={handleOnChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all text-sm shadow-sm"
                  placeholder="Brand..."
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Category</label>
              <select
                name="category"
                value={productData.category}
                onChange={handleOnChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none transition-all text-sm shadow-sm cursor-pointer"
                required
              >
                <option value="" disabled>Select Category</option>
                {ProductCategory.map((cat, index) => (
                  <option key={index} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Images</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('upload-product-input').click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-primary-50 transition-all cursor-pointer"
              >
                <input id="upload-product-input" type="file" className="hidden" onChange={handleUploadProductImage} />
                <div className="flex flex-col items-center gap-1">
                  <FaCloudUploadAlt size={28} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-600">Click to upload</p>
                </div>
              </div>

              {productData.productImage.length > 0 && (
                <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                  {productData.productImage.map((img, index) => (
                    <div key={index} className="relative min-w-[80px] h-20 bg-white border border-slate-200 rounded-lg p-1">
                      <img src={img} className="w-full h-full object-contain cursor-pointer" onClick={() => {setFullScreenImage(img); setOpenFullScreenImage(true);}} />
                      <button onClick={() => handleDeleteProductImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110">
                        <MdDelete size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">Price (৳)</label>
                <input type="number" name="price" value={productData.price} onChange={handleOnChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm shadow-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">Selling Price (৳)</label>
                <input type="number" name="sellingPrice" value={productData.sellingPrice} onChange={handleOnChange} className="w-full px-4 py-2.5 bg-slate-50 border border-primary-200 rounded-xl outline-none text-sm shadow-sm text-primary-600 font-bold" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Description</label>
              <textarea
                name="productDesc"
                value={productData.productDesc}
                onChange={handleOnChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 resize-none outline-none text-sm"
                placeholder="Brief description..."
              />
            </div>
          </form>

          {/* --- Footer (Reduced Padding) --- */}
          <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} className="px-8 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold shadow-lg hover:bg-primary-700 transition-all">
              Save Product
            </button>
          </div>
        </motion.div>

        {openFullScreenImage && (
          <DisplayImage imageUrl={fullScreenImage} onClose={() => setOpenFullScreenImage(false)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadProduct;