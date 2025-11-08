import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function InterestsSelection() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);

  // İlgi alanları listesi - her biri için isim ve simge
  const interests = [
    { id: 1, name: "Teknoloji", icon: "💻" },
    { id: 2, name: "Spor", icon: "⚽" },
    { id: 3, name: "Sanat", icon: "🎨" },
    { id: 4, name: "Müzik", icon: "🎵" },
    { id: 5, name: "Bilim", icon: "🔬" },
    { id: 6, name: "Seyahat", icon: "✈️" },
    { id: 7, name: "Yemek", icon: "🍔" },
    { id: 8, name: "Film", icon: "🎬" },
    { id: 9, name: "Kitap", icon: "📚" },
    { id: 10, name: "Moda", icon: "👗" },
    { id: 11, name: "Oyun", icon: "🎮" },
    { id: 12, name: "Doğa", icon: "🌲" },
    { id: 13, name: "Fotoğraf", icon: "📷" },
    { id: 14, name: "Eğitim", icon: "📖" },
    { id: 15, name: "Sağlık", icon: "🏥" },
    { id: 16, name: "Ekonomi", icon: "💰" },
  ];

  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((id) => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleSubmit = () => {
    if (selectedInterests.length === 0) {
      alert("Lütfen en az bir ilgi alanı seçiniz!");
      return;
    }

    // Seçilen ilgi alanlarını kaydet (localStorage'a veya API'ye gönderilebilir)
    const selectedInterestsData = interests.filter((interest) =>
      selectedInterests.includes(interest.id)
    );
    
    // Kullanıcı verisine ilgi alanlarını ekle ve coldStart'ı false yap
    const updatedUserData = {
      interests: selectedInterestsData,
      coldStart: false,
    };

    // AuthContext'i güncelle
    updateUser(updatedUserData);

    // Ana sayfaya yönlendir
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Başlık */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            İlgi Alanlarınızı Seçin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Size daha iyi içerik sunabilmemiz için ilgi alanlarınızı seçin
          </p>
        </div>

        {/* İlgi Alanları Grid */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {interests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all duration-200
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md scale-105"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-4xl">{interest.icon}</span>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {interest.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Seçim Sayısı */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">
                {selectedInterests.length}
              </span>{" "}
              ilgi alanı seçildi
            </p>
          </div>

          {/* Devam Et Butonu */}
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={selectedInterests.length === 0}
              className={`
                w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors
                ${
                  selectedInterests.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }
              `}
            >
              Devam Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterestsSelection;

