import jsonRes from "../utils/response.js";

const csrfMiddleware = (req, res, next) => {
  const csrfCookie = req.cookies?.csrfToken;

  const csrfHeader = req.headers["x-csrf-token"];

  const mask = (s) => {
    if (!s) return "<none>";
    try {
      return s.length > 12 ? `${s.slice(0, 6)}...${s.slice(-6)}` : s;
    } catch (e) {
      return "<masked>";
    }
  };

  console.log(`[csrfMiddleware] cookies=${Object.keys(req.cookies||{})} csrfCookie=${mask(csrfCookie)} csrfHeader=${mask(csrfHeader)}`);

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    console.log('[csrfMiddleware] CSRF validation failed', { csrfCookiePresent: !!csrfCookie, csrfHeaderPresent: !!csrfHeader });
    return jsonRes(res, 403, false, "Invalid Token");
  }

  next();
};

export default csrfMiddleware;
