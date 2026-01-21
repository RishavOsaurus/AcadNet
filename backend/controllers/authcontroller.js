import jsonRes from "../utils/response.js";
import {
  loginOauth,
  refreshTokens,
  logout,
  logoutAll,
  sessionService,
  signupService,
  loginService,
  otpGenerator,
  otpSender,
  otpChecker,
  resetOTPgenerator,
  changePasswordService,
  terminateUser
} from "../services/authservices.js";
import { deleteUserAccount } from "../services/userAccountService.js";
import UserModel from "../models/user.model.js";
import { randomBytes } from "crypto";
import path from "path";
import { fileURLToPath } from "url";


const indexPath = "https://crishav.com.np/AcadNet/";
const dashPath = "https://crishav.com.np/AcadNet/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const isProd = process.env.NODE_ENV === 'production';

function cookieOptions(req, { httpOnly = true, maxAge = undefined, csrf = false } = {}) {
  // Force SameSite=None and Secure=true as requested (works for cross-site cookies).
  const opts = {
    httpOnly: httpOnly,
    sameSite: 'none',
    secure: true, // Always use secure for cross-origin cookies to work with SameSite=None
  };
  if (typeof maxAge === 'number') opts.maxAge = maxAge;
  // CSRF token is readable by JS, so httpOnly=false when csrf flag is passed
  if (csrf) opts.httpOnly = false;
  
  // Log cookie options for debugging cross-origin issues
  console.log('[cookieOptions]', { httpOnly: opts.httpOnly, sameSite: opts.sameSite, secure: opts.secure, maxAge: opts.maxAge, origin: req.headers.origin });
  
  return opts;
}

export const oAuthFail = async (req,res) =>{
    const filePath = path.join(__dirname, "../failure/fail.html");
    console.log(filePath)
   res.status(401).sendFile(filePath);
}

export const oAuthCallback = async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.redirect(indexPath);
  }

  try {
    const { accessToken, refreshToken, csrfToken } = await loginOauth(user);

    res.cookie("accessToken", accessToken, cookieOptions(req, { httpOnly: true, maxAge: 15 * 60 * 1000 }));
    res.cookie("refreshToken", refreshToken, cookieOptions(req, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }));
    res.cookie("csrfToken", csrfToken, cookieOptions(req, { httpOnly: false, maxAge: 15 * 60 * 1000, csrf: true }));
    
    return res.redirect(dashPath);
  } catch (err) {
    console.log(err);
    return res.redirect(indexPath);
  }
};

export const sessionChecker = async (req, res) => {
  try {

    const oldRefreshToken = req.cookies.refreshToken;
  
    if (!oldRefreshToken) {
      return jsonRes(res, 401, false, "No refresh token provided");
    }
    const {isSession,accessToken} = await sessionService(oldRefreshToken,req.user);

    if (isSession == true) {

      res.cookie("accessToken", accessToken, cookieOptions(req, { httpOnly: true, maxAge: 15 * 60 * 1000 }));

    
      return jsonRes(res, 200, true, "Ref Token is Valid");
    } else {
      return jsonRes(res, 401, false, "Session is invalid");
    }
  } catch (err) {
    console.log("Error")
    return jsonRes(res, 401, false, "Session is invalid or expired");
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken)
      return jsonRes(res, 401, false, "No refresh token provided");

    const { accessToken, refreshToken, csrfToken } = await refreshTokens(
      oldRefreshToken
    );

    // Clear cookies using same attributes so browser removes them correctly
    res.clearCookie("accessToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("refreshToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("csrfToken", cookieOptions(req, { httpOnly: false, csrf: true }));

    // Set new tokens cookies
    res.cookie("accessToken", accessToken, cookieOptions(req, { httpOnly: true, maxAge: 15 * 60 * 1000 }));
    res.cookie("refreshToken", refreshToken, cookieOptions(req, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }));
    res.cookie("csrfToken", csrfToken, cookieOptions(req, { httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000, csrf: true }));

    // Log cookies and masked tokens for debugging why browser may drop them
    try {
      const mask = (s) => {
        if (!s) return '<none>';
        return s.length > 12 ? `${s.slice(0,6)}...${s.slice(-6)}` : s;
      };
      console.log('[refreshAccessToken] new tokens', { access: mask(accessToken), refresh: mask(refreshToken), csrf: mask(csrfToken) });
      const setCookie = res.getHeader && res.getHeader('Set-Cookie');
      console.log('[refreshAccessToken] Set-Cookie headers to be sent=', setCookie);
    } catch (e) {
      console.log('[refreshAccessToken] logging failed', e);
    }

    return jsonRes(res, 200, true, "Token refreshed");
  } catch (err) {
    console.log(err);
    return jsonRes(res, 403, false, err.message || "Refresh failed");
  }
};

