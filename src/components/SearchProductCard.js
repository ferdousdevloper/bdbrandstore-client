import React from "react";
import displayBDTCurrency from "../helpers/displayCurrency";
import useAddToCart from "../helpers/AddToCart";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SearchProductCard = ({ loading, data = [] }) => {
  const loadingList = Array(8).fill(null);
  const addToCart = useAddToCart();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loadingList.map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden"
          >
            <div className="h-44 bg-surface-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-surface-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-surface-200 rounded animate-pulse w-1/2" />
              <div className="flex gap-2">
                <div className="h-5 bg-surface-200 rounded animate-pulse w-20" />
                <div className="h-5 bg-surface-200 rounded animate-pulse w-16" />
              </div>
              <div className="h-10 bg-surface-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Link
            to={`/product/${product._id}`}
            className="block bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden hover:shadow-cardHover hover:border-primary-100 transition-all duration-300 group"
          >
            <div className="h-44 bg-surface-50 flex items-center justify-center p-4">
              <img
                src={product.productImage?.[0]}
                alt={product.productName}
                className="max-h-full w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
              />
            </div>
            <div className="p-4 space-y-2">
              <h2 className="font-semibold text-slate-800 line-clamp-2 min-h-[2.5rem]">
                {product?.productName}
              </h2>
              <p className="text-sm text-slate-500 capitalize">{product?.category}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary-600">
                  {displayBDTCurrency(product?.sellingPrice)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {displayBDTCurrency(product?.price)}
                </span>
              </div>
              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                onClick={(e) => addToCart(e, product?._id)}
              >
                Add to cart
              </button>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default SearchProductCard;
