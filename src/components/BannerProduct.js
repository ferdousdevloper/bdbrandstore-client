import React, { useState, useEffect, useCallback } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
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
import { motion, AnimatePresence } from "framer-motion";

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
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-4">
      <div className="relative w-full h-56 md:h-72 lg:h-80 rounded-2xl overflow-hidden bg-surface-200 shadow-soft">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <img
              src={images[currentImage]}
              alt={`Banner ${currentImage + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          aria-label="Previous"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:bg-white hover:scale-110 transition-all"
          onClick={prevImage}
        >
          <FaAngleLeft className="text-lg" />
        </button>
        <button
          type="button"
          aria-label="Next"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:bg-white hover:scale-110 transition-all"
          onClick={nextImage}
        >
          <FaAngleRight className="text-lg" />
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentImage ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
              }`}
              onClick={() => setCurrentImage(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerProduct;
