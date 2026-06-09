export type LoginFormData = {
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  access_token?: string;
  [key: string]: unknown;
};
