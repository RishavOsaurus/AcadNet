import { access } from "fs";
import jsonRes from "../utils/response.js";
import { verifyAccessToken, verifyRefreshToken } from "../utils/utils.js";

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.accessToken;

  const mask = (s) => {
    if (!s) return "<none>";
    try {
      return s.length > 12 ? `${s.slice(0, 6)}...${s.slice(-6)}` : s;
    } catch (e) {
      return "<masked>";
    }
  };

  console.log(`[authMiddleware] origin=${req.headers.origin || req.ip} cookies=${Object.keys(req.cookies||{})} accessToken=${mask(token)}`);

  if (!token) {
    // No access token present. Try to fallback to a valid refresh token so
    // endpoints like /auth/checkSession can run the session logic while
    // keeping this middleware in the request chain.
    const refresh = req.cookies?.refreshToken;
    if (!refresh) {
      console.log('[authMiddleware] missing access token - request cookies:', req.cookies);
      return jsonRes(res, 401, false, "Unauthorized Access");
    }

    try {
      const decodedRefresh = verifyRefreshToken(refresh);
      // attach id from the refresh token so downstream middleware (addUser)
      // can populate `req.user` and controllers can operate normally.
      req.id = decodedRefresh.id || decodedRefresh.user_id || decodedRefresh.sub;
      console.log('[authMiddleware] no access token but valid refresh token, user id set:', req.id);
      return next();
    } catch (e) {
      console.log('[authMiddleware] refresh token verify error:', e && e.name, e && e.message);
      return jsonRes(res, 401, false, "Unauthorized Access");
    }
  }
  try {
    const decoded = verifyAccessToken(token);
    console.log('[authMiddleware] token verified, decoded keys:', Object.keys(decoded || {}));
    req.id = decoded.id;
    next();
  } catch (err) {
    console.log('[authMiddleware] token verification error:', err && err.name, err && err.message);
    if (err && err.name === "TokenExpiredError") {
      return jsonRes(res, 401, false, "Token Expired");
    } else if (err && err.name === "JsonWebTokenError") {
      return jsonRes(res, 403, false, "Invalid Token");
    } else {
      return jsonRes(res, 500, false, "Server Error");
    }
  }
};

export default authMiddleware;
