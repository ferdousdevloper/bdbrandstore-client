import React, { useState, useCallback } from "react";
import ProductCategory from "../helpers/ProductCategory";
import { FaCloudUploadAlt } from "react-icons/fa";
import UploadImage from "../helpers/UploadImage";
import DisplayImage from "./DisplayImage";
import { MdDelete } from "react-icons/md";
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

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (file) => {
    const uploadImageToCloudinary = await UploadImage(file);
    setProductData((prev) => ({
      ...prev,
      productImage: [...prev.productImage, uploadImageToCloudinary.url],
    }));
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ y: 40, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 40, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Add Product</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-6 overflow-y-auto"
          >
            <input
              type="text"
              name="productName"
              value={productData.productName}
              onChange={handleOnChange}
              placeholder="Product Name"
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              name="brandName"
              value={productData.brandName}
              onChange={handleOnChange}
              placeholder="Brand Name"
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              name="category"
              value={productData.category}
              onChange={handleOnChange}
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Category</option>
              {ProductCategory.map((cat, index) => (
                <option key={index} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Drag & Drop Images */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer"
            >
              <FaCloudUploadAlt className="text-3xl mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">
                Drag & Drop image here or click
              </p>
              <input
                type="file"
                className="hidden"
                onChange={handleUploadProductImage}
              />
            </div>

            {/* Image Preview */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {productData.productImage.map((img, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <img
                    src={img}
                    alt="product"
                    className="h-28 w-full object-cover rounded-xl border cursor-pointer"
                    onClick={() => {
                      setFullScreenImage(img);
                      setOpenFullScreenImage(true);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteProductImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <MdDelete size={14} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Price & Selling Price */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleOnChange}
                placeholder="Original Price"
                className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                name="sellingPrice"
                value={productData.sellingPrice}
                onChange={handleOnChange}
                placeholder="Selling Price"
                className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <textarea
              name="productDesc"
              value={productData.productDesc}
              onChange={handleOnChange}
              placeholder="Product Description"
              className="px-4 py-2 border rounded-xl h-28 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium shadow-md hover:scale-[1.02] transition-all duration-300"
            >
              Upload Product
            </button>
          </form>
        </motion.div>

        {/* Fullscreen Image */}
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