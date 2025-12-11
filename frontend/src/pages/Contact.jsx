import React from "react";

function Contact() {
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">İletişim</h1>
            <p className="text-lg text-gray-600">Bizimle iletişime geçin</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-gray-600 mb-1">E-posta</p>
              <p className="text-lg font-semibold text-red-600">info@example.com</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <p className="text-sm text-gray-600 mb-1">Telefon</p>
              <p className="text-lg font-semibold text-rose-600">+90 555 123 45 67</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
