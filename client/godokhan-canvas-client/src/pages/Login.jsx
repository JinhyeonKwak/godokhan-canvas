import React from "react";
import OAuthKakao from "../components/OAuthKakao";

function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        {/* 로고나 아이콘을 넣을 수 있는 공간 */}
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            고독한 캔버스
            <span className="inline text-xl text-gray-600 mt-2">
              를 함께 꾸며주세요!
            </span>
          </h2>

          {/* 부가 설명이 필요한 경우 */}
          <p className="mt-2 text-sm text-gray-500">
            로그인하고 다양한 기능을 이용해보세요
          </p>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="mt-8">
          <OAuthKakao />
        </div>

        {/* 추가 정보나 링크가 필요한 경우 */}
        <div className="mt-6 text-center text-sm">
          <a href="#" className="text-indigo-600 hover:text-indigo-500">
            서비스 이용약관
          </a>
          <span className="mx-2 text-gray-300">|</span>
          <a href="#" className="text-indigo-600 hover:text-indigo-500">
            개인정보처리방침
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;