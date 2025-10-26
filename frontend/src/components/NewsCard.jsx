import React, { useState } from "react";
import { Heart, ThumbsDown, Bookmark, Share2 } from "lucide-react";

function NewsCard({ news, isActive, onNext, onPrevious }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) {
      setIsDisliked(false);
    }
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) {
      setIsLiked(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link kopyalandı!");
    }
  };

  return (
    <div
      className={`relative w-full h-screen flex-shrink-0 transition-all duration-500 ease-in-out ${
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {/* Arka plan resmi */}
      <div className="absolute inset-0 z-0">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
        />
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
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4">
              {news.content}
            </p>
          </div>
        </div>

        {/* Alt etkileşim butonları */}
        <div className="absolute right-2 sm:right-4 bottom-16 sm:bottom-20 flex flex-col space-y-3 sm:space-y-4">
          <button
            onClick={handleLike}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            }`}
          >
            <Heart
              className="w-6 h-6"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
            />
          </button>
          <span className="text-white text-xs sm:text-sm text-center">
            {news.likes}
          </span>

          {/* Dislike Butonu */}
          <button
            onClick={handleDislike}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDisliked
                ? "bg-gray-500 text-white"
                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            }`}
          >
            <ThumbsDown
              className="w-6 h-6"
              fill={isDisliked ? "currentColor" : "none"}
              stroke="currentColor"
            />
          </button>
          <span className="text-white text-xs sm:text-sm text-center">
            {news.dislikes}
          </span>

          <button
            onClick={handleBookmark}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isBookmarked
                ? "bg-yellow-500 text-white"
                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            }`}
          >
            <Bookmark
              className="w-6 h-6"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
            />
          </button>

          <button
            onClick={handleShare}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
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
