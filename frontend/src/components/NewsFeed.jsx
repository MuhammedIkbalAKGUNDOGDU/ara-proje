import React, { useState, useEffect, useRef } from "react";
import NewsCard from "./NewsCard";
import { newsData } from "../data/newsData";

function NewsFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Scroll animasyonu için CSS ekle
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .news-container {
        scroll-behavior: smooth;
        scroll-snap-type: y mandatory;
        overflow-y: auto;
        height: 100vh;
      }
      
      .news-item {
        scroll-snap-align: start;
        scroll-snap-stop: always;
      }
      
      .news-container::-webkit-scrollbar {
        display: none;
      }
      
      .news-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Klavye navigasyonu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isScrolling) return;

      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isScrolling]);

  // Mouse wheel navigasyonu
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return;

      e.preventDefault();
      if (e.deltaY > 0) {
        goToNext();
      } else if (e.deltaY < 0) {
        goToPrevious();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [currentIndex, isScrolling]);

  // Touch navigasyonu
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isScrolling) return;

    touchEndY.current = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < newsData.length - 1 && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0 && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  // Scroll pozisyonunu güncelle
  useEffect(() => {
    if (containerRef.current) {
      const scrollPosition = currentIndex * window.innerHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className="news-container relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {newsData.map((news, index) => (
        <div key={news.id} className="news-item">
          <NewsCard
            news={news}
            isActive={index === currentIndex}
            onNext={goToNext}
            onPrevious={goToPrevious}
          />
        </div>
      ))}

      {/* Progress indicator */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20">
        <div className="flex flex-col space-y-2">
          {newsData.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-8 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigasyon ipuçları */}
      <div className="fixed left-1/2 transform -translate-x-1/2 bottom-8 z-20">
        <div className="flex items-center space-x-4 text-white/70">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            <span className="text-sm">Yukarı</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Aşağı</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsFeed;
