import React, { useContext, useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { useSelector } from "react-redux";
import wishlistImg from "../assest/Images/wishlist.png";
import { Link } from "react-router-dom";
import { MdDelete, MdOutlineFavoriteBorder } from "react-icons/md";
import Context from "../context/Context";
import displayBDTCurrency from "../helpers/displayCurrency";
import Swal from "sweetalert2";

const UserWishList = () => {
  const user = useSelector((state) => state?.user?.user);
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchAddToWishListCount } = useContext(Context);
  const wishlistLoadingList = new Array(4).fill(null);

  const fetchWishlistData = async () => {
    const apiResponse = await fetch(`${SummaryApi.getWishList.url}`, {
      method: SummaryApi.getWishList.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
    });
    const apiResponseData = await apiResponse.json();
    if (apiResponseData.success) {
      setWishlistData(apiResponseData.data);
    }
  };

  const handleLoading = async () => {
    setLoading(true);
    await fetchWishlistData();
    setLoading(false);
  };

  useEffect(() => {
    if (user?._id) {
      handleLoading();
    }
  }, [user?._id]);

  const deleteWishlistProduct = async (e, wishlistId) => {
    e.stopPropagation();
    e.preventDefault();

    Swal.fire({
      title: "Are you sure?",
      text: "Remove this item from wishlist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: 'rounded-[1.5rem] md:rounded-[2rem]',
        confirmButton: 'rounded-xl px-4 md:px-6 py-2 md:py-2.5 font-bold text-sm md:text-base',
        cancelButton: 'rounded-xl px-4 md:px-6 py-2 md:py-2.5 font-bold text-sm md:text-base'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const apiResponse = await fetch(`${SummaryApi.deletewishlistProduct.url}`, {
          method: SummaryApi.deletewishlistProduct.method,
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ wishlistId: wishlistId }),
        });

        const apiResponseData = await apiResponse.json();
        if (apiResponseData.success) {
          fetchWishlistData();
          fetchAddToWishListCount();
          
          Swal.fire({
            title: "Deleted!",
            icon: "success",
            showConfirmButton: false,
            timer: 1200,
            customClass: { popup: 'rounded-[1.5rem]' }
          });
        }
      }
    });
  };

  return (
    <div className="w-full min-h-full p-3 sm:p-4 md:p-6 bg-slate-50/50">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            My Wishlist <MdOutlineFavoriteBorder className="text-primary-500" />
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5 font-medium">
            Items you've saved for later.
          </p>
        </div>
        <div className="bg-white self-start sm:self-center px-4 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-base md:text-lg font-black text-primary-600 leading-none">
            {wishlistData.length}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {wishlistData.length === 0 && !loading && (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 md:p-12 flex flex-col items-center text-center max-w-lg mx-auto mt-10">
          <div className="relative">
             <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl opacity-30 animate-pulse"></div>
             <img src={wishlistImg} className="w-32 h-32 md:w-48 md:h-48 object-contain relative z-10 mix-blend-multiply mb-6" alt="Empty" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-slate-500 mt-2 text-xs md:text-sm leading-relaxed px-4">
            Looks like you haven't found your favorites yet.
          </p>
          <Link to="/" className="mt-6 md:mt-8 px-6 md:px-8 py-2.5 md:py-3.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm md:text-base font-bold transition-all hover:shadow-lg active:scale-95">
            Explore Products
          </Link>
        </div>
      )}

      {/* Wishlist Items List */}
      <div className="grid gap-3 md:gap-5 max-h-[75vh] overflow-y-auto scrollbar-thin pr-1 md:pr-2">
        {loading
          ? wishlistLoadingList.map((_, idx) => (
              <div key={idx} className="w-full h-24 md:h-32 bg-white rounded-2xl md:rounded-3xl border border-slate-100 flex animate-pulse overflow-hidden">
                <div className="w-24 md:w-32 h-full bg-slate-100" />
                <div className="flex-1 p-3 md:p-5 space-y-2 md:space-y-3">
                  <div className="h-4 md:h-5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-3 md:h-4 bg-slate-100 rounded-lg w-1/4" />
                </div>
              </div>
            ))
          : wishlistData.map((product) => (
              <Link
                to={`/product/${product?.productId?._id}`}
                key={product?._id}
                className="group w-full bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex items-center hover:shadow-md transition-all duration-300 overflow-hidden relative"
              >
                {/* Product Image */}
                <div className="w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 bg-slate-50 flex items-center justify-center p-2 md:p-3 flex-shrink-0 group-hover:bg-primary-50/30 transition-colors">
                  <img
                    src={product?.productId?.productImage?.[0]}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    alt={product?.productId?.productName}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 px-3 md:px-5 py-2 md:py-4 min-w-0">
                  <span className="hidden sm:inline-block text-[8px] md:text-[10px] font-bold text-primary-500 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md mb-1">
                    {product?.productId?.category}
                  </span>
                  <h2 className="font-bold text-slate-800 text-xs sm:text-sm md:text-lg truncate group-hover:text-primary-600 transition-colors">
                    {product?.productId?.productName}
                  </h2>
                  <p className="mt-0.5 md:mt-1 font-black text-slate-800 text-sm sm:text-base md:text-xl">
                    {displayBDTCurrency(product?.productId?.sellingPrice)}
                  </p>
                </div>

                {/* Delete Button */}
                <div className="pr-2 md:pr-6">
                  <button
                    type="button"
                    className="p-2 md:p-3 rounded-lg md:rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 active:scale-90"
                    onClick={(e) => deleteWishlistProduct(e, product?._id)}
                  >
                    <MdDelete className="text-lg md:text-2xl" />
                  </button>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default UserWishList;