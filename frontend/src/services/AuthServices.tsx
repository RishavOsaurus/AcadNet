import apiClient from "@/lib/apiClient";

async function ensureCsrfToken() {
  try {
    if (apiClient.defaults.headers.common['X-CSRF-Token']) return;
    const res = await apiClient.get('auth/csrf-token');
    const token = res?.data?.csrfToken;
    if (token) apiClient.defaults.headers.common['X-CSRF-Token'] = token;
  } catch (err) {
    // don't throw — let caller handle request failure
    // eslint-disable-next-line no-console
    console.warn('ensureCsrfToken failed', err);
  }
}

export const loginAPI = async (email: string, password: string) => {
  try {
    const response = await apiClient.post<any>("auth/login", {
      email: email,
      password: password,
    });
    return { data: response.data, status: response.status };
  } catch (error) {
    throw error;
  }
};

export const registerAPI = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    const { data } = await apiClient.post("auth/signup", {
      email: email,
      username: username,
      password: password,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const logoutAPI = async () => {
  try {
    await apiClient.post("auth/logout");
  } catch (error) {
    throw error;
  }
};

export const checkSessionAPI = async () => {
  try {
    await ensureCsrfToken();
    const response = await apiClient.post<any>("auth/checkSession");
    return { data: response.data, status: response.status };
  } catch (error) {
    throw error;
  }
};
export const authorizedPageAPI = async () => {
  try {
    await ensureCsrfToken();
    const response = await apiClient.get<any>("auth/authorizedPage");
    return { data: response.data, status: response.status };
  } catch (error) {
    throw error;
  }
};
export const refresTokenAPI = async () => {
  try {
    await ensureCsrfToken();
    const refreshRes = await apiClient.post<any>("auth/refresh-token");
    return { data: refreshRes.data, status: refreshRes.status };
  } catch (error) {
    throw error;
  }
};

export const forgotPasswordAPI = async (email: string) => {
  try {
    const response = await apiClient.post<any>("auth/password-reset", {
      email,
    });
    return { data: response.data, status: response.status };
  } catch (error) {
    throw error;
  }
};

export const verifyOTPAndResetPasswordAPI = async (
  otp: string,
  newPassword: string
) => {
  try {
    const verifyResponse = await apiClient.post<any>("auth/password-verify", {
      otp,
    });
    if (verifyResponse.status !== 200 || verifyResponse.data.success !== true) {
      throw new Error(verifyResponse.data.message || "OTP verification failed");
    }
    const changePassword = await apiClient.post<any>("auth/change-password", {
      newPassword,
    });
    return { data: changePassword.data, status: changePassword.status };
  } catch (error) {
    throw error;
  }
};

export const sendSignupOtpAPI = async () => {
  try {
    const response = await apiClient.post<any>("auth/otp-auth", {});
    return { data: response.data, status: response.status };
  } catch (error) {
    throw error;
  }
};

export const verifySignupOtpAPI = async (otp: string) => {
  try {
    const response = await apiClient.post<any>("auth/otp-verify", { otp });
    return { data: response.data, status: response.status };
  } catch (error) {
    throw error;
  }
};

export const deleteAccountAPI = async () => {
  try {
    const response = await apiClient.post<any>("auth/delete-user");
    return { data: response.data, status: response.status };
  } catch (error) {
    throw error;
  }
};
