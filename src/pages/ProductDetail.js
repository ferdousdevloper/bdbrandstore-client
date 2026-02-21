import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SummaryApi from "../common/API";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaBolt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import displayBDTCurrency from "../helpers/displayCurrency";
import VerticalProductCard from "../components/VerticalProductCard";
import useAddToCart from "../helpers/AddToCart";
import AddToWishList from "../helpers/AddToWishlist";
import { useSelector } from "react-redux";
import context from "../context/Context";
import { motion } from "framer-motion";

const ProductDetail = () => {
  const user = useSelector((state) => state?.user?.user);
  const [productData, setProductData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    productDesc: "",
    price: "",
    sellingPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const addToCart = useAddToCart();
  const { fetchAddToWishListCount } = useContext(context);
  const productId = useParams();
  const navigate = useNavigate();

  const fetchProductDetails = async () => {
    setLoading(true);
    const data = await fetch(`${SummaryApi.singleProductDetail.url}/${productId?.id}`, {
      method: SummaryApi.singleProductDetail.method,
    });
    const response = await data.json();
    setLoading(false);
    setProductData(response?.product || {});
    setActiveImg(response?.product?.productImage?.[0]);
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId?.id]);

  const fetchWishlist = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(SummaryApi.getWishList.url, {
        method: SummaryApi.getWishList.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) setWishlist(result.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  };

  const handleAddToWishList = async (e, id) => {
    e.preventDefault();
    await AddToWishList(e, id);
    fetchAddToWishListCount();
    fetchWishlist();
  };

  const isInWishlist = (id) => wishlist.some((item) => item?.productId?._id === id);
  const productImageListLoading = Array(4).fill(null);

  const handleBuyNow = async (e) => {
    const result = await addToCart(e, productData?._id);
    if (result?.success) navigate("/user-panel/cart");
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="min-h-[200px] flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col lg:flex-row-reverse gap-4">
          <div className="relative h-72 lg:h-96 w-full max-w-md rounded-2xl bg-surface-50 border border-surface-100 overflow-visible">
            <div className="w-full h-full overflow-hidden rounded-2xl">
              {activeImg && (
                <img
                  src={activeImg}
                  alt=""
                  className="w-full h-full object-contain mix-blend-multiply p-4 cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setShowZoom(true)}
                  onMouseLeave={() => setShowZoom(false)}
                />
              )}
            </div>
            {showZoom && activeImg && (
              <div
                className="hidden lg:block absolute top-0 left-full ml-4 w-64 h-64 border border-surface-200 rounded-xl overflow-hidden bg-surface-50 shadow-lg z-10 pointer-events-none"
                style={{
                  backgroundImage: `url(${activeImg})`,
                  backgroundSize: "400%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            )}
          </div>
          <div className="flex gap-2 lg:flex-col overflow-x-auto scrollbar-none">
            {loading
              ? productImageListLoading.map((_, i) => (
                  <div key={i} className="h-20 w-20 rounded-xl bg-surface-200 animate-pulse flex-shrink-0" />
                ))
              : productData.productImage?.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`h-20 w-20 rounded-xl border-2 flex-shrink-0 overflow-hidden transition-all ${
                      activeImg === img ? "border-primary-500" : "border-surface-200"
                    }`}
                    onClick={() => setActiveImg(img)}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 bg-surface-200 rounded animate-pulse w-24" />
              <div className="h-10 bg-surface-200 rounded animate-pulse w-full" />
              <div className="h-5 bg-surface-200 rounded animate-pulse w-32" />
              <div className="h-12 bg-surface-200 rounded animate-pulse w-40" />
              <div className="h-12 bg-surface-200 rounded-xl animate-pulse w-full" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {productData.brandName}
                </span>
                <button
                  type="button"
                  className={`p-2 rounded-xl ${isInWishlist(productData?._id) ? "text-accent-coral" : "text-slate-500 hover:text-accent-coral"}`}
                  onClick={(e) => handleAddToWishList(e, productData?._id)}
                >
                  {isInWishlist(productData?._id) ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
                </button>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{productData.productName}</h1>
              <p className="text-slate-500 capitalize">{productData.category}</p>
              <div className="flex text-amber-500 gap-0.5">
                <FaStar /><FaStar /><FaStar /><FaStarHalfAlt /><FaRegStar />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold text-primary-600">{displayBDTCurrency(productData.sellingPrice)}</span>
                <span className="text-slate-400 line-through">{displayBDTCurrency(productData.price)}</span>
                {productData.sellingPrice && productData.price && (
                  <span className="text-sm font-medium text-emerald-600">
                    {Math.round(((productData.price - productData.sellingPrice) / productData.price) * 100)}% off
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-2"
                  onClick={handleBuyNow}
                >
                  <FaBolt /> Buy Now
                </button>
                <button
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors flex items-center gap-2"
                  onClick={(e) => addToCart(e, productData?._id)}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
              <div className="pt-4 border-t border-surface-200">
                <p className="text-lg font-semibold text-slate-700 mb-2">Description</p>
                <p className="text-slate-600 leading-relaxed">{productData.productDesc}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {productData?.category && (
        <div className="mt-12">
          <VerticalProductCard category={productData.category} heading="Related Products" />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
