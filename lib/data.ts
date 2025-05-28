import {ActivityDataType} from './interfaces';

export const daysOfWeek: string[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];
export const activityTypes: ActivityDataType[] = [
  'Slow walking',
  'Brisk walking',
  'Jogging',
  'Running',
];
export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Other';

export const genderOptions: Gender[] = [
  'Male',
  'Female',
  'Non-binary',
  'Other',
];
