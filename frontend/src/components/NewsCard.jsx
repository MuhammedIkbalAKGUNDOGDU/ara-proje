import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Share2,
  X,
  Palette,
  Laptop,
  Trophy,
  Music,
  Microscope,
  Plane,
  UtensilsCrossed,
  Film,
  BookOpen,
  Shirt,
  Gamepad2,
  Trees,
  Camera,
  GraduationCap,
  HeartPulse,
  DollarSign,
  Newspaper,
} from "lucide-react";

// Kategorilere göre icon mapping
const getCategoryIcon = (category) => {
  const categoryLower = (category || "").toLowerCase();
  const iconProps = { className: "w-32 h-32 text-white" };

  switch (categoryLower) {
    case "art":
    case "sanat":
      return <Palette {...iconProps} />;
    case "technology":
    case "teknoloji":
      return <Laptop {...iconProps} />;
    case "sports":
    case "spor":
      return <Trophy {...iconProps} />;
    case "music":
    case "müzik":
      return <Music {...iconProps} />;
    case "science":
    case "bilim":
      return <Microscope {...iconProps} />;
    case "travel":
    case "seyahat":
      return <Plane {...iconProps} />;
    case "food":
    case "yemek":
      return <UtensilsCrossed {...iconProps} />;
    case "movies":
    case "film":
      return <Film {...iconProps} />;
    case "books":
    case "kitap":
      return <BookOpen {...iconProps} />;
    case "fashion":
    case "moda":
      return <Shirt {...iconProps} />;
    case "gaming":
    case "oyun":
      return <Gamepad2 {...iconProps} />;
    case "nature":
    case "doğa":
      return <Trees {...iconProps} />;
    case "photography":
    case "fotoğraf":
      return <Camera {...iconProps} />;
    case "education":
    case "eğitim":
      return <GraduationCap {...iconProps} />;
    case "health":
    case "sağlık":
      return <HeartPulse {...iconProps} />;
    case "economy":
    case "ekonomi":
      return <DollarSign {...iconProps} />;
    default:
      return <Newspaper {...iconProps} />;
  }
};

// Kategorilere göre gradient renkler
const getCategoryGradient = (category) => {
  const categoryLower = (category || "").toLowerCase();

  switch (categoryLower) {
    case "art":
    case "sanat":
      return "from-purple-600 via-pink-600 to-red-600";
    case "technology":
    case "teknoloji":
      return "from-blue-600 via-cyan-600 to-blue-500";
    case "sports":
    case "spor":
      return "from-orange-600 via-red-600 to-orange-500";
    case "music":
    case "müzik":
      return "from-pink-600 via-purple-600 to-indigo-600";
    case "science":
    case "bilim":
      return "from-indigo-600 via-blue-600 to-cyan-600";
    case "travel":
    case "seyahat":
      return "from-sky-600 via-blue-500 to-cyan-500";
    case "food":
    case "yemek":
      return "from-orange-500 via-red-500 to-pink-500";
    case "movies":
    case "film":
      return "from-gray-800 via-gray-700 to-gray-600";
    case "books":
    case "kitap":
      return "from-amber-600 via-orange-600 to-red-600";
    case "fashion":
    case "moda":
      return "from-pink-500 via-rose-500 to-red-500";
    case "gaming":
    case "oyun":
      return "from-green-600 via-emerald-600 to-teal-600";
    case "nature":
    case "doğa":
      return "from-green-600 via-emerald-600 to-green-500";
    case "photography":
    case "fotoğraf":
      return "from-gray-700 via-gray-600 to-gray-500";
    case "education":
    case "eğitim":
      return "from-blue-600 via-indigo-600 to-purple-600";
    case "health":
    case "sağlık":
      return "from-red-600 via-pink-600 to-rose-600";
    case "economy":
    case "ekonomi":
      return "from-green-600 via-emerald-600 to-teal-600";
    default:
      return "from-gray-600 via-gray-500 to-gray-400";
  }
};

