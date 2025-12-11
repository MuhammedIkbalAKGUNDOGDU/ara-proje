import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", label: "Ana Sayfa" },
    { path: "/profile", label: "Profil" },
    { path: "/news", label: "Haberler" },
    { path: "/about", label: "Hakkımızda" },
    { path: "/contact", label: "İletişim" },
  ];

  return (
    <nav className="bg-white shadow-lg relative border-b border-red-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              HaberApp
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Hoş geldin, {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
