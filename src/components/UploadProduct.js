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
                <FaBoxOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  New Product
                </h2>
                <p className="text-sm text-slate-500 font-medium">Add a new item to your store</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-red-500 hover:shadow-lg transition-all border border-slate-100"
            >
              <MdClose size={24} />
            </button>
          </div>

          {/* --- Form Body --- */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-10 py-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200"
          >
            {/* Grid 1: Name & Brand */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Product Title</label>
                <input
                  type="text"
                  name="productName"
                  value={productData.productName}
                  onChange={handleOnChange}
                  placeholder="e.g. Wireless Bluetooth Headphones"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-slate-800 shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  value={productData.brandName}
                  onChange={handleOnChange}
                  placeholder="e.g. Sony, Samsung, Local"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-slate-800 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Row 2: Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Primary Category</label>
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

            {/* Row 3: Drag & Drop Gallery */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Product Media</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('upload-product-input').click()}
                className={`group border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer bg-slate-50/50
                  ${isUploading ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50/30'}`}
              >
                <input
                  id="upload-product-input"
                  type="file"
                  className="hidden"
                  onChange={handleUploadProductImage}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all mb-2
                    ${isUploading ? 'bg-primary-500 text-white animate-bounce' : 'bg-white text-slate-400 group-hover:text-primary-500 shadow-sm'}`}>
                    <FaCloudUploadAlt size={32} />
                  </div>
                  <p className="text-slate-600 font-black">
                    {isUploading ? "Uploading..." : "Drop your image here or click to browse"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">High resolution images look better (PNG/JPG)</p>
                </div>
              </div>

              {/* Preview Grid */}
              {productData.productImage.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                  <AnimatePresence>
                    {productData.productImage.map((img, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square group rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
                      >
                        <img
                          src={img}
                          alt="preview"
                          className="h-full w-full object-contain p-2 cursor-pointer"
                          onClick={() => {
                            setFullScreenImage(img);
                            setOpenFullScreenImage(true);
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
              )}
            </div>

            {/* Grid 4: Pricing */}
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
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Selling Price (৳)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500 font-bold">৳</span>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={productData.sellingPrice}
                    onChange={handleOnChange}
                    className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-primary-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold text-primary-600 shadow-sm"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Description */}
            <div className="space-y-2 pb-4">
              <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
              <textarea
                name="productDesc"
                value={productData.productDesc}
                onChange={handleOnChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] h-32 resize-none focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-slate-700 leading-relaxed shadow-sm"
                placeholder="Write an engaging description for your product..."
              />
            </div>
          </form>

          {/* --- Footer Actions --- */}
          <div className="flex items-center justify-end gap-4 px-10 py-7 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md">
            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent hover:border-slate-200"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 transition-all"
            >
              Upload Product
            </motion.button>
          </div>
        </motion.div>

        {/* Image Full View */}
        {openFullScreenImage && (
          <DisplayImage
            imageUrl={fullScreenImage}
            onClose={() => setOpenFullScreenImage(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadProduct;