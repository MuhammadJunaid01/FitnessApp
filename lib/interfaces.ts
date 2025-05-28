export type ActivityDataType =
  | 'Slow walking'
  | 'Brisk walking'
  | 'Jogging'
  | 'Running';
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  otp?: string; // Store OTP
  otpExpires?: Date; // OTP expiration time
  address?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  isVerified?: boolean;
}

export interface Calorie {
  calorie: number;
  day: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  wasManuallyEntered: boolean;
}
export interface UserPreference {
  activityType: string; // Example: "Slow walking"
  age: number; // Example: 24
  gender: string; // Example: "Male"
  height: number; // Example: 7 (in desired unit, e.g., feet/meters)
  id: string; // Firestore document ID, e.g., "w3iJhwhWPcFfvFUyTWmB"
  userId: string; // Associated user ID, e.g., "9CnDvUUTHnT8mpL82UAGgLIim3J2"
  weight: number; // Example: 50 (in desired unit, e.g., kg/lbs)
}
export interface AvgStepsMetrics {
  avgStepsPerHour: number; // Average number of steps per hour
  caloriesBurned: number; // Total calories burned
  kilometers: number; // Distance in kilometers
  walkSessions: number; // Number of walking sessions
  spendMinutes: number; // Total time spent walking in minutes
}
export interface IUserGoal {
  createdAt: Date; // timestamp
  dailyGoal: number; // number
  day: Date; // timestamp
  selectedActivity: string; // string
  selectedDay: string; // string
  updatedAt: Date; // timestamp
  userId: string; // string
  weeklyGoal: number; // number
}
export interface IStepData {
  step: number;
  caloriesBurn: number;
  minutes: number;
  kilometers: number;
  userId: string;
  date: string;
}
export interface ISignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface ISignInPayload {
  email: string;
  password: string;
}
export interface IForgotVerifyOtpPayload {
  email: string;
  otp: string;
}
export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
  email: string;
}

export interface ISendOtpPayload {
  phone: string;
}

export interface IVerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface IGenericResponse<T = any> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
}
export interface ISteps {
  steps: number;
  caloriesBurned: number;
  kilometers: number;
  walkSessions: number;
  avgStepsPerHour: number;
  spendMinutes: number;
  isGoalReached: boolean;
  user: IUser | null | string;
  date: Date;
}
export interface IGetStepsPayload {
  userId: string;
  startDate: string;
  endDate: string;
}

export interface IUserPhysicalStats {
  weight: number; // Weight in kilograms
  height: number; // Height in centimeters
  age: number; // Age in years
  gender: 'male' | 'female' | 'non-binary' | 'other'; // Gender options
  activityType: 'Slow walking' | 'Brisk walking' | 'Jogging' | 'Running'; // Activity levels
  userId: IUser | null; // Reference to a user
  createdAt?: Date; // Auto-added timestamp
  updatedAt?: Date; // Auto-updated timestamp
  appearance: 'darkMode' | 'lightMode'; // Appearance preference
}
export interface IUpdateAppearancePayload {
  appearance: 'darkMode' | 'lightMode';
}
