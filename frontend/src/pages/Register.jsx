import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL, API_KEY } from "../config/api";

function Register() {
  const [step, setStep] = useState(1); // 1: Register, 2: Verify
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [verifyData, setVerifyData] = useState({
    email: "",
    code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError("");
  };

  const handleVerifyChange = (e) => {
    const { name, value } = e.target;
    setVerifyData({
      ...verifyData,
      [name]: value,
    });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    // Şartları kabul etme kontrolü
    if (!formData.agreeTerms) {
      setError("Kullanım şartlarını kabul etmelisiniz!");
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      const requestHeaders = {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      };

      // Request'i konsola yazdır
      console.log("Register API Request:", {
        url: `${API_BASE_URL}/auth/register`,
        method: "POST",
        headers: requestHeaders,
        body: requestBody,
      });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      // Response'u text olarak al, sonra JSON'a çevirmeye çalış
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // JSON değilse, text olarak kullan
        data = { message: responseText };
      }

      // Response'u konsola yazdır
      console.log("Register API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: responseText,
        parsedData: data,
      });

      if (response.ok) {
        // Kayıt başarılı, kod doğrulama ekranına geç
        setVerifyData({
          email: formData.email,
          code: "",
        });
        setStep(2);
      } else {
        setError(
          data.message || responseText || "Kayıt işlemi başarısız oldu!"
        );
      }
    } catch (error) {
      console.error("Register error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
        },
        body: JSON.stringify({
          email: verifyData.email,
          code: verifyData.code,
        }),
      });

      // Response'u text olarak al, sonra JSON'a çevirmeye çalış
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // JSON değilse, text olarak kullan
        data = { message: responseText };
      }

      // Response'u konsola yazdır
      console.log("Verify Registration API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: responseText,
        parsedData: data,
      });

      if (response.ok && data.statusCode === 200) {
        // Doğrulama başarılı, kullanıcıyı giriş yap
        // Response formatı: { statusCode: 200, message: "...", data: { token: "..." } }
        const token = data.data?.token;

        // Token'ı localStorage'a kaydet
        if (token) {
          localStorage.setItem("token", token);
        }

        const userData = {
          id: data.data?.id || Date.now().toString(),
          email: verifyData.email,
          name: `${formData.name} ${formData.surname}`,
          token: token,
          refreshToken: data.data?.refreshToken,
        };
        login(userData);

        // Kullanıcı hesap bilgilerini al
        try {
          const accountResponse = await fetch(`${API_BASE_URL}/users/account`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "x-api-key": API_KEY,
            },
          });

          const accountResponseText = await accountResponse.text();
          let accountData;
          try {
            accountData = JSON.parse(accountResponseText);
          } catch (e) {
            accountData = { message: accountResponseText };
          }

          // Konsola çıktıyı yazdır
          console.log("User Account API Response:", {
            status: accountResponse.status,
            statusText: accountResponse.statusText,
            headers: Object.fromEntries(accountResponse.headers.entries()),
            rawResponse: accountResponseText,
            parsedData: accountData,
          });

          // Account bilgilerini localStorage'a kaydet
          if (
            accountResponse.ok &&
            accountData.statusCode === 200 &&
            accountData.data
          ) {
            localStorage.setItem(
              "accountData",
              JSON.stringify(accountData.data)
            );

            // UserData'yı account bilgileriyle güncelle
            const updatedUserData = {
              ...userData,
              ...accountData.data,
            };
            login(updatedUserData);

            alert("Kayıt ve doğrulama başarılı!");

            // firstLogin true ise kategori seçim sayfasına, değilse ana sayfaya yönlendir
            if (accountData.data.firstLogin === true) {
              navigate("/interests");
            } else {
              navigate("/");
            }
          } else {
            // Account API başarısız olsa bile devam et
            alert("Kayıt ve doğrulama başarılı!");
            navigate("/");
          }
        } catch (accountError) {
          console.error("Account API error:", accountError);
          // Hata olsa bile devam et
          alert("Kayıt ve doğrulama başarılı!");
          navigate("/");
        }
      } else {
        setError(data.message || responseText || "Doğrulama kodu hatalı!");
      }
    } catch (error) {
      console.error("Verify error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Kod Doğrulama Ekranı
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo ve Başlık */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              E-posta Doğrulama
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {verifyData.email} adresine gönderilen doğrulama kodunu girin
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleVerify}>
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email (readonly) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  E-posta Adresi
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    readOnly
                    value={verifyData.email}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 bg-gray-50 text-gray-500 rounded-lg sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Doğrulama Kodu */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Doğrulama Kodu
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={verifyData.code}
                    onChange={handleVerifyChange}
                    maxLength={6}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>
              </div>

              {/* Doğrula Butonu */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Doğrulanıyor..." : "Doğrula"}
                </button>
              </div>

              {/* Geri Dön */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-green-600 hover:text-green-500"
                >
                  ← Geri Dön
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Kayıt Formu
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo ve Başlık */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Hesap Oluşturun
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Giriş yapın
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Ad ve Soyad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ad
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Adınız"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Soyad
                </label>
                <div className="mt-1">
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.surname}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-posta Adresi
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Telefon Numarası */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Telefon Numarası
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="5XXXXXXXXX"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Şifre
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Şifrenizi oluşturun"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 cursor-pointer transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                  )}
                </button>
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Şifre Tekrar
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 cursor-pointer transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                  )}
                </button>
              </div>
            </div>

            {/* Şifre Güvenlik İpuçları */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Şifre Gereksinimleri:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li
                  className={`flex items-center ${
                    formData.password.length >= 8
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <svg
                    className={`w-3 h-3 mr-2 ${
                      formData.password.length >= 8
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  En az 8 karakter
                </li>
                <li
                  className={`flex items-center ${
                    /[A-Z]/.test(formData.password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <svg
                    className={`w-3 h-3 mr-2 ${
                      /[A-Z]/.test(formData.password)
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  En az 1 büyük harf
                </li>
                <li
                  className={`flex items-center ${
                    /[0-9]/.test(formData.password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <svg
                    className={`w-3 h-3 mr-2 ${
                      /[0-9]/.test(formData.password)
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  En az 1 rakam
                </li>
              </ul>
            </div>

            {/* Kullanım Şartları */}
            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="agreeTerms"
                className="ml-2 block text-sm text-gray-900"
              >
                <a href="#" className="text-green-600 hover:text-green-500">
                  Kullanım şartlarını
                </a>{" "}
                ve{" "}
                <a href="#" className="text-green-600 hover:text-green-500">
                  gizlilik politikasını
                </a>{" "}
                kabul ediyorum
              </label>
            </div>

            {/* Kayıt Butonu */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-green-500 group-hover:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {loading ? "Kayıt yapılıyor..." : "Hesap Oluştur"}
              </button>
            </div>

            {/* Sosyal Medya Kayıt */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Veya</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
