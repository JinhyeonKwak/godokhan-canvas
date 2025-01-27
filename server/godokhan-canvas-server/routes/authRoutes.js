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

    console.log("request access token")

    // 1. 액세스 토큰 요청
    const accessToken = await getKakaoToken(code);

    console.log("fetch user info")

    // 2. 사용자 정보 가져오기
    const kakaoUser = await getKakaoUserInfo(accessToken);

    console.log("save user")

    // 3. 사용자 정보 저장 또는 업데이트
    const user = await saveOrUpdateUser(kakaoUser);

    console.log("return session token")

    // 4. 프론트엔드로 토큰 반환 (간단한 세션 토큰 처리)
    req.session.user = { id: user._id, nickname: user.nickname };
    res.redirect(302, "http://localhost:5173")
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** 
 * [GET] 로그인 여부 확인 (세션 체크)
 */
router.get("/me", (req, res) => {
  console.log("test");
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
