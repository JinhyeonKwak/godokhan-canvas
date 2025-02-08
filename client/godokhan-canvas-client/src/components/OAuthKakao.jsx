const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

const OAuthKakao = () => {
  const handleLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-opacity-50 shadow-md"
    >
      {/* 카카오 로고 */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M128 36C70.562 36 24 72.713 24 118.634c0 29.384 19.123 55.26 47.852 69.959-2.111 7.763-7.658 28.17-7.922 29.764-.339 2.029.859 2.005 1.791 1.453 0.736-0.435 11.631-7.907 16.399-11.169 9.916 2.927 20.686 4.627 31.880 4.627 57.438 0 104-36.713 104-82.634C218 72.713 185.438 36 128 36z"
          fill="currentColor"
        />
      </svg>
      <span>카카오 계정으로 로그인</span>
    </button>
  );
};

export default OAuthKakao;