import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import NewsCard from "./NewsCard";
import { useAuth } from "../contexts/AuthContext";
import { API_KEY, FEED_API_BASE_URL, INTERACTION_API_BASE_URL } from "../config/api";

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
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const lastWheelTimeRef = useRef(0);
  
  // Interaction tracking için refs
  const cardViewStartTimes = useRef({}); // Her kart için başlangıç zamanı
  const cardInteractionData = useRef({}); // Her kart için interaction verileri (like, dislike, share, click_detail)
  const previousIndexRef = useRef(0);

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
        width: 100%;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
      }
      
      @media (min-width: 768px) {
        .news-container {
          left: auto;
          right: auto;
        }
      }
      
      .news-item {
        scroll-snap-align: start;
        scroll-snap-stop: always;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100%;
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

  // Mouse wheel navigasyonu - scroll snap ile kontrollü geçiş
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return;

      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTimeRef.current;
      
      // Throttle: 300ms'den kısa sürede birden fazla wheel event'i engelle
      if (timeSinceLastWheel < 300) {
        e.preventDefault();
        return;
      }
      
      lastWheelTimeRef.current = now;
      
      // Scroll yönüne göre bir sonraki/önceki karta geç
      if (e.deltaY > 0) {
        // Aşağı scroll
        e.preventDefault();
        goToNext();
      } else if (e.deltaY < 0) {
        // Yukarı scroll
        e.preventDefault();
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

  // Track-read API isteği gönder
  const sendTrackReadAPI = useCallback(async (newsId) => {
    const token = localStorage.getItem("token");
    const userId = user?.id || localStorage.getItem("customerId");
    if (!token || !userId) return;

    const trackReadData = {
      user_id: userId.toString(),
      news_id: newsId,
    };

    try {
      console.log("Track-read API Request:", {
        url: `${FEED_API_BASE_URL}/track-read`,
        method: "POST",
        body: trackReadData,
      });

      const response = await fetch(`${FEED_API_BASE_URL}/track-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(trackReadData),
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      console.log("Track-read API Response:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
    } catch (error) {
      console.error("Track-read API error:", error);
    }
  }, [user]);

  // Interaction API isteği gönder
  const sendInteractionAPI = useCallback(async (newsId, category, firstSpendingTime, clickDetail, like = "no", dislike = "no", share = "no", secondSpendingTime = 0.0) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const interactionData = {
      news_id: newsId,
      category: category,
      like: like,
      dislike: dislike,
      first_spending_time: firstSpendingTime,
      click_detail: clickDetail,
      second_spending_time: secondSpendingTime,
      share: share,
    };

    try {
      console.log("Interaction API Request:", {
        url: `${INTERACTION_API_BASE_URL}/interaction`,
        method: "POST",
        body: interactionData,
      });

      const response = await fetch(`${INTERACTION_API_BASE_URL}/interaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(interactionData),
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      console.log("Interaction API Response:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
    } catch (error) {
      console.error("Interaction API error:", error);
    }
  }, []);

  // Kart görüntülenme süresini takip et ve kart değiştiğinde API isteği gönder
  useEffect(() => {
    // Önceki kart için süreyi hesapla ve API isteği gönder
    if (previousIndexRef.current !== currentIndex && newsData.length > 0) {
      const previousNews = newsData[previousIndexRef.current];
      if (previousNews) {
        const startTime = cardViewStartTimes.current[previousNews.id];
        if (startTime) {
          const spendingTime = (Date.now() - startTime) / 1000; // saniye cinsinden
          const interactionData = cardInteractionData.current[previousNews.id] || {};
          
          // Eğer detay sayfasına gidildiyse (click_detail: "yes"), NewsFeed'de API isteği gönderme
          // Çünkü NewsDetail'de gönderilecek
          if (interactionData.clickDetail !== "yes") {
            // Interaction API isteği gönder
            sendInteractionAPI(
              previousNews.id,
              previousNews.category || "general",
              spendingTime,
              interactionData.clickDetail || "no",
              interactionData.like || "no",
              interactionData.dislike || "no",
              interactionData.share || "no"
            );
            
            // Track-read API isteği gönder
            sendTrackReadAPI(previousNews.id);
          }

          // Önceki kartın verilerini temizle
          delete cardViewStartTimes.current[previousNews.id];
          delete cardInteractionData.current[previousNews.id];
        }
      }
    }

    // Yeni kart için zaman saymaya başla
    if (newsData.length > 0 && newsData[currentIndex]) {
      const currentNews = newsData[currentIndex];
      cardViewStartTimes.current[currentNews.id] = Date.now();
      
      // Interaction data'yı başlat
      if (!cardInteractionData.current[currentNews.id]) {
        cardInteractionData.current[currentNews.id] = {
          like: "no",
          dislike: "no",
          share: "no",
          clickDetail: "no",
        };
      }
    }

    previousIndexRef.current = currentIndex;
  }, [currentIndex, newsData, sendInteractionAPI, sendTrackReadAPI]);

  // Share callback - NewsCard'dan çağrılacak
  const handleShare = useCallback((newsId) => {
    if (cardInteractionData.current[newsId]) {
      cardInteractionData.current[newsId].share = "yes";
    }
  }, []);

  // Haber detay sayfasına gidildiğinde click_detail'i işaretle
  const handleCardClick = useCallback((newsId) => {
    if (cardInteractionData.current[newsId]) {
      cardInteractionData.current[newsId].clickDetail = "yes";
    }
  }, []);

  // Scroll pozisyonunu güncelle - klavye ve programatik navigasyon için
  useEffect(() => {
    if (containerRef.current && newsData.length > 0) {
      const items = containerRef.current.querySelectorAll('.news-item');
      if (items[currentIndex]) {
        setIsScrolling(true);
        items[currentIndex].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setTimeout(() => setIsScrolling(false), 500);
      }
    }
  }, [currentIndex, newsData.length]);

  // Scroll event listener - scroll snap sonrası currentIndex'i güncelle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      if (isScrolling) return; // Programatik scroll sırasında çalışmasın

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const items = container.querySelectorAll('.news-item');
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        // Scroll snap ile hangi item görünür alanda
        let newIndex = 0;
        const threshold = containerHeight * 0.5; // Viewport'un ortası
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemTop = item.offsetTop;
          const itemBottom = itemTop + item.offsetHeight;
          
          // Item viewport'un ortasında mı?
          if (scrollTop + threshold >= itemTop && scrollTop + threshold < itemBottom) {
            newIndex = i;
            break;
          }
        }

        if (
          newIndex !== currentIndex &&
          newIndex >= 0 &&
          newIndex < newsData.length
        ) {
          setCurrentIndex(newIndex);
        }
      }, 100); // 100ms debounce
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, isScrolling, newsData.length]);

  // Sayfa yüklendiğinde veya route değiştiğinde scroll'u en üste al ve state'leri sıfırla
  useEffect(() => {
    // Scroll'u en üste al
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    // State'leri sıfırla
    setCurrentIndex(0);
    setNewsData([]);
    setLoading(true);
  }, [location.pathname]); // Route değiştiğinde de çalışsın

  // Sayfa yüklendiğinde Feed API çağrısı yap
  useEffect(() => {
    const fetchFeed = async () => {
      if (!user || !user.id) {
        console.warn("User ID bulunamadı");
        setLoading(false);
        return;
      }

      // Scroll'u en üste al
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
      setCurrentIndex(0);

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
              "X-API-KEY": API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
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
        // Veriler yüklendikten sonra scroll'u en üste al
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
          setCurrentIndex(0);
        }, 100);
      }
    };

    fetchFeed();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Haberler yükleniyor...</div>
      </div>
    );
  }

  if (newsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Henüz haber bulunmuyor.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        ref={containerRef}
        className="news-container relative mx-auto w-full md:w-1/3"
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
              onShare={() => handleShare(news.id)}
              onCardClick={() => handleCardClick(news.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewsFeed;
