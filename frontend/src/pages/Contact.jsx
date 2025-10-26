import React from "react";

function Contact() {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">İletişim</h1>
        <p className="text-lg text-green-600">Bizimle iletişime geçin</p>
        <div className="mt-6 space-y-2">
          <p className="text-green-700">Email: info@example.com</p>
          <p className="text-green-700">Telefon: +90 555 123 45 67</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
