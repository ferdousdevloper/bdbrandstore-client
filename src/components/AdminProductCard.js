import React from "react";
import { FaEdit } from "react-icons/fa";
import displayBDTCurrency from "../helpers/displayCurrency";

const AdminProductCard = ({ product, onEdit }) => {
  const discount =
    product.price && product.sellingPrice
      ? Math.round(
          ((product.price - product.sellingPrice) / product.price) * 100
        )
      : 0;

  // const inStock = product?.stock > 0;

  return (
    <div className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:shadow-2xl transition-all duration-500">

      {/* Glass Card */}
      <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg transition-all duration-500">

        {/* Edit Button */}
        <div
          onClick={() => onEdit(product)}
          className="absolute top-3 right-3 z-20 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition cursor-pointer"
        >
          <FaEdit size={14} />
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-20 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            -{discount}%
          </div>
        )}

       
        {/* Stock Badge */}
       {/*
        <div
          className={`absolute bottom-3 left-3 z-20 text-xs font-medium px-3 py-1 rounded-full shadow-md ${
            inStock
              ? "bg-green-500 text-white"
              : "bg-gray-400 text-white"
          }`}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </div> */}

        {/* Image Section (FULL IMAGE visible) */}
        <div className="h-56 w-full flex items-center justify-center bg-white overflow-hidden">
          <img
            src={product?.productImage[0]}
            alt={product.productName}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">

          <h2 className="text-gray-800 font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition">
            {product.productName}
          </h2>

          <p className="text-sm text-gray-500 capitalize">
            {product.category}
          </p>

          {/* Price Section */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-blue-600">
              {displayBDTCurrency(product.sellingPrice)}
            </span>

            {product.price && (
              <span className="text-sm text-gray-400 line-through">
                {displayBDTCurrency(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none"></div>
      </div>
    </div>
  );
};

export default AdminProductCard;