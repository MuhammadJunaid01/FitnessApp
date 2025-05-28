import moment from 'moment';

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
export const calculateWalkMetrics = (
  step: number,
  weight: number,
  gender: 'male' | 'female',
  height: number,
  walkType: 'Slow walking' | 'Brisk walking' | 'Jogging' | 'Running',
): {
  caloriesBurned: number;
  kilometers: number;
  walkSessions: number;
  avgStepsPerHour: number;
  spendMinutes: number;
} => {
  const ACTIVITY_CONFIG = {
    'Slow walking': {
      threshold: 10.5,
      minStepInterval: 500,
      googleFitActivity: 'walking',
    },
    'Brisk walking': {
      threshold: 11.5,
      minStepInterval: 400,
      googleFitActivity: 'walking',
    },
    Jogging: {
      threshold: 13.0,
      minStepInterval: 300,
      googleFitActivity: 'running',
    },
    Running: {
      threshold: 15.0,
      minStepInterval: 200,
      googleFitActivity: 'running',
    },
  };

  const MET_VALUES: Record<typeof walkType, number> = {
    'Slow walking': 2.0,
    'Brisk walking': 3.5,
    Jogging: 7.0,
    Running: 9.8,
  };

  // Calculate stride length based on gender
  const avgStrideLength = gender === 'male' ? height * 0.415 : height * 0.413; // cm

  // Convert steps to kilometers
  const kilometers = (step * avgStrideLength) / 100000; // Convert cm to km

  // Approximate session duration (average step per minute based on walkType)
  const stepPerMinute = 60000 / ACTIVITY_CONFIG[walkType].minStepInterval; // steps per minute
  const spendMinutes = step / stepPerMinute;

  // Convert minutes to hours for calorie calculation
  const sessionDurationHours = spendMinutes / 60;

  // Calculate calories burned
  const caloriesBurned = MET_VALUES[walkType] * weight * sessionDurationHours;

  // Calculate average steps per hour
  const avgStepsPerHour = (step / spendMinutes) * 60 || 0;

  return {
    caloriesBurned: parseFloat(caloriesBurned.toFixed(2)),
    kilometers: parseFloat(kilometers.toFixed(2)),
    walkSessions: 1, // Assume one session for this standalone function
    avgStepsPerHour: parseFloat(avgStepsPerHour.toFixed(2)),
    spendMinutes: Math.round(spendMinutes),
  };
};
