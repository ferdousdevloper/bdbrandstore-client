import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CategoryList = () => {
  const [categoryProduct, setCategoryProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const categoryLoading = new Array(10).fill(null);

  const fetchCategoryProduct = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.getProductByCategory.url, {
      method: SummaryApi.getProductByCategory.method,
    });
    const responseData = await response.json();
    setLoading(false);
    setCategoryProduct(responseData?.data || []);
  };

  useEffect(() => {
    fetchCategoryProduct();
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-thin scrollbar-none pb-2">
        {loading
          ? categoryLoading.map((_, index) => (
              <div
                key={"cat-skel-" + index}
                className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-surface-200 animate-pulse"
              />
            ))
          : categoryProduct.map((category, index) => (
              <motion.div
                key={category?.category + index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={"/category-product?category=" + category?.category}
                  className="flex flex-col items-center gap-3 group min-w-[90px]"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border border-slate-100 flex justify-center items-center overflow-hidden shadow-sm group-hover:shadow-xl group-hover:border-primary-500 group-hover:-translate-y-1 transition-all duration-500">
                    <img
                      src={category?.productImage?.[0]}
                      alt={category?.category}
                      className="h-full w-full object-contain p-3 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                    />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-slate-500 group-hover:text-primary-600 transition-colors capitalize tracking-tight">
                    {category?.category}
                  </span>
                  <div className="h-1 w-0 group-hover:w-8 bg-primary-500 rounded-full transition-all duration-300"></div>
                </Link>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default CategoryList;
