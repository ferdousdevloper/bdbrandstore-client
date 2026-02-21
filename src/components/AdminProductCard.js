import React from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // FaTrashAlt যোগ করা হয়েছে
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import displayBDTCurrency from "../helpers/displayCurrency";

const AdminProductCard = ({ product, onEdit, onDelete }) => { // onDelete prop যোগ করা হয়েছে
  const discount =
    product.price && product.sellingPrice
      ? Math.round(
          ((product.price - product.sellingPrice) / product.price) * 100
        )
      : 0;

  return (
    <div className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full overflow-hidden">
      
      {/* Upper Section: Image & Badges */}
      <div className="relative h-52 w-full bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6 overflow-hidden">
        
        {/* Discount Tag (Luxury Style) */}
        {discount > 0 && (
          <div className="absolute top-4 left-0 z-20 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-r-full shadow-lg">
            SAVE {discount}%
          </div>
        )}

        {/* Action Buttons Container */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            {/* Floating Edit Action */}
            <button
            onClick={() => onEdit(product)}
            className="w-10 h-10 bg-white/80 backdrop-blur-md text-primary-600 rounded-2xl shadow-xl border border-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-primary-600 hover:text-white"
            title="Edit Product"
            >
            <FaEdit size={16} />
            </button>

            {/* Floating Delete Action */}
            <button
            onClick={() => onDelete(product._id)}
            className="w-10 h-10 bg-white/80 backdrop-blur-md text-red-500 rounded-2xl shadow-xl border border-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-125 group-hover:delay-75 transition-all duration-300 hover:bg-red-500 hover:text-white"
            title="Delete Product"
            >
            <FaTrashAlt size={16} />
            </button>
        </div>

        {/* Product Image with Shadow Effect */}
        <div className="relative transition-transform duration-700 group-hover:scale-110">
          <img
            src={product?.productImage[0]}
            alt={product.productName}
            className="max-h-40 max-w-full object-contain drop-shadow-2xl"
          />
          {/* Subtle reflection under image */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-slate-400/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Lower Section: Details */}
      <div className="p-6 pt-2 flex flex-col flex-1 relative">
        
        {/* Category & ID Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-primary-500 uppercase tracking-tighter bg-primary-50 px-2.5 py-1 rounded-lg">
            {product.category}
          </span>
          <span className="text-[9px] font-medium text-slate-300">
            #{product?._id?.slice(-5).toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-slate-800 font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors duration-300">
          {product.productName}
        </h2>

        {/* Pricing Area */}
        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            {product.price > product.sellingPrice && (
              <span className="text-xs text-slate-400 line-through decoration-red-400/50">
                {displayBDTCurrency(product.price)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black text-slate-900 tracking-tight">
                {displayBDTCurrency(product.sellingPrice)}
              </span>
            </div>
          </div>

          {/* Quick Info Icon */}
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
            <HiOutlineArrowNarrowRight size={20} />
          </div>
        </div>
      </div>

      {/* Bottom Color Accent Decor */}
      <div className="h-1.5 w-0 group-hover:w-full bg-gradient-to-r from-primary-400 to-blue-600 transition-all duration-500 shadow-[0_-4px_10px_rgba(59,130,246,0.3)]"></div>
    </div>
  );
};

export default AdminProductCard;