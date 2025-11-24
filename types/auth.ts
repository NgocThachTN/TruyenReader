export interface RegisterData {
  email: string;
  password: string;
  confirmpassword: string;
  fullname: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}
