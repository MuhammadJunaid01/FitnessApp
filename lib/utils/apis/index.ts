import {
  IForgotPasswordPayload,
  IForgotVerifyOtpPayload,
  IGenericResponse,
  IGetStepsPayload,
  IResetPasswordPayload,
  ISendOtpPayload,
  ISignInPayload,
  ISignUpPayload,
  ISteps,
  IUpdateAppearancePayload,
  IUser,
  IUserPhysicalStats,
  IVerifyOtpPayload,
} from '../../interfaces';
import axiosInstance from '../db';

export const signup = async (
  payload: ISignUpPayload,
): Promise<IGenericResponse<IUser>> => {
  const response = await axiosInstance.post<IGenericResponse<IUser>>(
    '/auth/signup',
    payload,
  );
  return response.data;
};

export const signin = async (
  payload: ISignInPayload,
): Promise<IGenericResponse<IUser>> => {
  const response = await axiosInstance.post<IGenericResponse<IUser>>(
    '/auth/signin',
    payload,
  );
  return response.data;
};

export const forgotPassword = async (
  payload: IForgotPasswordPayload,
): Promise<IGenericResponse> => {
  const response = await axiosInstance.post<IGenericResponse>(
    '/auth/forgot-password',
    payload,
  );
  return response.data;
};
export const verifyForgotPasswordOtp = async (
  payload: IForgotVerifyOtpPayload,
): Promise<IGenericResponse> => {
  const response = await axiosInstance.post<IGenericResponse>(
    '/auth/verify-otp-forgot-password',
    payload,
  );
  return response.data;
};

export const resetPassword = async (
  payload: IResetPasswordPayload,
): Promise<IGenericResponse<IUser>> => {
  const response = await axiosInstance.post<IGenericResponse<IUser>>(
    '/auth/new-password',
    payload,
  );
  return response.data;
};

export const sendOtp = async (
  payload: ISendOtpPayload,
): Promise<IGenericResponse> => {
  const response = await axiosInstance.post<IGenericResponse>(
    '/auth/send-otp',
    payload,
  );
  return response.data;
};

export const verifyOtp = async (
  payload: IVerifyOtpPayload,
): Promise<IGenericResponse> => {
  const response = await axiosInstance.post<IGenericResponse>(
    '/auth/verify-otp',
    payload,
  );
  return response.data;
};
export const createOrUpdateSteps = async (
  payload: ISteps,
): Promise<IGenericResponse<ISteps>> => {
  const response = await axiosInstance.post<IGenericResponse<ISteps>>(
    '/steps',
    payload,
  );
  return response.data;
};

// Get steps by date range
export const getStepsByDateRange = async (
  payload: IGetStepsPayload,
): Promise<IGenericResponse<ISteps[]>> => {
  const {userId, startDate, endDate} = payload;
  const response = await axiosInstance.get<IGenericResponse<ISteps[]>>(
    `/steps/${userId}`,
    {
      params: {startDate, endDate},
    },
  );
  return response.data;
};
export const getUserStats = async (
  userId: string,
): Promise<IGenericResponse<IUserPhysicalStats>> => {
  const response = await axiosInstance.get<
    IGenericResponse<IUserPhysicalStats>
  >(`/user-preferences/stats/${userId}`);
  return response.data;
};

// Upsert (create or update) stats for a specific user
export const upsertUserStats = async (
  userId: string,
  payload: IUserPhysicalStats,
): Promise<IGenericResponse<IUserPhysicalStats>> => {
  const response = await axiosInstance.post<
    IGenericResponse<IUserPhysicalStats>
  >(`/user-preferences/stats/${userId}`, payload);
  return response.data;
};

// Update appearance preference for a specific user
export const updateUserAppearance = async (
  userId: string,
  payload: IUpdateAppearancePayload,
): Promise<IGenericResponse<IUserPhysicalStats>> => {
  const response = await axiosInstance.patch<
    IGenericResponse<IUserPhysicalStats>
  >(`/user-preferences/stats/${userId}/appearance`, payload);
  return response.data;
};
