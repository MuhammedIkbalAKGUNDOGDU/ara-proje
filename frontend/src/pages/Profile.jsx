import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_KEY, API_BASE_URL, ONBOARDING_API_BASE_URL } from "../config/api";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

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
        // firstLogin'ı true yap ki kullanıcı tekrar ilgi alanı seçimine yönlendirilsin
        try {
          await fetch(`${API_BASE_URL}/users/updateFirstLogin`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": API_KEY,
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Update firstLogin error:", error);
        }

        // Account data'yı güncelle
        const accountData = JSON.parse(
          localStorage.getItem("accountData") || "{}"
        );
        accountData.firstLogin = true;
        localStorage.setItem("accountData", JSON.stringify(accountData));

        alert("Keşfet algoritması başarıyla sıfırlandı! İlgi alanlarınızı tekrar seçmeniz gerekecek.");
        
        // İlgi alanları seçim sayfasına yönlendir
        navigate("/interests");
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
          {/* Profil Bilgileri */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-2xl font-bold">MU</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {user?.name || "Kullanıcı"}
              </h2>
              <p className="text-gray-600">{user?.username || "@kullanici"}</p>
              <p className="text-gray-500 text-sm mt-1">
                Haber okumayı seven, teknoloji meraklısı
              </p>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">156</div>
              <div className="text-gray-500 text-sm">Okunan Haber</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-600">23</div>
              <div className="text-gray-500 text-sm">Beğenilen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">8</div>
              <div className="text-gray-500 text-sm">Kaydedilen</div>
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Son Aktiviteler
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    "Teknoloji Dünyasında Büyük Gelişme" haberini okudu
                  </p>
                  <p className="text-xs text-gray-500">2 saat önce</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    "Sağlık Alanında Çığır Açan Buluş" haberini beğendi
                  </p>
                  <p className="text-xs text-gray-500">5 saat önce</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    "Ekonomide Yeni Trendler" haberini kaydetti
                  </p>
                  <p className="text-xs text-gray-500">1 gün önce</p>
                </div>
              </div>
            </div>
          </div>

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
