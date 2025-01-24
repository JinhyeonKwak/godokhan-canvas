const axios = require("axios");
const User = require("../models/User");

const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

/**
 * 카카오 액세스 토큰 요청
 */
const getKakaoToken = async (code) => {
  try {
    const response = await axios.post(
      KAKAO_AUTH_URL,
      {},
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_CLIENT_ID,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code: code,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("[OAuth] Error getting Kakao token:", error.response?.data);
    throw new Error("Failed to get Kakao token");
  }
};

/**
 * 카카오 사용자 정보 가져오기
 */
const getKakaoUserInfo = async (token) => {
  try {
    const response = await axios.get(KAKAO_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("[OAuth] Error getting Kakao user info:", error.response?.data);
    throw new Error("Failed to get Kakao user info");
  }
};

/**
 * 사용자 정보 저장 또는 업데이트
 */
const saveOrUpdateUser = async (kakaoData) => {
  const { id, kakao_account, properties } = kakaoData;
  
  const user = await User.findOneAndUpdate(
    { kakaoId: id },
    {
      email: kakao_account.email,
      nickname: properties.nickname,
      profileImage: properties.profile_image,
    },
    { new: true, upsert: true }
  );

  return user;
};

module.exports = { getKakaoToken, getKakaoUserInfo, saveOrUpdateUser };
