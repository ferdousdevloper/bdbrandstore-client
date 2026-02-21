import React, { useContext, useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { useSelector } from "react-redux";
import wishlistImg from "../assest/Images/wishlist.png";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Context from "../context/Context";
import displayBDTCurrency from "../helpers/displayCurrency";

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
      headers: {
        "content-type": "application/json",
      },
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
    handleLoading();
  }, [user?._id]);

  // console.log("WishList", wishlistData);

  const deleteWishlistProduct = async (e, wishlistId) => {
    e.stopPropagation();
    e.preventDefault();
    const apiResponse = await fetch(`${SummaryApi.deletewishlistProduct.url}`, {
      method: SummaryApi.deletewishlistProduct.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        wishlistId: wishlistId,
      }),
    });

    const apiResponseData = await apiResponse.json();
    if (apiResponseData.success) {
      fetchWishlistData();
      fetchAddToWishListCount();
    }
  };

  return (
    <div className="w-full h-full p-2 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-500">
            Products you have saved for later
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white border border-surface-200 text-sm text-slate-700">
          Total items:{" "}
          <span className="font-semibold text-primary-600">
            {wishlistData.length}
          </span>
        </div>
      </div>

      {wishlistData.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-8 flex flex-col items-center text-center">
          <img
            src={wishlistImg}
            className="w-40 h-40 object-contain mix-blend-multiply mb-4"
            alt="Empty wishlist"
          />
          <p className="text-slate-600 font-medium">
            Looks like you haven&apos;t added anything to your wishlist yet.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Explore top products and tap the heart icon to save them.
          </p>
          <Link to="/" className="mt-5">
            <button className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm">
              Continue Shopping
            </button>
          </Link>
        </div>
      )}

      <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
        {loading
          ? wishlistLoadingList.map((_, idx) => (
              <div
                key={idx}
                className="w-full h-24 md:h-28 bg-white rounded-2xl border border-surface-200 shadow-card flex animate-pulse"
              >
                <div className="w-24 md:w-28 h-full bg-surface-200 rounded-l-2xl" />
                <div className="flex-1 p-3 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-3/4" />
                  <div className="h-3 bg-surface-200 rounded w-1/3" />
                  <div className="h-4 bg-surface-200 rounded w-1/4" />
                </div>
              </div>
            ))
          : wishlistData.map((product) => (
              <Link
                to={`/product/${product?.productId?._id}`}
                className="w-full bg-white rounded-2xl border border-surface-200 shadow-card flex hover:shadow-cardHover hover:border-primary-100 transition-all duration-300"
                key={product?._id}
              >
                <div className="w-24 md:w-28 h-24 md:h-28 bg-surface-50 rounded-l-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={product?.productId?.productImage?.[0]}
                    className="w-full h-full object-contain mix-blend-multiply p-2"
                    alt={product?.productId?.productName}
                  />
                </div>
                <div className="flex-1 px-4 py-3 relative min-w-0">
                  <button
                    type="button"
                    className="absolute right-3 bottom-3 p-2 rounded-full text-accent-coral/80 hover:bg-accent-coral hover:text-white transition-colors"
                    onClick={(e) => deleteWishlistProduct(e, product?._id)}
                  >
                    <MdDelete className="text-lg" />
                  </button>
                  <h2 className="font-semibold text-slate-800 text-sm md:text-base text-ellipsis line-clamp-1 pr-8">
                    {product?.productId?.productName}
                  </h2>
                  <p className="text-xs text-slate-500 capitalize">
                    {product?.productId?.category}
                  </p>
                  <p className="mt-1 font-semibold text-primary-600 text-sm md:text-base">
                    {displayBDTCurrency(product?.productId?.sellingPrice)}
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default UserWishList;
