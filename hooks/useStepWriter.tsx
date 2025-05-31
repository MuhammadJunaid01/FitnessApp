/* eslint-disable @typescript-eslint/no-unused-vars */
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
  spendMinutes: number;
  isGoalReached: boolean;
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
const STEP_COOLDOWN_MS = 300; // Minimum time between steps
const SAVE_DEBOUNCE_MS = 2000; // Debounce time for saving to database
const MIN_SESSION_DURATION_MS = 60000; // 1 minute minimum for a session

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
    isGoalReached: false,
  });

  const [newStepCount, setNewStepCount] = useState(0);
  const lastStepTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const accelDataRef = useRef<number[]>([]);
  const totalActiveTimeRef = useRef<number>(0); // Track total active time in ms
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const {user} = useHook();
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const checkDevice = useCallback(async () => {
    const val = await isIOSVirtualDevice();
    return val;
  }, []);

  const calculateMetrics = useCallback(
    (steps: number, activeMinutes: number): Partial<StepTrackerState> => {
      const {height, weight, walkType} = calculate;
      const {stepLengthFactor, met} = ACTIVITY_CONFIG[walkType];

      const stepLength = (height * stepLengthFactor) / 100;
      const kilometers = (steps * stepLength) / 1000;
      const caloriesBurned = ((met * 3.5 * weight) / 200) * (steps / 120);
      const avgStepsPerHour =
        activeMinutes > 0 ? (steps / activeMinutes) * 60 : 0;

      return {
        kilometers,
        caloriesBurned,
        avgStepsPerHour,
      };
    },
    [calculate],
  );

  const syncWithDatabase = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    try {
      const response = await getTodaysSteps(user._id);
      if (response.success && response?.data) {
        const stepsData = response.data;
        const activeMinutes = stepsData?.spendMinutes || 0;

        setState(prev => ({
          ...prev,
          steps: stepsData?.steps || prev.steps,
          spendMinutes: activeMinutes,
          walkSessions: stepsData?.walkSessions || prev.walkSessions,
          isGoalReached: stepsData?.isGoalReached || prev.isGoalReached,
          ...calculateMetrics(stepsData?.steps || prev.steps, activeMinutes),
        }));

        // Initialize total active time
        totalActiveTimeRef.current = activeMinutes * 60000;
      }
    } catch (error) {
      console.error('Error syncing data with database:', error);
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

    // Calculate session duration if a session is active
    const currentTime = Date.now();
    let sessionDuration = 0;

    if (sessionStartTimeRef.current) {
      sessionDuration = Math.max(
        Math.round((currentTime - sessionStartTimeRef.current) / 60000),
        1, // Minimum 1 minute for any session
      );
    }

    const totalActiveMinutes = Math.round(totalActiveTimeRef.current / 60000);
    const {kilometers, caloriesBurned, avgStepsPerHour} = calculateMetrics(
      state.steps,
      totalActiveMinutes,
    );

    const payload: ISteps = {
      steps: state.steps,
      caloriesBurned: caloriesBurned || 0,
      kilometers: kilometers || 0,
      avgStepsPerHour: avgStepsPerHour || 0,
      spendMinutes: totalActiveMinutes,
      isGoalReached: state.isGoalReached,
      user: user._id,
      date: new Date(),
      walkSessions: state.walkSessions,
    };

    try {
      const response = await createOrUpdateSteps(payload);
      if (response.success) {
        setNewStepCount(0);
        sessionStartTimeRef.current = null;
      }
    } catch (error) {
      console.error('Error saving data to database:', error);
      Alert.alert(
        'Error',
        'Unable to save/update step data. Please try again.',
      );
    }
  }, [
    calculateMetrics,
    checkDevice,
    newStepCount,
    user,
    state.steps,
    state.isGoalReached,
    state.walkSessions,
  ]);

  // Update active time when steps are being taken
  const updateActiveTime = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    // Only count time if we're in an active session
    if (sessionStartTimeRef.current) {
      totalActiveTimeRef.current += timeSinceLastUpdate;

      setState(prev => ({
        ...prev,
        spendMinutes: Math.round(totalActiveTimeRef.current / 60000),
        ...calculateMetrics(prev.steps, totalActiveTimeRef.current / 60000),
      }));
    }

    lastUpdateTimeRef.current = now;
  }, [calculateMetrics]);

  // Initial sync with database
  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase]);

  // Check goal achievement
  useEffect(() => {
    if (dailyGoal > 0) {
      setState(prev => ({
        ...prev,
        isGoalReached: prev.steps >= dailyGoal,
      }));
    }
  }, [dailyGoal, state.steps]);

  // Step detection logic
  useEffect(() => {
    if (state.isGoalReached) {
      return;
    }

    checkDevice().then(isVirtual => {
      if (isVirtual) {
        return;
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
          currentTime - lastStepTimeRef.current > STEP_COOLDOWN_MS
        ) {
          // Start a new session if one isn't active
          if (!sessionStartTimeRef.current) {
            sessionStartTimeRef.current = currentTime;
            setState(prev => ({
              ...prev,
              walkSessions: prev.walkSessions + 1,
            }));
          }

          updateActiveTime();

          setNewStepCount(prev => prev + 1);
          setState(prev => {
            const newSteps = prev.steps + 1;
            return {
              ...prev,
              steps: newSteps,
              ...calculateMetrics(newSteps, totalActiveTimeRef.current / 60000),
            };
          });

          lastStepTimeRef.current = currentTime;
        }
      }
    });

    // Set up interval to update active time even when no steps are detected
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
  ]);

  // Debounced save to database
  useEffect(() => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }

    saveDebounceRef.current = setTimeout(() => {
      saveDatabase();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
    };
  }, [newStepCount, saveDatabase]);

  return state;
};

export default useStepWriter;
