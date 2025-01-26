import axios from "axios";

export const kakaoLogin = async (code) => {
  const response = await axios.get(`/auth/kakao/callback?code=${code}`);
  return response.data;
};