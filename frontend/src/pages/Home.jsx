import React from "react";

function Home() {
  // Mock kullanıcı verileri
  const userStats = {
    totalTimeSpent: "24 saat 35 dakika",
    articlesRead: 156,
    favoriteCategories: [
      { name: "Teknoloji", percentage: 35, color: "bg-blue-500" },
      { name: "Sağlık", percentage: 25, color: "bg-green-500" },
      { name: "Ekonomi", percentage: 20, color: "bg-yellow-500" },
      { name: "Spor", percentage: 15, color: "bg-red-500" },
      { name: "Eğitim", percentage: 5, color: "bg-purple-500" },
    ],
    weeklyActivity: [
      { day: "Pzt", articles: 8 },
      { day: "Sal", articles: 12 },
      { day: "Çar", articles: 15 },
      { day: "Per", articles: 10 },
      { day: "Cum", articles: 18 },
      { day: "Cmt", articles: 22 },
      { day: "Paz", articles: 14 },
    ],
    readingStreak: 7,
    averageReadingTime: "4.2 dk",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Hoş Geldiniz
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            En güncel haberleri keşfedin, profil bilgilerinizi görüntüleyin ve
            platformumuzun sunduğu tüm özelliklerden yararlanın.
          </p>
        </div>

        {/* Kullanıcı İstatistikleri */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-red-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Kişisel İstatistikleriniz
          </h2>

          {/* Ana İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {userStats.totalTimeSpent}
              </div>
              <div className="text-gray-600">Toplam Süre</div>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-lg border border-rose-100">
              <div className="text-3xl font-bold text-rose-600 mb-2">
                {userStats.articlesRead}
              </div>
              <div className="text-gray-600">Okunan Haber</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {userStats.readingStreak}
              </div>
              <div className="text-gray-600">Günlük Seri</div>
            </div>
            <div className="text-center p-4 bg-red-100 rounded-lg border border-red-200">
              <div className="text-3xl font-bold text-red-700 mb-2">
                {userStats.averageReadingTime}
              </div>
              <div className="text-gray-600">Ortalama Süre</div>
            </div>
          </div>

          {/* Haftalık Aktivite Grafiği */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Bu Haftaki Aktivite
            </h3>
            <div className="flex items-end justify-between h-32 bg-gray-50 rounded-lg p-4">
              {userStats.weeklyActivity.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-gradient-to-t from-red-600 to-rose-500 rounded-t-lg w-8 mb-2 transition-all duration-500 hover:from-red-700 hover:to-rose-600 shadow-sm"
                    style={{ height: `${(day.articles / 25) * 100}px` }}
                  ></div>
                  <span className="text-xs text-gray-600">{day.day}</span>
                  <span className="text-xs font-medium text-gray-800">
                    {day.articles}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sevilen Kategoriler */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              İlgi Alanlarınız
            </h3>
            <div className="space-y-3">
              {userStats.favoriteCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${category.color}`}
                    ></div>
                    <span className="font-medium text-gray-800">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-8">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Özellik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-red-100">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center mb-6 shadow-md">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Haber Akışı
            </h3>
            <p className="text-gray-600 mb-4">
              Instagram Reels tarzında smooth geçişlerle haberleri keşfedin.
            </p>
            <a
              href="/news"
              className="text-red-600 font-semibold hover:text-red-700 transition-colors"
            >
              Haberleri Görüntüle →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-red-100">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-600 rounded-lg flex items-center justify-center mb-6 shadow-md">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Profil</h3>
            <p className="text-gray-600 mb-4">
              Kişisel bilgilerinizi görüntüleyin ve aktivitelerinizi takip edin.
            </p>
            <a
              href="/profile"
              className="text-red-600 font-semibold hover:text-red-700 transition-colors"
            >
              Profili Görüntüle →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-red-100">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-red-500 rounded-lg flex items-center justify-center mb-6 shadow-md">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Hakkımızda
            </h3>
            <p className="text-gray-600 mb-4">
              Platformumuz hakkında detaylı bilgileri öğrenin.
            </p>
            <a
              href="/about"
              className="text-red-600 font-semibold hover:text-red-700 transition-colors"
            >
              Daha Fazla Bilgi →
            </a>
          </div>
        </div>

        {/* Platform İstatistikleri */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Platform İstatistikleri
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                1,250+
              </div>
              <div className="text-gray-600">Toplam Haber</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600 mb-2">
                5,680+
              </div>
              <div className="text-gray-600">Aktif Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                12,450+
              </div>
              <div className="text-gray-600">Günlük Okuma</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700 mb-2">98%</div>
              <div className="text-gray-600">Memnuniyet Oranı</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
