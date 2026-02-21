import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCategory from "../helpers/ProductCategory";
import SearchProductCard from "../components/SearchProductCard";
import SummaryApi from "../common/API";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaTimes } from "react-icons/fa";

const CategoryProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const URLSearch = new URLSearchParams(location.search);
  const URLCategoryListArray = URLSearch.getAll("category");

  const urlCategoryListObject = {};
  URLCategoryListArray.forEach((el) => {
    urlCategoryListObject[el] = true;
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectCategory, setSelectCategory] = useState(urlCategoryListObject);
  const [filterCategoryList, setFilterCategoryList] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const apiResponse = await fetch(SummaryApi.filterProduct.url, {
      method: SummaryApi.filterProduct.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category: filterCategoryList }),
    });
    const apiData = await apiResponse.json();
    setData(apiData?.data || []);
    setLoading(false);
  };

  const handleSelectCategory = (e) => {
    const { value, checked } = e.target;
    setSelectCategory((prev) => ({ ...prev, [value]: checked }));
  };

  useEffect(() => {
    fetchData();
  }, [filterCategoryList]);

  useEffect(() => {
    const arrayOfCategory = Object.keys(selectCategory)
      .filter((key) => selectCategory[key]);
    setFilterCategoryList(arrayOfCategory);
    const urlFormat = arrayOfCategory.map((el) => `category=${el}`).join("&");
    navigate("/category-product?" + urlFormat, { replace: true });
  }, [selectCategory]);

  const handleSortByPrice = (e) => {
    const { value } = e.target;
    setSortByPrice(value);
    if (value === "asc") {
      setData((prev) => [...prev].sort((a, b) => a.sellingPrice - b.sellingPrice));
    }
    if (value === "desc") {
      setData((prev) => [...prev].sort((a, b) => b.sellingPrice - a.sellingPrice));
    }
  };

  const SidebarContent = () => (
    <>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide border-b border-surface-200 pb-2">
          Sort by price
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="sortByPrice"
              value="asc"
              checked={sortByPrice === "asc"}
              onChange={handleSortByPrice}
              className="w-4 h-4 text-primary-500 border-surface-300 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700 group-hover:text-primary-600">Low to High</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="sortByPrice"
              value="desc"
              checked={sortByPrice === "desc"}
              onChange={handleSortByPrice}
              className="w-4 h-4 text-primary-500 border-surface-300 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700 group-hover:text-primary-600">High to Low</span>
          </label>
        </div>
      </div>
      <div className="space-y-4 pt-4 border-t border-surface-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide border-b border-surface-200 pb-2">
          Category
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
          {ProductCategory.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer group py-1"
            >
              <input
                type="checkbox"
                name="category"
                checked={!!selectCategory[cat.value]}
                value={cat.value}
                id={cat.value}
                onChange={handleSelectCategory}
                className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-primary-600 capitalize">
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-surface-100 shadow-soft p-5">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile filter button */}
        <div className="md:hidden flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-200 shadow-card text-slate-700 font-medium"
          >
            <FaFilter /> Filters & Sort
          </button>
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{data.length}</span> results
          </p>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setMobileFilterOpen(false)}
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 p-6 overflow-y-auto md:hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Filters & Sort</h2>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-2 rounded-xl hover:bg-surface-100 text-slate-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <main className="flex-1 min-w-0">
          <div className="hidden md:flex items-center justify-between mb-4">
            <p className="text-slate-600">
              <span className="font-semibold text-slate-800">{data.length}</span> products
            </p>
          </div>
          <div className="max-h-[calc(100vh-140px)] md:max-h-none overflow-y-auto scrollbar-thin">
            {loading ? (
              <SearchProductCard loading={true} data={[]} />
            ) : data.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-surface-100 shadow-soft p-12 text-center"
              >
                <p className="text-slate-500 text-lg">No products match your filters.</p>
                <p className="text-sm text-slate-400 mt-1">Try changing category or sort.</p>
              </motion.div>
            ) : (
              <SearchProductCard loading={false} data={data} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryProduct;
