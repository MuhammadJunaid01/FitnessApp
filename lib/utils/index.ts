import moment from 'moment';
import {DateRange, WeeklyDateRange} from '../interfaces';

interface InputData {
  dateTime: string; // ISO date string
  value: number; // Steps or value
}

interface TransformedData {
  date: string; // Formatted date (e.g., 'Sun, Feb 6')
  steps: number; // Steps count
  label: string; // Day label (e.g., 'Sun')
}

export const transformData = (data: InputData[]): TransformedData[] => {
  return data.map(item => ({
    date: moment(item.dateTime).format('ddd, MMM D'), // Format: 'Sun, Feb 6'
    steps: item.value, // Map 'value' to 'steps'
    label: moment(item.dateTime).format('ddd'), // Extract day label (e.g., 'Sun')
  }));
};
export function formatDateRange(start: string, end: string): string {
  const startDate = moment(start);
  const endDate = moment(end);

  // Format: '15 Feb 2022 to 22 Feb 2022'
  return `${startDate.format('D MMM YYYY')} to ${endDate.format('D MMM YYYY')}`;
}
export const formatDate = (date: string | Date): string => {
  return moment(date).format('D MMMM YYYY');
};
export const calculateDailyStepPercentage = (
  dailyGoal: number,
  dailyStep: number,
): number => {
  if (dailyGoal <= 0) {
    return 0;
  }
  if (dailyStep < 0) {
    return 0;
  }

  return Math.min((dailyStep / dailyGoal) * 100, 100);
};
export const getTodayDateRange = (): DateRange => {
  const startDate = moment().startOf('day').toISOString(); // Start of today
  const endDate = moment().endOf('day').toISOString(); // End of today

  return {startDate, endDate};
};

// Get this week's date range (from Sunday to Saturday)
export const getWeeklyDateRange = (): WeeklyDateRange => {
  const startOfWeek = moment().startOf('week').toISOString(); // Start of the week
  const endOfWeek = moment().endOf('week').toISOString(); // End of the week

  return {startOfWeek, endOfWeek};
};
