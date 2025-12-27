import React, { useState, useEffect } from "react";
import { API_KEY, API_BASE_URL, ONBOARDING_API_BASE_URL, FEED_API_BASE_URL } from "../config/api";

function Profile() {
  const [isResetting, setIsResetting] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [chartType, setChartType] = useState("bar"); // "bar" veya "pie"

  useEffect(() => {
    // Account bilgilerini yükle
    const loadAccountData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Önce localStorage'dan kontrol et
        const cachedAccountData = localStorage.getItem("accountData");
        if (cachedAccountData) {
          try {
            const parsed = JSON.parse(cachedAccountData);
            setAccountData(parsed);
            setLoading(false);
          } catch (e) {
            console.error("Error parsing cached account data:", e);
          }
        }

        // API'den güncel bilgileri al
        const response = await fetch(`${API_BASE_URL}/users/account`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }

        if (response.ok && data.statusCode === 200 && data.data) {
          setAccountData(data.data);
          localStorage.setItem("accountData", JSON.stringify(data.data));
          
          // ID'yi localStorage'a kaydet
          if (data.data.id) {
            localStorage.setItem("userId", data.data.id.toString());
          }
        }
      } catch (error) {
        console.error("Error loading account data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, []);

  // Recommendations API çağrısı
  useEffect(() => {
    const fetchRecommendations = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        setRecommendationsLoading(false);
        return;
      }

      try {
        console.log("Recommendations API Request:", {
          url: `${ONBOARDING_API_BASE_URL}/recommendations/${userId}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        const response = await fetch(
          `${ONBOARDING_API_BASE_URL}/recommendations/${userId}`,
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
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }

        console.log("Recommendations API Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          rawResponse: responseText,
          parsedData: data,
        });

        // Kategorileri normalize et (toplam %100 olacak şekilde)
        let normalizedCategories = [];
        if (data.categories && Array.isArray(data.categories)) {
          const totalScore = data.categories.reduce((sum, cat) => sum + (cat.score || 0), 0);
          normalizedCategories = data.categories.map(cat => ({
            ...cat,
            percentage: totalScore > 0 ? ((cat.score || 0) / totalScore) * 100 : 0
          }));
        }

        setRecommendations({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          rawResponse: responseText,
          parsedData: data,
          normalizedCategories,
        });
      } catch (error) {
        console.error("Recommendations API error:", error);
        setRecommendations({
          error: error.message || "Bir hata oluştu",
        });
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleResetAlgorithm = async () => {
    if (!window.confirm("Keşfet algoritmasını sıfırlamak istediğinizden emin misiniz? Bu işlem ilgi alanlarınızı ve öğrenme verilerinizi sıfırlayacaktır.")) {
      return;
    }

    setIsResetting(true);
    const token = localStorage.getItem("token");

    try {
      // Reset scores API çağrısı
      console.log("Reset Scores API Request:", {
        url: `${ONBOARDING_API_BASE_URL}/reset-scores`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      const resetScoresResponse = await fetch(
        `${ONBOARDING_API_BASE_URL}/reset-scores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resetScoresResponseText = await resetScoresResponse.text();
      let resetScoresData;
      try {
        resetScoresData = JSON.parse(resetScoresResponseText);
      } catch {
        resetScoresData = { message: resetScoresResponseText };
      }

      console.log("Reset Scores API Response:", {
        status: resetScoresResponse.status,
        statusText: resetScoresResponse.statusText,
        headers: Object.fromEntries(resetScoresResponse.headers.entries()),
        rawResponse: resetScoresResponseText,
        parsedData: resetScoresData,
      });

      // İlgi alanlarını sıfırla (onboarding API'sine boş array gönder)
      const resetResponse = await fetch(
        `${ONBOARDING_API_BASE_URL}/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            categories: [],
          }),
        }
      );

      const resetResponseText = await resetResponse.text();
      let resetData;
      try {
        resetData = JSON.parse(resetResponseText);
      } catch {
        resetData = { message: resetResponseText };
      }

      if (resetScoresResponse.ok && resetResponse.ok) {
        alert("Keşfet algoritması başarıyla sıfırlandı!");
      } else {
        const errorMessage = resetScoresData.message || resetData.message || "Algoritma sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Reset algorithm error:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsResetting(false);
    }
  };
  
  // Kullanıcı bilgilerini API'den gelen data'dan al
  const userInfo = accountData || {};
  const name = userInfo.name || "";
  const surname = userInfo.surname || "";
  const email = userInfo.email || "";
  const phoneNumber = userInfo.phoneNumber || "";
  const fullName = name && surname ? `${name} ${surname}` : name || surname || "Kullanıcı";

  // İsim baş harflerini al (avatar için)
  const getInitials = () => {
    if (name && surname) {
      return `${name[0]}${surname[0]}`.toUpperCase();
    }
    if (name) {
      return name[0].toUpperCase();
    }
    if (surname) {
      return surname[0].toUpperCase();
    }
    return "K";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
          {/* Profil Başlığı */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-3xl font-bold">{getInitials()}</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              {fullName}
              </h2>
          </div>

          {/* Kullanıcı Bilgileri */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Kullanıcı Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İsim */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-gray-600 mb-1">Ad</p>
                <p className="text-lg font-semibold text-gray-800">
                  {name || "Belirtilmemiş"}
              </p>
            </div>

              {/* Soyisim */}
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-sm text-gray-600 mb-1">Soyad</p>
                <p className="text-lg font-semibold text-gray-800">
                  {surname || "Belirtilmemiş"}
                </p>
          </div>

              {/* E-posta */}
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                <p className="text-sm text-gray-600 mb-1">E-posta Adresi</p>
                <p className="text-lg font-semibold text-gray-800 break-all">
                  {email || "Belirtilmemiş"}
                </p>
            </div>

              {/* Telefon */}
              <div className="p-4 bg-red-100 rounded-xl border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Telefon Numarası</p>
                <p className="text-lg font-semibold text-gray-800">
                  {phoneNumber || "Belirtilmemiş"}
                </p>
            </div>
            </div>
          </div>

          {/* Recommendations API Response */}
          {recommendations && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Recommendations API Response
            </h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Endpoint: {ONBOARDING_API_BASE_URL}/recommendations/{localStorage.getItem("userId")}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Status: <span className="font-semibold">{recommendations.status} {recommendations.statusText}</span>
                  </p>
                </div>
                {recommendations.error ? (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-red-700">{recommendations.error}</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-lg p-4 border border-gray-300 overflow-auto mb-4">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                        {JSON.stringify(recommendations.parsedData, null, 2)}
                      </pre>
                    </div>
                    <details className="mt-4">
                      <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-red-600">
                        Raw Response (Ham Veri)
                      </summary>
                      <div className="mt-2 bg-white rounded-lg p-4 border border-gray-300 overflow-auto">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                          {recommendations.rawResponse}
                        </pre>
                      </div>
                    </details>
                    <details className="mt-4">
                      <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-red-600">
                        Response Headers
                      </summary>
                      <div className="mt-2 bg-white rounded-lg p-4 border border-gray-300 overflow-auto">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                          {JSON.stringify(recommendations.headers, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </>
                )}
              </div>
            </div>
          )}

          {recommendationsLoading && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Recommendations yükleniyor...</p>
            </div>
          )}

          {/* İlgi Alanlarım - Görselleştirme */}
          {recommendations && recommendations.normalizedCategories && recommendations.normalizedCategories.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">İlgi Alanlarım</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartType("bar")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      chartType === "bar"
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Sütun Grafik
                  </button>
                  <button
                    onClick={() => setChartType("pie")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      chartType === "pie"
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Dairesel Grafik
                  </button>
                </div>
              </div>

              {chartType === "bar" ? (
                // Sütun Grafik
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    {recommendations.normalizedCategories.map((category, index) => {
                      const colors = [
                        "bg-red-500", "bg-rose-500", "bg-pink-500", "bg-purple-500",
                        "bg-indigo-500", "bg-blue-500", "bg-cyan-500", "bg-teal-500",
                        "bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-amber-500",
                        "bg-orange-500", "bg-red-600", "bg-rose-600", "bg-pink-600"
                      ];
                      const color = colors[index % colors.length];
                      
                      // Kategori ismini Türkçe'ye çevir
                      const categoryNames = {
                        economy: "Ekonomi",
                        science: "Bilim",
                        travel: "Seyahat",
                        movie: "Film",
                        book: "Kitap",
                        nature: "Doğa",
                        technology: "Teknoloji",
                        sports: "Spor",
                        music: "Müzik",
                        food: "Yemek",
                        game: "Oyun",
                        education: "Eğitim",
                        art: "Sanat",
                        fashion: "Moda",
                        photography: "Fotoğraf",
                        health: "Sağlık"
                      };
                      
                      const categoryName = categoryNames[category.category] || category.category;
                      
                      return (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-32 text-sm font-medium text-gray-700">
                            {categoryName}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                            <div
                              className={`h-full ${color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                              style={{ width: `${category.percentage}%` }}
                            >
                              {category.percentage > 5 && (
                                <span className="text-xs font-semibold text-white">
                                  {category.percentage.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          {category.percentage <= 5 && (
                            <div className="w-16 text-sm font-medium text-gray-600 text-right">
                              {category.percentage.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Dairesel Grafik (Pie Chart)
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    {/* Pie Chart SVG */}
                    <div className="flex-shrink-0">
                      <svg width="300" height="300" viewBox="0 0 300 300" className="transform -rotate-90">
                        {(() => {
                          let currentAngle = 0;
                          const colors = [
                            "#ef4444", "#f43f5e", "#ec4899", "#a855f7",
                            "#6366f1", "#3b82f6", "#06b6d4", "#14b8a6",
                            "#10b981", "#84cc16", "#eab308", "#f59e0b",
                            "#f97316", "#dc2626", "#e11d48", "#db2777"
                          ];
                          
                          return recommendations.normalizedCategories.map((category, index) => {
                            const percentage = category.percentage;
                            const angle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            currentAngle = endAngle;
                            
                            const startAngleRad = (startAngle * Math.PI) / 180;
                            const endAngleRad = (endAngle * Math.PI) / 180;
                            
                            const x1 = 150 + 120 * Math.cos(startAngleRad);
                            const y1 = 150 + 120 * Math.sin(startAngleRad);
                            const x2 = 150 + 120 * Math.cos(endAngleRad);
                            const y2 = 150 + 120 * Math.sin(endAngleRad);
                            
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            const pathData = [
                              `M 150 150`,
                              `L ${x1} ${y1}`,
                              `A 120 120 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `Z`
                            ].join(" ");
                            
                            return (
                              <path
                                key={index}
                                d={pathData}
                                fill={colors[index % colors.length]}
                                stroke="white"
                                strokeWidth="2"
                                className="transition-all hover:opacity-80"
                              />
                            );
                          });
                        })()}
                      </svg>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.normalizedCategories.map((category, index) => {
                        const colors = [
                          "#ef4444", "#f43f5e", "#ec4899", "#a855f7",
                          "#6366f1", "#3b82f6", "#06b6d4", "#14b8a6",
                          "#10b981", "#84cc16", "#eab308", "#f59e0b",
                          "#f97316", "#dc2626", "#e11d48", "#db2777"
                        ];
                        const color = colors[index % colors.length];
                        
                        const categoryNames = {
                          economy: "Ekonomi",
                          science: "Bilim",
                          travel: "Seyahat",
                          movie: "Film",
                          book: "Kitap",
                          nature: "Doğa",
                          technology: "Teknoloji",
                          sports: "Spor",
                          music: "Müzik",
                          food: "Yemek",
                          game: "Oyun",
                          education: "Eğitim",
                          art: "Sanat",
                          fashion: "Moda",
                          photography: "Fotoğraf",
                          health: "Sağlık"
                        };
                        
                        const categoryName = categoryNames[category.category] || category.category;
                        
                        return (
                          <div key={index} className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            ></div>
                            <span className="text-sm text-gray-700">{categoryName}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {category.percentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keşfet Algoritmasını Sıfırla */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Keşfet Algoritması
            </h3>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 mb-1">
                    Algoritmayı Sıfırla
                  </p>
                  <p className="text-sm text-gray-600">
                    İlgi alanlarınızı ve öğrenme verilerinizi sıfırlayarak 
                    keşfet algoritmasını yeniden başlatın. Bu işlem geri alınamaz.
                  </p>
                </div>
                <button
                  onClick={handleResetAlgorithm}
                  disabled={isResetting}
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {isResetting ? "Sıfırlanıyor..." : "Sıfırla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
