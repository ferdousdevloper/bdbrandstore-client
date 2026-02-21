import React, { useContext, useEffect, useRef, useState } from "react";
import fetchCategoryWiseProduct from "../helpers/fetchCategoryWiseProduct";
import displayINR from "../helpers/displayCurrency";
import { FaAngleLeft, FaAngleRight, FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useAddToCart from "../helpers/AddToCart";
import AddToWishList from "../helpers/AddToWishlist";
import DeleteToWishList from "../helpers/DeleteWishListProduct";
import context from "../context/Context";
import SummaryApi from "../common/API";
import { motion } from "framer-motion";

const HorizontalProductCard = ({ category, heading }) => {
  const user = useSelector((state) => state?.user?.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const scrollElement = useRef();
  const addToCart = useAddToCart();
  const { fetchAddToWishListCount } = useContext(context);

  const getWishlistItem = (productId) => wishlist.find((item) => item?.productId?._id === productId);
  const isInWishlist = (productId) => Boolean(getWishlistItem(productId));

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    const item = getWishlistItem(productId);
    if (item) await DeleteToWishList(e, item._id);
    else await AddToWishList(e, productId);
    fetchAddToWishListCount();
    fetchWishlist();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchCategoryWiseProduct(category);
      setData(result.product || []);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(SummaryApi.getWishList.url, {
        method: SummaryApi.getWishList.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setWishlist(json.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
    fetchWishlist();
  }, [user]);

  const scroll = (dir) => {
    if (!scrollElement.current) return;
    scrollElement.current.scrollLeft += dir === "right" ? 320 : -320;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">{heading}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-white border border-surface-200 shadow-card flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:text-primary-600 hidden md:flex"
            onClick={() => scroll("left")}
          >
            <FaAngleLeft />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-white border border-surface-200 shadow-card flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:text-primary-600 hidden md:flex"
            onClick={() => scroll("right")}
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-none pb-2" ref={scrollElement}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] md:w-[320px] h-36 bg-white rounded-2xl border border-surface-100 shadow-card flex"
              >
                <div className="w-32 md:w-36 h-full bg-surface-200 animate-pulse rounded-l-2xl" />
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="h-4 bg-surface-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-surface-200 rounded animate-pulse w-2/3" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-surface-200 rounded animate-pulse w-16" />
                    <div className="h-5 bg-surface-200 rounded animate-pulse w-12" />
                  </div>
                  <div className="h-9 bg-surface-200 rounded-xl animate-pulse w-24" />
                </div>
              </div>
            ))
          : data.map((product) => (
              <motion.div
  whileHover={{ scale: 1.03 }}
  className="flex-shrink-0 w-[320px] md:w-[380px] bg-white rounded-[2rem] p-3 border border-slate-100 shadow-sm hover:shadow-[0_15px_30px_rgba(37,99,235,0.1)] transition-all duration-500"
>
  <Link to={`/product/${product._id}`} className="flex h-36 items-center gap-4">
    
    {/* Product Image Side */}
    <div className="w-32 h-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center p-3 flex-shrink-0 relative overflow-hidden">
        {/* Small Red Corner Tag */}
        <div className="absolute top-0 left-0 bg-red-600 text-[9px] text-white font-bold px-2 py-0.5 rounded-br-xl">
           SALE
        </div>
        <img
          src={product.productImage?.[0]}
          className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-all"
        />
    </div>

    {/* Content Side */}
    <div className="flex-1 flex flex-col justify-between h-full py-1">
      <div className="space-y-1">
        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{product?.category}</p>
        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 leading-tight">{product?.productName}</h3>
        
        <div className="flex flex-col mt-1">
          <span className="text-lg font-black text-slate-900 leading-none">{displayINR(product?.sellingPrice)}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 line-through">{displayINR(product?.price)}</span>
            <span className="text-[10px] text-red-600 font-bold">-{Math.round(((product.price - product.sellingPrice) / product.price) * 100)}%</span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => addToCart(e, product?._id)}
        className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-[10px] font-black hover:shadow-lg hover:shadow-primary-200 transition-all uppercase tracking-tighter"
      >
        Add to Cart
      </button>
    </div>
  </Link>
</motion.div>
            ))}
      </div>
    </div>
  );
};

export default HorizontalProductCard;