export const logoutCont = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return jsonRes(res, 400, false, "No refresh token provided");

    await logout(refreshToken);

    // Clear cookies using same options
    res.clearCookie("accessToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("refreshToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("csrfToken", cookieOptions(req, { httpOnly: false, csrf: true }));

    return jsonRes(res, 200, true, "Logged out successfully");
  } catch (err) {
    console.log(err);
    return jsonRes(res, 500, false, "Logout failed");
  }
};

export const logoutAllCont = async (req, res) => {
  try {
    const userId = req.user.user_id;

    await logoutAll(userId);

    // Clear cookies
    res.clearCookie("accessToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("refreshToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("csrfToken", cookieOptions(req, { httpOnly: false, csrf: true }));

    return jsonRes(res, 200, true, "Logged out from all sessions");
  } catch (err) {
    console.log(err);
    return jsonRes(res, 500, false, "Logout all failed");
  }
};

export const checkedRes = (req, res) => {
  return jsonRes(res, 200, true, "Logged In");
};

export const signup = async (req, res) => {
  try {
    let { email, username, password } = req.body;

    email = email.toLowerCase();
    username = username.toLowerCase();
    const newusername= await signupService(email, username, password);

    const otpToken = randomBytes(20).toString("hex");

    

    res.cookie("otpToken", otpToken, cookieOptions(req, { httpOnly: true, maxAge: 60 * 60 * 1000 }));
    res.cookie("username", newusername, cookieOptions(req, { httpOnly: true, maxAge: 60 * 60 * 1000 }));



    return jsonRes(res, 200, true, "Success");
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return jsonRes(res, 409, false, "Email already in use");
    }

    return jsonRes(res, 500, false, err.message);
  }
};

export const otpAuthGenerator = async (req, res) => {
  try {

    const username = req.cookies.username;
    const otpToken = req.cookies.otpToken;
  
    const { otp, email } = await otpGenerator(username, otpToken);
   
    await otpSender(otp, username, email);
    jsonRes(res, 200, true, "OTP Sent");
  } catch (err) {
    return jsonRes(res, err.code, false, err.message);
  }
};

