import React from "react";

function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Lokum Haber" 
                className="h-24 w-24 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">İletişim</h1>
            <p className="text-lg text-gray-600">Lokum Haber ile iletişime geçin</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">E-posta</p>
              <a 
                href="mailto:muhammik1234@gmail.com"
                className="text-lg font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                muhammik1234@gmail.com
              </a>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">E-posta</p>
              <a 
                href="mailto:muhammedikbalcmp@gmail.com"
                className="text-lg font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                muhammedikbalcmp@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
