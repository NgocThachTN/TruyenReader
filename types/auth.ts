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