export const otpAuthChecker = async (req, res) => {
  try {
    const username = req.cookies.username;
    const otpToken = req.cookies.otpToken;
    const { otp } = req.body;
    const check = await otpChecker(username, otpToken, otp);
    if (check) {
      res.clearCookie("username", cookieOptions(req, { httpOnly: true }));
      res.clearCookie("otpToken", cookieOptions(req, { httpOnly: true }));
      jsonRes(res, 200, true, "Verified");
    } else {
      jsonRes(res, err.code, false, "Not Verified");
    }
  } catch (err) {
    return jsonRes(res, err.code, false, err.message);
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    const { accessToken, refreshToken, csrfToken } = await loginService(
      res,
      email,
      password
    );

    res.cookie("accessToken", accessToken, cookieOptions(req, { httpOnly: true, maxAge: 15 * 60 * 1000 }));
    res.cookie("refreshToken", refreshToken, cookieOptions(req, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }));
    res.cookie("csrfToken", csrfToken, cookieOptions(req, { httpOnly: false, maxAge: 15 * 60 * 1000, csrf: true }));

    console.log('[login] Set cookies for origin=', req.headers.origin, 'Check Set-Cookie headers in response');
    jsonRes(res, 200, true, "Login Success");
  } catch (err) {
    if (
      err.message == "Login Error: User not Found" ||
      err.message == "Login Error: Wrong Credentials"
    ) {
      return jsonRes(res, 401, false, err.message);
    } else if (err.message == "Please Login via GitHub") {
      return jsonRes(res, 409, false, err.message);
    } else if (err.message == "Redirecting to /otp-auth") {
      return jsonRes(res, 303, false, err.message);
    } else {
      return jsonRes(res, 500, false, err.message);
    }
  }
};

export const resetPasswordSender = async (req, res) => {
  try {
    const { email } = req.body;

    const { otp, otpToken, username } = await resetOTPgenerator(email);

    await otpSender(otp, username, email);

    res.cookie("username", username, cookieOptions(req, { httpOnly: true, maxAge: 5 * 60 * 1000 }));
    res.cookie("resetToken", otpToken, cookieOptions(req, { httpOnly: true, maxAge: 5 * 60 * 1000 }));

    jsonRes(res, 200, true, "OTP SENT");
  } catch (err) {
    return jsonRes(res, err.code, false, err.message);
  }
};

export const resetVerifier = async (req, res) => {
  try {
    const username = req.cookies.username;
    const otpToken = req.cookies.resetToken;
    const { otp } = req.body;
    const check = await otpChecker(username, otpToken, otp);
    if (check) {
      jsonRes(res, 200, true, "Verified");
    } else {
      jsonRes(res, err.code, false, "Not Verified");
    }
  } catch (err) {
    return jsonRes(res, err.code, false, err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const username = req.cookies.username;
    const otpToken = req.cookies.resetToken;
    const { newPassword } = req.body;

    if (!newPassword) {
      return jsonRes(res, 400, false, "New password is required.");
    }

    await changePasswordService(username, otpToken, newPassword);

    res.clearCookie("username", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("resetToken", cookieOptions(req, { httpOnly: true }));

    return jsonRes(res, 200, true, "Password has been reset successfully.");
  } catch (err) {
    return jsonRes(res, err.code || 500, false, err.message);
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userid = req.id;
    
    // Use comprehensive deletion that removes all user data
    const result = await deleteUserAccount(userid);
    
    // Clear cookies on successful deletion
    res.clearCookie("accessToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("refreshToken", cookieOptions(req, { httpOnly: true }));
    res.clearCookie("csrfToken", cookieOptions(req, { httpOnly: false, csrf: true }));

    return jsonRes(res, 200, true, result.message || "Account and all associated data deleted successfully");
  } catch (err) {
    console.log(err);
    return jsonRes(res, err.code || 500, false, err.message || "Failed to delete user account");
  }
};

export const getCsrfToken = (req, res) => {
  try {
    let token = req.cookies?.csrfToken || null;
    // If no CSRF cookie present, create one so cross-origin frontends can obtain a token
    if (!token) {
      try {
        token = randomBytes(16).toString('hex');
        res.cookie("csrfToken", token, cookieOptions(req, { httpOnly: false, maxAge: 15 * 60 * 1000, csrf: true }));
      } catch (e) {
        console.log('[getCsrfToken] failed to generate cookie', e);
      }
    }

    console.log('[getCsrfToken] origin=', req.headers.origin || req.ip, 'cookies=', Object.keys(req.cookies||{}), 'tokenPresent=', !!token);
    return res.status(200).json({ csrfToken: token });
  } catch (err) {
    console.log('[getCsrfToken] error', err);
    return res.status(500).json({ csrfToken: null });
  }
};

