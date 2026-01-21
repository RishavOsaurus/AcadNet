import apiClient, { ensureCsrfToken } from "@/lib/apiClient";

type ApiResult = { success?: boolean; message?: string; [key: string]: unknown };

// uses ensureCsrfToken from apiClient

export const loginAPI = async (email: string, password: string): Promise<{ data: ApiResult; status: number }> => {
  const response = await apiClient.post<ApiResult>("auth/login", { email, password });
  return { data: response.data, status: response.status };
};

export const registerAPI = async (email: string, username: string, password: string): Promise<ApiResult> => {
  const { data } = await apiClient.post<ApiResult>("auth/signup", { email, username, password });
  return data;
};

export const logoutAPI = async (): Promise<void> => {
  await apiClient.post("auth/logout");
};

export const checkSessionAPI = async (): Promise<{ data: ApiResult; status: number }> => {
  await ensureCsrfToken();
  const response = await apiClient.post<ApiResult>("auth/checkSession");
  return { data: response.data, status: response.status };
};
export const authorizedPageAPI = async (): Promise<{ data: ApiResult; status: number }> => {
  await ensureCsrfToken();
  const response = await apiClient.get<ApiResult>("auth/authorizedPage");
  return { data: response.data, status: response.status };
};
export const refresTokenAPI = async (): Promise<{ data: ApiResult; status: number }> => {
  await ensureCsrfToken();
  const refreshRes = await apiClient.post<ApiResult>("auth/refresh-token");
  return { data: refreshRes.data, status: refreshRes.status };
};

export const forgotPasswordAPI = async (email: string): Promise<{ data: ApiResult; status: number }> => {
  const response = await apiClient.post<ApiResult>("auth/password-reset", { email });
  return { data: response.data, status: response.status };
};

export const verifyOTPAndResetPasswordAPI = async (
  otp: string,
  newPassword: string
): Promise<{ data: ApiResult; status: number }> => {
  const verifyResponse = await apiClient.post<ApiResult>("auth/password-verify", { otp });
  if (verifyResponse.status !== 200 || verifyResponse.data.success !== true) {
    throw new Error((verifyResponse.data.message as string) || "OTP verification failed");
  }
  const changePassword = await apiClient.post<ApiResult>("auth/change-password", { newPassword });
  return { data: changePassword.data, status: changePassword.status };
};

export const sendSignupOtpAPI = async (): Promise<{ data: ApiResult; status: number }> => {
  const response = await apiClient.post<ApiResult>("auth/otp-auth", {});
  return { data: response.data, status: response.status };
};

export const verifySignupOtpAPI = async (otp: string): Promise<{ data: ApiResult; status: number }> => {
  const response = await apiClient.post<ApiResult>("auth/otp-verify", { otp });
  return { data: response.data, status: response.status };
};

export const deleteAccountAPI = async (): Promise<{ data: ApiResult; status: number }> => {
  const response = await apiClient.post<ApiResult>("auth/delete-user");
  return { data: response.data, status: response.status };
};
