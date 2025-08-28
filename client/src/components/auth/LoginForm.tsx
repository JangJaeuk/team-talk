"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export const LoginForm = () => {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, login, error, setError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(email, password, nickname);
        setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
        setIsRegister(false);
        setEmail("");
        setPassword("");
        setNickname("");
      } else {
        await login(email, password);
        router.replace("/rooms");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "회원가입" : "로그인"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {isRegister && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center space-x-2 ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {isLoading && <LoadingSpinner />}
            <span>{isRegister ? "가입하기" : "로그인"}</span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-500 hover:text-blue-700"
          >
            {isRegister ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}
          </button>
        </div>
      </div>
    </div>
  );
};
