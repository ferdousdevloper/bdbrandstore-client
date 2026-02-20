import React, { useState, useCallback } from "react";
import ProductCategory from "../helpers/ProductCategory";
import { FaCloudUploadAlt } from "react-icons/fa";
import UploadImage from "../helpers/UploadImage";
import DisplayImage from "./DisplayImage";
import { MdDelete } from "react-icons/md";
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

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setproductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadFile = async (file) => {
    const uploadImageToCloudinary = await UploadImage(file);
    setproductData((prev) => ({
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ y: 30, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 30, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Edit Product
              </h2>
              <p className="text-sm text-gray-500">
                Update product details and pricing
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-lg transition"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
          >
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={productData.productName}
                  onChange={handleOnChange}
                  className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Brand Name
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={productData.brandName}
                  onChange={handleOnChange}
                  className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Category
              </label>
              <select
                name="category"
                value={productData.category}
                onChange={handleOnChange}
                className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Category</option>
                {ProductCategory.map((cat, index) => (
                  <option key={index} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Images */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Product Images
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer"
              >
                <FaCloudUploadAlt className="text-3xl mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  Drag & Drop or Click to Upload
                </p>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUploadProductImage}
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                {productData.productImage.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt="product"
                      className="h-28 w-full object-cover rounded-xl border cursor-pointer"
                      onClick={() => {
                        setfullScreenImage(img);
                        setopenFullScreenImage(true);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteProductImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <MdDelete size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Original Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={productData.price}
                  onChange={handleOnChange}
                  className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Selling Price
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={productData.sellingPrice}
                  onChange={handleOnChange}
                  className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="productDesc"
                value={productData.productDesc}
                onChange={handleOnChange}
                className="mt-1 w-full px-4 py-3 border rounded-xl h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-4 px-8 py-5 border-t bg-gray-50 rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:scale-105 transition"
            >
              Update Product
            </button>
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