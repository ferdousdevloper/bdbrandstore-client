import React, { useState, useEffect, useCallback } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
// ইমেজ ইমপোর্টগুলো আপনার আগের মতোই থাকবে...
import img1 from "../assest/banner/img1.webp";

import img2 from "../assest/banner/img2.webp";

import img3 from "../assest/banner/img3.jpg";

import img4 from "../assest/banner/img4.jpg";

import img5 from "../assest/banner/img5.webp";

import img1Mobile from "../assest/banner/img1_mobile.jpg";

import img2Mobile from "../assest/banner/img2_mobile.webp";

import img3Mobile from "../assest/banner/img3_mobile.jpg";

import img4Mobile from "../assest/banner/img4_mobile.jpg";

import img5Mobile from "../assest/banner/img5_mobile.png";



const BannerProduct = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  const desktopImages = [img1, img2, img3, img4, img5];
  const mobileImages = [img1Mobile, img2Mobile, img3Mobile, img4Mobile, img5Mobile];
  const images = isMobile ? mobileImages : desktopImages;

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextImage, 6000); // সময় কিছুটা বাড়িয়ে ৬ সেকেন্ড করা হয়েছে
    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="relative group w-full h-[250px] md:h-[400px] lg:h-[480px] rounded-[2rem] overflow-hidden bg-slate-100 shadow-2xl">
        
        {/* Main Image Slider with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >           
            <img
              src={images[currentImage]}
              alt={`Premium Collection ${currentImage + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Content Inside Banner (Optional - Add your own taglines) */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              
            >
              
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons (Glassmorphism Style) */}
        <button
          onClick={prevImage}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-primary-600 shadow-2xl"
        >
          <FaAngleLeft className="text-xl" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-primary-600 shadow-2xl"
        >
          <FaAngleRight className="text-xl" />
        </button>

        {/* Modern Progress Indicators (Indicators) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30 bg-black/20 backdrop-blur-lg px-4 py-2 rounded-2xl border border-white/10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className="relative w-8 h-1 rounded-full overflow-hidden bg-white/20 transition-all"
            >
              {i === currentImage && (
                <motion.div 
                  layoutId="progress-bar"
                  className="absolute inset-0 bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerProduct;