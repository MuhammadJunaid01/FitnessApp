import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {accelerometer} from 'react-native-sensors';
import {ActivityDataType, ISteps} from '../lib/interfaces';
import {isIOSVirtualDevice} from '../lib/utils';
import {createOrUpdateSteps, getTodaysSteps} from '../lib/utils/apis';
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
  spendSeconds: number; // Changed to seconds
  isGoalReached: boolean;
  minutesPerStep: number;
}

const ACTIVITY_CONFIG = {
  'Slow walking': {
    threshold: 10.5,
    stepLengthFactor: 0.35,
    met: 3.0,
    stepsPerMinute: 100,
  },
  /* ... rest of ACTIVITY_CONFIG unchanged ... */
};

const WINDOW_SIZE = 10;
const STEP_COOLDOWN_MS = 300;
const SAVE_DEBOUNCE_MS = 2000;
const MIN_SESSION_DURATION_MS = 60000;

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
    spendSeconds: 0, // Changed to seconds
    isGoalReached: false,
    minutesPerStep: 0,
  });

  const [newStepCount, setNewStepCount] = useState(0);
  const lastStepTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const accelDataRef = useRef<number[]>([]);
  const totalActiveTimeRef = useRef<number>(0); // In milliseconds
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const {user} = useHook();
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const stepsToGoalRef = useRef<number>(dailyGoal);

  const checkDevice = useCallback(async () => {
    return await isIOSVirtualDevice();
  }, []);

  const calculateMetrics = useCallback(
    (steps: number, activeSeconds: number): Partial<StepTrackerState> => {
      const {height, weight, walkType} = calculate;
      const {stepLengthFactor, met, stepsPerMinute} = ACTIVITY_CONFIG[walkType];

      const stepLength = (height * stepLengthFactor) / 100;
      const kilometers = (steps * stepLength) / 1000;
      const caloriesBurned = ((met * 3.5 * weight) / 200) * (steps / 120);
      const avgStepsPerHour =
        activeSeconds > 0 ? (steps / activeSeconds) * 3600 : 0; // Adjusted for seconds
      const minutesPerStep = steps > 0 ? activeSeconds / (steps * 60) : 0;
      const remainingSteps = Math.max(0, dailyGoal - steps);
      const minutesToGoal = remainingSteps / stepsPerMinute;

      return {
        kilometers,
        caloriesBurned,
        avgStepsPerHour,
        minutesPerStep,
        spendSeconds: Math.round(activeSeconds),
        isGoalReached: steps >= dailyGoal,
      };
    },
    [calculate, dailyGoal],
  );

  const syncWithDatabase = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    try {
      const response = await getTodaysSteps(user._id);
      if (response.success && response?.data) {
        const stepsData = response.data;
        const activeSeconds = stepsData?.spendSeconds || 0; // Changed to seconds

        setState(prev => ({
          ...prev,
          steps: stepsData?.steps || prev.steps,
          spendSeconds: activeSeconds,
          walkSessions: stepsData?.walkSessions || prev.walkSessions,
          ...calculateMetrics(stepsData?.steps || prev.steps, activeSeconds),
        }));

        totalActiveTimeRef.current = activeSeconds * 1000; // Convert to milliseconds
        stepsToGoalRef.current = Math.max(
          0,
          dailyGoal - (stepsData?.steps || 0),
        );
      }
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }, [user, calculateMetrics, dailyGoal]);

  const saveDatabase = useCallback(async () => {
    if (!user?._id || newStepCount === 0) {
      return;
    }

    const isVirtual = await checkDevice();
    if (isVirtual) {
      return;
    }

    const currentTime = Date.now();
    let sessionDuration = 0;

    if (sessionStartTimeRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sessionDuration = Math.round(
        (currentTime - sessionStartTimeRef.current) / 1000, // Changed to seconds
      );
    }

    const totalActiveSeconds = Math.round(totalActiveTimeRef.current / 1000); // Convert to seconds
    const metrics = calculateMetrics(state.steps, totalActiveSeconds);

    const payload: ISteps = {
      steps: newStepCount,
      caloriesBurned: metrics.caloriesBurned || 0,
      kilometers: metrics.kilometers || 0,
      avgStepsPerHour: metrics.avgStepsPerHour || 0,
      spendMinutes: totalActiveSeconds, // Changed to seconds
      isGoalReached: metrics.isGoalReached || false,
      user: user._id,
      date: new Date(),
      walkSessions: state.walkSessions,
    };

    try {
      const response = await createOrUpdateSteps(payload);
      if (response.success) {
        setNewStepCount(0);
        totalActiveTimeRef.current = 0; // Clear timer after save
        sessionStartTimeRef.current = null;
      }
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Unable to save step data. Please try again.');
    }
  }, [
    user,
    newStepCount,
    checkDevice,
    state.steps,
    state.walkSessions,
    calculateMetrics,
  ]);

  const updateActiveTime = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    if (sessionStartTimeRef.current) {
      totalActiveTimeRef.current += timeSinceLastUpdate;
      const totalActiveSeconds = totalActiveTimeRef.current / 1000;

      setState(prev => ({
        ...prev,
        spendSeconds: Math.round(totalActiveSeconds),
        ...calculateMetrics(prev.steps, totalActiveSeconds),
      }));
    }

    lastUpdateTimeRef.current = now;
  }, [calculateMetrics]);

  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase]);

  useEffect(() => {
    if (dailyGoal > 0) {
      setState(prev => ({
        ...prev,
        ...calculateMetrics(prev.steps, prev.spendSeconds),
      }));
      stepsToGoalRef.current = Math.max(0, dailyGoal - state.steps);
    }
  }, [dailyGoal, state.steps, calculateMetrics]);

  useEffect(() => {
    if (state.isGoalReached) return;

    checkDevice().then(isVirtual => {
      if (isVirtual) return;
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
          currentTime - lastStepTimeRef.current > STEP_COOLDOWN_MS
        ) {
          if (!sessionStartTimeRef.current) {
            sessionStartTimeRef.current = currentTime;
            setState(prev => ({...prev, walkSessions: prev.walkSessions + 1}));
          }

          updateActiveTime();

          setNewStepCount(prev => prev + 1);
          setState(prev => {
            const newSteps = Math.min(prev.steps + 1, dailyGoal);
            const metrics = calculateMetrics(
              newSteps,
              totalActiveTimeRef.current / 1000, // Convert to seconds
            );
            return {
              ...prev,
              steps: newSteps,
              ...metrics,
            };
          });

          lastStepTimeRef.current = currentTime;
        }
      }
    });

    const activeTimeInterval = setInterval(updateActiveTime, 10000);

    return () => {
      subscription.unsubscribe();
      clearInterval(activeTimeInterval);
    };
  }, [
    activityType,
    calculateMetrics,
    checkDevice,
    state.isGoalReached,
    updateActiveTime,
    dailyGoal,
  ]);

  useEffect(() => {
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);

    saveDebounceRef.current = setTimeout(() => {
      saveDatabase();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [newStepCount, saveDatabase]);

  return state;
};

export default useStepWriter;
