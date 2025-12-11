import React, { useState, useEffect, useRef, useCallback } from "react";
import NewsCard from "./NewsCard";
import { useAuth } from "../contexts/AuthContext";
import { API_KEY, FEED_API_BASE_URL } from "../config/api";

// Görsel URL'sini doğrula
const validateImageUrl = (url) => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return null;
  }
  try {
    const parsedUrl = new URL(url);
    // HTTP veya HTTPS protokolü olmalı
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    // Geçersiz URL formatı
    return null;
  }
};

function NewsFeed() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Navigasyon fonksiyonları - önce tanımlanmalı
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < newsData.length - 1) {
        setIsScrolling(true);
        setTimeout(() => setIsScrolling(false), 500);
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [newsData.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        setIsScrolling(true);
        setTimeout(() => setIsScrolling(false), 500);
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  // Scroll animasyonu için CSS ekle
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .news-container {
        scroll-behavior: smooth;
        scroll-snap-type: y mandatory;
        overflow-y: auto;
        height: 100vh;
        width: 100%;
      }
      
      .news-item {
        scroll-snap-align: start;
        scroll-snap-stop: always;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
      }
      
      .news-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .news-container::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      .news-container::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      
      .news-container::-webkit-scrollbar-thumb:hover {
        background: #555;
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
  }, [isScrolling, goToNext, goToPrevious]);

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
  }, [isScrolling, goToNext, goToPrevious]);

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

  // Scroll pozisyonunu güncelle
  useEffect(() => {
    if (containerRef.current && newsData.length > 0) {
      const itemHeight = containerRef.current.scrollHeight / newsData.length;
      const scrollPosition = currentIndex * itemHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex, newsData.length]);

  // Scroll event listener - kullanıcı manuel scroll yaparsa currentIndex'i güncelle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling) return; // Programatik scroll sırasında çalışmasın

      const scrollTop = container.scrollTop;
      const itemHeight = container.scrollHeight / newsData.length;
      const newIndex = Math.round(scrollTop / itemHeight);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < newsData.length
      ) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, isScrolling, newsData.length]);

  // Sayfa yüklendiğinde Feed API çağrısı yap
  useEffect(() => {
    const fetchFeed = async () => {
      if (!user || !user.id) {
        console.warn("User ID bulunamadı");
        setLoading(false);
        return;
      }

      const userId = user.id;
      const token = localStorage.getItem("token");

      try {
        console.log("Feed API Request:", {
          url: `${FEED_API_BASE_URL}/feed/${userId}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        const response = await fetch(
          `${FEED_API_BASE_URL}/feed/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { message: responseText };
        }

        // Konsola çıktıyı yazdır
        console.log("Feed API Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          rawResponse: responseText,
          parsedData: responseData,
        });

        // API'den gelen verileri işle
        if (response.ok && Array.isArray(responseData)) {
          // API verilerini NewsCard formatına dönüştür
          const formattedNews = responseData.map((item) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            title: item.title || "Başlık Yok",
            content: item.content || item.description || "İçerik bulunamadı.",
            summary: item.summary || item.description || "",
            image: validateImageUrl(item.image_url), // Geçersiz URL'ler null olacak, NewsCard default görsel kullanacak
            category: item.category || "Genel",
            author: "Haber Kaynağı",
            publishDate: new Date().toLocaleDateString("tr-TR"),
            readTime: "3 dk",
            url: item.url || "#",
          }));
          setNewsData(formattedNews);
        } else if (
          response.ok &&
          responseData.data &&
          Array.isArray(responseData.data)
        ) {
          // Eğer veri data içinde ise
          const formattedNews = responseData.data.map((item) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            title: item.title || "Başlık Yok",
            content: item.content || item.description || "İçerik bulunamadı.",
            summary: item.summary || item.description || "",
            image: validateImageUrl(item.image_url), // Geçersiz URL'ler null olacak, NewsCard default görsel kullanacak
            category: item.category || "Genel",
            author: "Haber Kaynağı",
            publishDate: new Date().toLocaleDateString("tr-TR"),
            readTime: "3 dk",
            url: item.url || "#",
          }));
          setNewsData(formattedNews);
        }
      } catch (error) {
        console.error("Feed API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Haberler yükleniyor...</div>
      </div>
    );
  }

  if (newsData.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Henüz haber bulunmuyor.</div>
      </div>
    );
  }

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
