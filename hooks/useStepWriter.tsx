import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {accelerometer} from 'react-native-sensors';
import {ActivityDataType, IGetStepsPayload, ISteps} from '../lib/interfaces';
import {isIOSVirtualDevice} from '../lib/utils';
import {createOrUpdateSteps, getStepsByDateRange} from '../lib/utils/apis';
import {useHook} from './ThemeContext';

export interface ICalculate {
  weight: number;
  gender: 'male' | 'female';
  height: number;
  walkType: 'Slow walking' | 'Brisk walking' | 'Jogging' | 'Running';
}

interface StepTrackerState {
  steps: number;
  caloriesBurned: number;
  kilometers: number;
  walkSessions: number;
  avgStepsPerHour: number;
  spendMinutes: number;
  iGoalReached: boolean;
}

const ACTIVITY_CONFIG = {
  'Slow walking': {
    threshold: 10.5,
    stepLengthFactor: 0.35,
    met: 3.0,
  },
  'Brisk walking': {
    threshold: 11.5,
    stepLengthFactor: 0.45,
    met: 3.8,
  },
  Jogging: {
    threshold: 13.0,
    stepLengthFactor: 0.65,
    met: 7.0,
  },
  Running: {
    threshold: 15.0,
    stepLengthFactor: 0.75,
    met: 10.0,
  },
};

const WINDOW_SIZE = 10;

const useStepWriter = (
  activityType: ActivityDataType = 'Brisk walking',
  dailyGoal: number,
  calculate: ICalculate,
): StepTrackerState => {
  const [state, setState] = useState<StepTrackerState>({
    steps: 0,
    caloriesBurned: 0,
    kilometers: 0,
    walkSessions: 0,
    avgStepsPerHour: 0,
    spendMinutes: 0,
    iGoalReached: false,
  });
  const [newStepCount, setNewStepCount] = useState(0);
  const lastStepTimeRef = useRef<number>(0);
  const accelDataRef = useRef<number[]>([]);
  const {user} = useHook();
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const checkDevice = useCallback(async () => {
    const val = await isIOSVirtualDevice();
    return val;
  }, []);
  const calculateMetrics = useCallback(
    (steps: number): Partial<StepTrackerState> => {
      const {height, weight, walkType} = calculate;
      const {stepLengthFactor, met} = ACTIVITY_CONFIG[walkType];

      const stepLength = (height * stepLengthFactor) / 100;
      const kilometers = (steps * stepLength) / 1000;
      const caloriesBurned = ((met * 3.5 * weight) / 200) * (steps / 120);

      return {
        kilometers,
        caloriesBurned,
        avgStepsPerHour: steps / (state.spendMinutes / 60 || 1),
      };
    },
    [calculate, state.spendMinutes],
  );

  const syncWithDatabase = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));

    try {
      const payload: IGetStepsPayload = {
        userId: user._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      const response = await getStepsByDateRange(payload);
      if (response.success && response.data) {
        const stepsData = response.data[response.data.length - 1];
        setState(prev => ({
          ...prev,
          steps: stepsData?.steps || prev.steps,
          spendMinutes: stepsData?.spendMinutes || prev.spendMinutes,
          ...calculateMetrics(stepsData.steps || prev.steps),
        }));
      }
    } catch (error) {
      console.error('Error syncing data with Firebase:', error);
    }
  }, [user, calculateMetrics]);

  const saveDatabase = useCallback(async () => {
    if (!user?._id || newStepCount === 0) {
      return;
    }
    const checkIOSVirtualDevice = await checkDevice();
    if (checkIOSVirtualDevice) {
      return;
    }
    const {kilometers, caloriesBurned, avgStepsPerHour, spendMinutes} =
      calculateMetrics(newStepCount);

    const payload: ISteps = {
      steps: newStepCount,
      caloriesBurned: caloriesBurned || 0,
      kilometers: kilometers || 0,
      avgStepsPerHour: avgStepsPerHour || 0,
      spendMinutes: spendMinutes || 0,
      isGoalReached: false,
      user: user._id,
      date: new Date(),
      walkSessions: 0,
    };

    try {
      const response = await createOrUpdateSteps(payload);
      if (response.success) {
        setNewStepCount(0);
      }
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      Alert.alert(
        'Error',
        'Unable to save/update step data. Please try again.',
      );
    }
  }, [calculateMetrics, checkDevice, newStepCount, user]);

  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase]);

  useEffect(() => {
    if (dailyGoal > 0 && state.steps >= 0) {
      setState(prev => ({
        ...prev,
        iGoalReached: state.steps >= dailyGoal,
      }));
    }
  }, [dailyGoal, state.steps]);

  useEffect(() => {
    if (state.iGoalReached) {
      return;
    }

    checkDevice().then(isVirtual => {
      if (isVirtual) {
        return;
        // handle virtual device logic here if needed
      }
    });
    const subscription = accelerometer.subscribe(({x, y, z}) => {
      const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      accelDataRef.current = [...accelDataRef.current, magnitude].slice(
        -WINDOW_SIZE,
      );

      if (accelDataRef.current.length === WINDOW_SIZE) {
        const avgMagnitude =
          accelDataRef.current.reduce((sum, val) => sum + val, 0) / WINDOW_SIZE;
        const currentTime = Date.now();
        const {threshold} = ACTIVITY_CONFIG[activityType];

        if (
          avgMagnitude > threshold &&
          currentTime - lastStepTimeRef.current > 300
        ) {
          setNewStepCount(count => count + 1);
          setState(prev => {
            const newSteps = prev.steps + 1;
            return {
              ...prev,
              steps: newSteps,
              ...calculateMetrics(newSteps),
            };
          });
          lastStepTimeRef.current = currentTime;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [activityType, calculateMetrics, checkDevice, state.iGoalReached]);

  useEffect(() => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }

    saveDebounceRef.current = setTimeout(() => {
      saveDatabase();
    }, 2000);
  }, [newStepCount, saveDatabase]);

  return state;
};

export default useStepWriter;
