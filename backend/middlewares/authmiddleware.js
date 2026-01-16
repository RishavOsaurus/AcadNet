import { access } from "fs";
import jsonRes from "../utils/response.js";
import { verifyAccessToken } from "../utils/utils.js";

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
    console.log('[authMiddleware] missing access token - request cookies:', req.cookies);
    return jsonRes(res, 401, false, "Unauthorized Access");
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
