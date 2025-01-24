const express = require("express");
const { getKakaoToken, getKakaoUserInfo, saveOrUpdateUser } = require("../services/authService");

const router = express.Router();

/**
 * [GET] 카카오 로그인 리다이렉트
 */
router.get("/kakao/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Authorization code is required" });

    // 1. 액세스 토큰 요청
    const accessToken = await getKakaoToken(code);

    // 2. 사용자 정보 가져오기
    const kakaoUser = await getKakaoUserInfo(accessToken);

    // 3. 사용자 정보 저장 또는 업데이트
    const user = await saveOrUpdateUser(kakaoUser);

    // 4. 프론트엔드로 토큰 반환 (간단한 세션 토큰 처리)
    req.session.user = { id: user._id, nickname: user.nickname };
    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
