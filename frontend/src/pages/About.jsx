import React from "react";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 mb-6">
              <svg
                className="h-10 w-10 text-white"
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hakkımızda</h1>
            <p className="text-lg text-gray-600">
              Modern haber deneyimi sunan platformumuz hakkında bilgiler
            </p>
          </div>
          <div className="space-y-6 text-gray-700">
            <p>
              Platformumuz, kullanıcılarına en güncel haberleri Instagram Reels tarzında 
              modern bir arayüzle sunmaktadır. Kişiselleştirilmiş içerik önerileri ve 
              kullanıcı dostu tasarımıyla öne çıkmaktadır.
            </p>
            <p>
              Teknoloji, spor, sağlık, ekonomi ve daha birçok kategoride haberler sunarak 
              kullanıcılarımıza zengin bir içerik deneyimi sağlıyoruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