function NewsCard({ news, isActive, onNext, onPrevious }) {
  const navigate = useNavigate();
  const [isNotInterested, setIsNotInterested] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardViewStartTime = useRef(null);
  const cardViewDuration = useRef(0);
  const [imageSrc, setImageSrc] = useState(() => {
    // İlk yüklemede geçerli bir URL kontrolü yap
    const url = news.image;
    if (!url || url.trim() === "") {
      return DEFAULT_NEWS_IMAGE;
    }
    // Geçersiz URL formatlarını kontrol et
    try {
      new URL(url);
      return url;
    } catch {
      return DEFAULT_NEWS_IMAGE;
    }
  });

  // Kart görünür olduğunda zaman saymaya başla
  useEffect(() => {
    if (isActive) {
      cardViewStartTime.current = Date.now();
      cardViewDuration.current = 0;
    } else if (cardViewStartTime.current !== null) {
      // Kart görünmez olduğunda süreyi hesapla
      cardViewDuration.current = Date.now() - cardViewStartTime.current;
      cardViewStartTime.current = null;
    }
  }, [isActive]);

  const handleCardClick = (e) => {
    // Butonlara tıklanırsa navigate etme
    if (e.target.closest("button")) {
      return;
    }

    // Kart görünürken geçen süreyi hesapla
    if (cardViewStartTime.current !== null) {
      cardViewDuration.current = Date.now() - cardViewStartTime.current;
    }

    // Süreyi state ile detay sayfasına gönder
    navigate(`/news/${news.id}`, {
      state: {
        cardViewDuration: cardViewDuration.current,
      },
    });
  };

  const handleNotInterested = (e) => {
    e.stopPropagation();
    setIsNotInterested(true);
    // İlgilenmiyorum işlemi - haber atlanabilir veya API'ye bildirilebilir
    // Şimdilik sadece state güncelleniyor
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/news/${news.id}`;
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary || news.content,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link kopyalandı!");
    }
  };

  const handleImageError = (e) => {
    // Görsel yüklenemezse default görseli kullan
    if (!imageError) {
      setImageError(true);
      setImageSrc(DEFAULT_NEWS_IMAGE);
      // Sonsuz döngüyü önlemek için onError'u kaldır
      e.target.onerror = null;
    }
  };

  const handleImageLoad = () => {
    // Görsel başarıyla yüklendiğinde hata durumunu sıfırla
    setImageError(false);
  };

  // news.image değiştiğinde görseli güncelle
  useEffect(() => {
    const url = news.image;
    if (!url || url.trim() === "") {
      setImageSrc(DEFAULT_NEWS_IMAGE);
      setImageError(false);
      return;
    }
    // Geçerli URL kontrolü
    try {
      new URL(url);
      setImageSrc(url);
      setImageError(false);
    } catch {
      setImageSrc(DEFAULT_NEWS_IMAGE);
      setImageError(false);
    }
  }, [news.image]);

  return (
    <div
      className={`relative w-full h-screen flex-shrink-0 transition-all duration-500 ease-in-out cursor-pointer ${
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      onClick={handleCardClick}
    >
      {/* Arka plan - Kategori iconu ve gradient */}
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-br ${getCategoryGradient(
          news.category
        )}`}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {getCategoryIcon(news.category)}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* İçerik */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Üst bilgiler */}
        <div className="flex justify-between items-start p-6 pt-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {news.author.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{news.author}</p>
              <p className="text-white/70 text-xs">{news.publishDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {news.category}
            </span>
            <span className="text-white/70 text-xs">{news.readTime}</span>
          </div>
        </div>

        {/* Ana içerik */}
        <div className="flex-1 flex items-end p-4 sm:p-6 pb-16 sm:pb-20">
          <div className="w-full">
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 leading-tight">
              {news.title}
            </h2>
            {news.summary && (
              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4">
                {news.summary}
              </p>
            )}
          </div>
        </div>

        {/* Alt etkileşim butonları */}
        <div className="absolute right-2 sm:right-4 bottom-16 sm:bottom-20 flex flex-col space-y-3 sm:space-y-4">
          {/* İlgilenmiyorum Butonu */}
          <button
            onClick={handleNotInterested}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isNotInterested
                ? "bg-gray-500 text-white"
                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            }`}
            title="İlgilenmiyorum"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Paylaş Butonu */}
          <button
            onClick={handleShare}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
            title="Paylaş"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Navigasyon ipuçları */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4 flex space-x-2">
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
