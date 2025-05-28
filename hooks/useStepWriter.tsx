import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {accelerometer} from 'react-native-sensors';
import {ActivityDataType} from '../lib/interfaces';

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
    stepLengthFactor: 0.35, // Step length factor relative to height
    met: 3.0, // Metabolic equivalent
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

const WINDOW_SIZE = 10; // Sliding window size for smoothing

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
  const sessionStartTimeRef = useRef<number | null>(null);
  const userCurrent = useMemo(() => auth().currentUser, []);

  const calculateMetrics = useCallback(
    (steps: number): Partial<StepTrackerState> => {
      const {height, weight, walkType} = calculate;
      const {stepLengthFactor, met} = ACTIVITY_CONFIG[walkType];

      const stepLength = (height * stepLengthFactor) / 100; // Convert cm to meters
      const kilometers = (steps * stepLength) / 1000; // Convert meters to kilometers
      const caloriesBurned = ((met * 3.5 * weight) / 200) * (steps / 120); // Based on walking duration at 2 steps/sec

      return {
        kilometers,
        caloriesBurned,
        avgStepsPerHour: steps / (state.spendMinutes / 60 || 1),
      };
    },
    [calculate, state.spendMinutes],
  );

  const syncWithFirebase = useCallback(async () => {
    if (!userCurrent) return;

    const docRef = firestore().collection('stepData').doc(userCurrent.uid);
    const todayKey = moment().format('YYYY-MM-DD');

    try {
      const docSnapshot = await docRef.get();
      const firebaseData = docSnapshot.exists()
        ? docSnapshot.data()?.dailySteps?.[todayKey] || {}
        : {};

      setState(prev => ({
        ...prev,
        steps: firebaseData.step || prev.steps,
        spendMinutes: firebaseData.minutes || prev.spendMinutes,
        ...calculateMetrics(firebaseData.step || prev.steps),
      }));
    } catch (error) {
      console.error('Error syncing data with Firebase:', error);
    }
  }, [userCurrent, calculateMetrics]);

  const saveToFirestore = useCallback(async () => {
    if (!userCurrent) return;

    const docRef = firestore().collection('stepData').doc(userCurrent.uid);
    const todayKey = moment().format('YYYY-MM-DD');

    try {
      await docRef.set(
        {
          dailySteps: {
            [todayKey]: {
              step: state.steps,
              caloriesBurn: state.caloriesBurned,
              kilometers: state.kilometers,
              minutes: state.spendMinutes,
              walkSessions: state.walkSessions,
              userId: userCurrent.uid,
              date: new Date().toISOString(),
            },
          },
          totalSteps: firestore.FieldValue.increment(newStepCount),
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );
      setNewStepCount(0);
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      Alert.alert(
        'Error',
        'Unable to save/update step data. Please try again.',
      );
    }
  }, [
    newStepCount,
    state.caloriesBurned,
    state.kilometers,
    state.spendMinutes,
    state.steps,
    state.walkSessions,
    userCurrent,
  ]);

  useEffect(() => {
    syncWithFirebase();
  }, [syncWithFirebase]);

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

    sessionStartTimeRef.current = Date.now();
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
          setNewStepCount(1);
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
  }, [activityType, calculateMetrics, state.iGoalReached]);

  useEffect(() => {
    saveToFirestore();
  }, [saveToFirestore, state.steps]);

  return state;
};

export default useStepWriter;
