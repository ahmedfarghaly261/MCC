export type RegistrationStep = 'info' | 'passkey' | 'success';

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type RegisterResponse = {
  name: string;
  email: string;
};
