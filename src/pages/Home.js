import React from "react";
import CategoryList from "../components/CategoryList";
import BannerProduct from "../components/BannerProduct";
import HorizontalProductCard from "../components/HorizontalProductCard";
import VerticalProductCard from "../components/VerticalProductCard";
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <CategoryList />
      
      <div className="space-y-12">
        <BannerProduct />

        <section className="container mx-auto">
           <HorizontalProductCard category="airpodes" heading="Exclusive Airpodes" />
           <HorizontalProductCard category="watches" heading="Smart Watches" />
        </section>

        <section className="bg-white py-10 shadow-sm">
           <VerticalProductCard category="mobiles" heading="Trending Smartphones" />
        </section>

        <div className="container mx-auto space-y-12">
           <VerticalProductCard category="television" heading="Entertainment & TV" />
           <VerticalProductCard category="camera" heading="Professional Cameras" />
           <VerticalProductCard category="mouse" heading="Gaming Accessories" />
        </div>
      </div>
    </div>
  );
};

export default Home;
