
import api from "./axios.ts";

import type {
  LoginPayload,
  AuthResponse,
  RegisterPayload,
} from "../types/auth.types.ts";

export const loginUser = async (
  data: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};

export const registerUser = async (
  data: RegisterPayload
): Promise<AuthResponse> => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};