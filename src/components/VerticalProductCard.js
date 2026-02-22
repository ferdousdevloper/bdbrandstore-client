import React, { useContext, useEffect, useRef, useState } from "react";
import { FaAngleLeft, FaAngleRight, FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import fetchCategoryWiseProduct from "../helpers/fetchCategoryWiseProduct";
import displayINR from "../helpers/displayCurrency";
import useAddToCart from "../helpers/AddToCart";
import AddToWishList from "../helpers/AddToWishlist";
import DeleteToWishList from "../helpers/DeleteWishListProduct";
import context from "../context/Context";
import SummaryApi from "../common/API";
import { motion } from "framer-motion";

const VerticalProductCard = ({ category, heading }) => {
  const user = useSelector((state) => state?.user?.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const scrollElement = useRef();
  const addToCart = useAddToCart();
  const { fetchAddToWishListCount } = useContext(context);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchCategoryWiseProduct(category);
      setData(result.product || []);
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (user?._id) {
      try {
        const response = await fetch(SummaryApi.getWishList.url, {
          method: SummaryApi.getWishList.method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const result = await response.json();
        if (result.success) setWishlist(result.data || []);
      } catch (err) {}
    }
  };

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    const wishlistItem = wishlist.find((item) => item?.productId?._id === productId);
    if (wishlistItem) await DeleteToWishList(e, wishlistItem._id);
    else await AddToWishList(e, productId);
    fetchAddToWishListCount();
    fetchWishlist();
  };

  useEffect(() => {
    fetchData();
    fetchWishlist();
  }, [user]);

  const scroll = (direction) => {
    if (!scrollElement.current) return;
    scrollElement.current.scrollLeft += direction === "right" ? 320 : -320;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">{heading || "Products"}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-white border border-surface-200 shadow-card flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all hidden md:flex"
            onClick={() => scroll("left")}
          >
            <FaAngleLeft />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-white border border-surface-200 shadow-card flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all hidden md:flex"
            onClick={() => scroll("right")}
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
      <div
        className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-none pb-2"
        ref={scrollElement}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] md:w-[300px] bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden"
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
            ))
          : data.map((product) => (
              <motion.div
  whileHover={{ y: -10 }}
  className="flex-shrink-0 w-[250px] md:w-[280px] bg-white rounded-[2.5rem] p-3 border border-slate-50 relative group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] group" 
  /* এখানে rgba(37,99,235,0.15) আপনার থিমের প্রাইমারি কালার অনুযায়ী অ্যাডজাস্ট করবেন */
>
  <Link to={`/product/${product._id}`} className="flex flex-col h-full">
    
    {/* Image Container */}
    <div className="relative h-56 bg-slate-50 rounded-[2.2rem] flex items-center justify-center p-6 overflow-hidden">
      
      {/* ⚡ BOLD DISCOUNT BADGE ⚡ */}
      {product.price > product.sellingPrice && (
        <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-1.5 rounded-br-2xl shadow-lg z-10 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase leading-none">Save</span>
          <span className="text-sm font-black tracking-tighter">
            {Math.round(((product.price - product.sellingPrice) / product.price) * 100)}%
          </span>
        </div>
      )}

      {/* Wishlist Button with Glow */}
      <button
        onClick={(e) => handleWishlistToggle(e, product?._id)}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-90"
      >
        {wishlist.some(item => item?.productId?._id === product?._id) ? 
          <FaHeart className="text-red-600 drop-shadow-md" /> : <FaRegHeart />}
      </button>

      {/* Image with subtle shadow */}
      <img
        src={product.productImage?.[0]}
        className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
        alt={product.productName}
      />
    </div>

    {/* Details Section */}
    <div className="px-4 py-5 flex flex-col flex-grow">
      <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">
        {product?.category}
      </span>
      
      <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 h-12 leading-tight group-hover:text-primary-600 transition-colors">
        {product?.productName}
      </h3>
      
      {/* Price & Action row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit mb-1 italic">
            Limited Deal
          </span>
          <div className="flex  flex-col items-baseline gap-1">
            <span className="text-xl font-black text-slate-900 tracking-tighter">{displayINR(product?.sellingPrice)}</span>
            <span className="text-xs text-slate-400 line-through font-medium ml-1">{displayINR(product?.price)}</span>
          </div>
        </div>

        
      </div>
      {/* Circular Theme Button */}
        <button
          onClick={(e) => addToCart(e, product?._id)}
          className="w-full p-3 m-2 bg-gradient-to-tr from-primary-700 to-primary-500 text-white rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:scale-110 transition-all active:scale-95"
        >
          <FaShoppingCart size={18} /> Add to cart
        </button>
    </div>
  </Link>
  <div className="h-1.5 w-0 group-hover:w-full bg-gradient-to-r from-primary-400 to-blue-600 transition-all duration-500 shadow-[0_-4px_10px_rgba(59,130,246,0.3)]"></div>
</motion.div>
            ))}
      </div>
    </div>
  );
};

export default VerticalProductCard;
