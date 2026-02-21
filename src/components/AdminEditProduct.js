import React, { useState, useCallback } from "react";
import ProductCategory from "../helpers/ProductCategory";
import { FaCloudUploadAlt, FaRegEdit } from "react-icons/fa";
import UploadImage from "../helpers/UploadImage";
import DisplayImage from "./DisplayImage";
import { MdDelete, MdClose } from "react-icons/md";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminEditProduct = ({ onClose, product, fetchData }) => {
  const [productData, setproductData] = useState({
    ...product,
    productName: product?.productName || "",
    brandName: product?.brandName || "",
    category: product?.category || "",
    productImage: product?.productImage || [],
    productDesc: product?.productDesc || "",
    price: product?.price || "",
    sellingPrice: product?.sellingPrice || "",
  });

  const [fullScreenImage, setfullScreenImage] = useState("");
  const [openFullScreenImage, setopenFullScreenImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setproductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      const uploadImageToCloudinary = await UploadImage(file);
      setproductData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, uploadImageToCloudinary.url],
      }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed");
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
    setproductData((prev) => ({
      ...prev,
      productImage: newImages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiResponse = await fetch(SummaryApi.updateProduct.url, {
        method: SummaryApi.updateProduct.method,
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      const responseData = await apiResponse.json();

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        fetchData();
      } else {
        toast.error(responseData.message);
      }
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20"
        >
          {/* --- Header --- */}
          <div className="flex justify-between items-center px-10 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                <FaRegEdit size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Edit Product
                </h2>
                <p className="text-sm text-slate-500 font-medium">Refine your product details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-red-500 hover:shadow-lg transition-all border border-slate-100"
            >
              <MdClose size={24} />
            </button>
          </div>

          {/* --- Body --- */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-10 py-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200"
          >
            {/* Row 1: Basic Info */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Product Title</label>
                <input
                  type="text"
                  name="productName"
                  placeholder="Enter product name"
                  value={productData.productName}
                  onChange={handleOnChange}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-slate-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Brand Identifier</label>
                <input
                  type="text"
                  name="brandName"
                  placeholder="Enter brand name"
                  value={productData.brandName}
                  onChange={handleOnChange}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Row 2: Category */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Collection / Category</label>
              <select
                name="category"
                value={productData.category}
                onChange={handleOnChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-slate-700 cursor-pointer shadow-sm"
                required
              >
                <option value="" disabled>Select a category</option>
                {ProductCategory.map((cat, index) => (
                  <option key={index} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Row 3: Image Upload Area */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Media Gallery</label>
              
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('upload-input').click()}
                className={`group border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer bg-slate-50/50
                  ${isUploading ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50/30'}`}
              >
                <input
                  id="upload-input"
                  type="file"
                  className="hidden"
                  onChange={handleUploadProductImage}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all mb-2
                    ${isUploading ? 'bg-primary-500 text-white animate-bounce' : 'bg-white text-slate-400 group-hover:text-primary-500 shadow-sm'}`}>
                    <FaCloudUploadAlt size={32} />
                  </div>
                  <p className="text-slate-600 font-bold">
                    {isUploading ? "Processing Media..." : "Drag media here or click to browse"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">Supports JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              </div>

              {/* Image Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                <AnimatePresence>
                  {productData.productImage.map((img, index) => (
                    <motion.div 
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square group rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={img}
                        alt="preview"
                        className="h-full w-full object-contain bg-white p-2 cursor-pointer"
                        onClick={() => {
                          setfullScreenImage(img);
                          setopenFullScreenImage(true);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteProductImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-all hover:bg-red-600"
                      >
                        <MdDelete size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Row 4: Pricing */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Market Price (৳)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleOnChange}
                    className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Our Selling Price (৳)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500 font-bold">৳</span>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={productData.sellingPrice}
                    onChange={handleOnChange}
                    className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-primary-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold text-primary-600"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Description */}
            <div className="space-y-2 pb-4">
              <label className="text-sm font-bold text-slate-700 ml-1">Product Narrative</label>
              <textarea
                name="productDesc"
                value={productData.productDesc}
                onChange={handleOnChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] h-40 resize-none focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-slate-700 leading-relaxed"
                placeholder="Tell your customers more about this product..."
              />
            </div>
          </form>

          {/* --- Footer --- */}
          <div className="flex items-center justify-end gap-4 px-10 py-7 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md">
            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent hover:border-slate-200"
            >
              Discard Changes
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-black shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 transition-all"
            >
              Save Product Details
            </motion.button>
          </div>
        </motion.div>

        {openFullScreenImage && (
          <DisplayImage
            imageUrl={fullScreenImage}
            onClose={() => setopenFullScreenImage(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminEditProduct;