import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IMAGES = [
  'https://cdn.andersundbesser.de/a-und-b/sus-25/sus-location-1.jpeg',
  'https://cdn.andersundbesser.de/a-und-b/sus-25/sus-location-2.jpeg',
  'https://cdn.andersundbesser.de/a-und-b/sus-25/sus-location-3.jpeg',
];

export const LocationSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance slides
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, isHovered]);

  return (
    <div
      className="relative w-full h-64 sm:h-80 rounded-3xl shadow-xl shadow-stone-200/50 border border-white overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images */}
      {IMAGES.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt={`Location Ansicht ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for better text visibility if needed, or just for style */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 pointer-events-none" />
        </div>
      ))}

      {/* Arrows (Visible on Hover) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          prevSlide();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          nextSlide();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${
              index === currentIndex ? 'bg-white scale-110 w-6' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Gehe zu Bild ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
