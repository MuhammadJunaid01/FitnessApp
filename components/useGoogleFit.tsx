import moment from 'moment';
import {useCallback, useEffect, useState} from 'react';
import {Alert, Linking, Platform} from 'react-native';

import GoogleFit, {
  BucketUnit,
  Scopes,
  WeightData,
} from 'react-native-google-fit';
import AppleHealthKit, {
  HealthInputOptions,
  HealthUnit,
} from 'react-native-health';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import {Calorie} from './WeeklyCalories';

interface StepDetail {
  dateTime: string;
  value: number;
}

interface HeartRateDetail {
  dateTime: string;
  bpm: number;
}

interface UseHealthDataReturn {
  isAuthorized: boolean;
  dailySteps: StepDetail[] | null;
  dailyHeartRate: HeartRateDetail[] | null;
  weeklySteps: StepDetail[] | null;
  loading: boolean;
  error: string | null;
  calculateWalkMetrics: (
    weight: number,
    gender: 'male' | 'female',
    height: number,
    walkType: 'Slow walking' | 'Brisk walking' | 'Jogging' | 'Running',
  ) => {
    caloriesBurned: number;
    kilometers: number;
    walkSessions: number;
    avgStepsPerHour: number;
  };
  requestPermission: () => Promise<void>;
  activities: any[];
  saveWeight: (weight: number) => Promise<void>;
  weeklyCaloriesBurn: Calorie[] | null;
  weeklyStartAndEndDate: {
    start: string;
    end: string;
  };
}

// Function to show alert and offer open settings button if permission denied
const showPermissionDeniedAlert = () => {
  Alert.alert(
    'Permission Required',
    'This app needs Activity Recognition permission to function properly. Please enable it in Settings.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:').catch(() => openSettings());
          } else {
            openSettings();
          }
        },
      },
    ],
    {cancelable: true},
  );
};

// Request Android Activity Recognition permission
const requestActivityRecognitionPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const permission = PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION;
    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      if (requestResult === RESULTS.GRANTED) {
        return true;
      }
      if (requestResult === RESULTS.BLOCKED) {
        return false;
      }
    }

    if (result === RESULTS.BLOCKED) {
      return false;
    }
  }
  // For iOS, request Motion & Fitness permission
  if (Platform.OS === 'ios') {
    const permission = PERMISSIONS.IOS.MOTION;
    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      if (requestResult === RESULTS.GRANTED) {
        return true;
      }
      if (requestResult === RESULTS.BLOCKED) {
        return false;
      }
    }

    if (result === RESULTS.BLOCKED) {
      return false;
    }
  }
  return true;
};

// Request authorization for Apple HealthKit on iOS
const authorizeAppleHealthKit = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return true;

  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.StepCount,
        AppleHealthKit.Constants.Permissions.HeartRate,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        AppleHealthKit.Constants.Permissions.Workout,
        AppleHealthKit.Constants.Permissions.Weight,
      ],
      write: [AppleHealthKit.Constants.Permissions.Weight],
    },
  };

  return new Promise(resolve => {
    AppleHealthKit.initHealthKit(permissions, err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const useHealthData = (): UseHealthDataReturn => {
  const [weeklyCaloriesBurn, setWeeklyCaloriesBurn] = useState<
    Calorie[] | null
  >(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dailySteps, setDailySteps] = useState<StepDetail[] | null>(null);
  const [dailyHeartRate, setDailyHeartRate] = useState<
    HeartRateDetail[] | null
  >(null);
  const [weeklySteps, setWeeklySteps] = useState<StepDetail[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppleHealthData = useCallback(
    async (startDate: string, endDate: string, type: string) => {
      if (Platform.OS !== 'ios') return [];

      const options: HealthInputOptions = {
        startDate,
        endDate,
        type,
        limit: 1000,
      };

      return new Promise<any[]>(resolve => {
        AppleHealthKit.getSamples(options, (err, results) => {
          if (err) {
            setError(`Failed to fetch ${type} data`);
            resolve([]);
          } else {
            if (type === AppleHealthKit.Constants.Permissions.StepCount) {
              resolve(
                results.map((item: any) => ({
                  dateTime: item.startDate,
                  value: item.quantity,
                })),
              );
            } else if (
              type === AppleHealthKit.Constants.Permissions.HeartRate
            ) {
              resolve(
                results.map((item: any) => ({
                  dateTime: item.startDate,
                  bpm: item.quantity,
                })),
              );
            } else if (type === AppleHealthKit.Constants.Permissions.Workout) {
              resolve(
                results.map((item: any) => ({
                  activityName: item.activityName,
                  startDate: item.startDate,
                  endDate: item.endDate,
                  duration: item.duration,
                  calories: item.totalEnergyBurned,
                  distance: item.totalDistance,
                })),
              );
            } else if (
              type === AppleHealthKit.Constants.Permissions.ActiveEnergyBurned
            ) {
              resolve(
                results.map((item: any) => ({
                  date: item.startDate,
                  value: item.quantity,
                })),
              );
            } else if (
              type ===
              AppleHealthKit.Constants.Permissions.DistanceWalkingRunning
            ) {
              resolve(
                results.map((item: any) => ({
                  dateTime: item.startDate,
                  value: item.quantity,
                })),
              );
            } else {
              resolve([]);
            }
          }
        });
      });
    },
    [],
  );

  const weeklyStartAndEndDate = {
    start: moment().startOf('week').toISOString(),
    end: moment().endOf('week').toISOString(),
  };

  const fetchGoogleFitData = useCallback(
    async (
      startDate: string,
      endDate: string,
      bucketUnit: BucketUnit,
      dataType: 'steps' | 'heartRate',
    ) => {
      if (Platform.OS === 'ios') return [];

      const options = {startDate, endDate, bucketUnit, bucketInterval: 1};

      try {
        setLoading(true);
        if (dataType === 'steps') {
          const data = await GoogleFit.getDailyStepCountSamples(options);
          const source = data.find(
            item => item.source === 'com.google.android.gms:merge_step_deltas',
          );
          return (
            source?.steps.map(step => ({
              dateTime: step.date,
              value: step.value,
            })) || []
          );
        }
        if (dataType === 'heartRate') {
          const heartRateData = await GoogleFit.getHeartRateSamples(options);
          return heartRateData.map(hr => ({
            dateTime: hr.startDate,
            bpm: hr.value,
          }));
        }
      } catch (err) {
        setError(`Failed to fetch ${dataType} data`);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchDailySteps = useCallback(async () => {
    const startDate = moment().startOf('day').toISOString();
    const endDate = moment().endOf('day').toISOString();

    const steps =
      Platform.OS === 'ios'
        ? await fetchAppleHealthData(
            startDate,
            endDate,
            AppleHealthKit.Constants.Permissions.StepCount,
          )
        : await fetchGoogleFitData(
            startDate,
            endDate,
            BucketUnit.HOUR,
            'steps',
          );

    setDailySteps(steps);
  }, [fetchAppleHealthData, fetchGoogleFitData]);

  const fetchDailyHeartRate = useCallback(async () => {
    const startDate = moment().startOf('day').toISOString();
    const endDate = moment().endOf('day').toISOString();

    const heartRate =
      Platform.OS === 'ios'
        ? await fetchAppleHealthData(
            startDate,
            endDate,
            AppleHealthKit.Constants.Permissions.HeartRate,
          )
        : await fetchGoogleFitData(
            startDate,
            endDate,
            BucketUnit.HOUR,
            'heartRate',
          );

    setDailyHeartRate(heartRate);
  }, [fetchAppleHealthData, fetchGoogleFitData]);

  const fetchWeeklySteps = useCallback(async () => {
    const startDate = moment().startOf('week').toISOString();
    const endDate = moment().endOf('week').toISOString();

    if (Platform.OS === 'ios') {
      const steps = await fetchAppleHealthData(
        startDate,
        endDate,
        AppleHealthKit.Constants.Permissions.StepCount,
      );
      setWeeklySteps(steps);
    } else {
      try {
        setLoading(true);
        const options = {
          startDate,
          endDate,
          bucketUnit: BucketUnit.DAY,
          bucketInterval: 1,
        };
        const data = await GoogleFit.getDailyStepCountSamples(options);
        const source = data.find(
          item => item.source === 'com.google.android.gms:merge_step_deltas',
        );
        setWeeklySteps(
          source?.steps.map(step => ({
            dateTime: step.date,
            value: step.value,
          })) || [],
        );
      } catch (err) {
        setError('Failed to fetch weekly steps data');
      } finally {
        setLoading(false);
      }
    }
  }, [fetchAppleHealthData]);

  const getActivitySamples = useCallback(async () => {
    if (!isAuthorized) {
      throw new Error('Not authorized');
    }
    const startDate = moment().startOf('week').toISOString();
    const endDate = moment().endOf('week').toISOString();

    if (Platform.OS === 'ios') {
      try {
        setLoading(true);
        const activities = await fetchAppleHealthData(
          startDate,
          endDate,
          AppleHealthKit.Constants.Permissions.Workout,
        );
        setActivities(activities);
      } catch (err) {
        setError('Failed to fetch activity data');
      } finally {
        setLoading(false);
      }
    } else {
      const options = {
        startDate,
        endDate,
        bucketUnit: BucketUnit.HOUR,
        bucketInterval: 1,
      };
      try {
        const data = await GoogleFit.getActivitySamples(options);
        setActivities(data);
      } catch (err: any) {}
    }
  }, [isAuthorized, fetchAppleHealthData]);

  const getMoveMinutes = useCallback(async () => {
    if (!isAuthorized) {
      throw new Error('Not authorized');
    }
    const startDate = moment().startOf('week').toISOString();
    const endDate = moment().endOf('week').toISOString();

    if (Platform.OS === 'ios') {
      // Apple HealthKit does not support Move Minutes directly.
      // You may implement an alternative or skip this feature for iOS.
    } else {
      const options = {
        startDate,
        endDate,
        bucketUnit: BucketUnit.HOUR,
        bucketInterval: 1,
      };
      try {
        const data = await GoogleFit.getMoveMinutes(options);
      } catch (err: any) {}
    }
  }, [isAuthorized]);

  const getDailyCalorieSamples = useCallback(async () => {
    if (!isAuthorized) {
      throw new Error('Not authorized');
    }
    const startDate = moment().startOf('week').toISOString();
    const endDate = moment().endOf('week').toISOString();

    if (Platform.OS === 'ios') {
      try {
        setLoading(true);
        const calories = await fetchAppleHealthData(
          startDate,
          endDate,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        );
        setWeeklyCaloriesBurn(calories as Calorie[]);
      } catch (err) {
        setError('Failed to fetch calorie data');
      } finally {
        setLoading(false);
      }
    } else {
      const options = {
        startDate,
        endDate,
        bucketUnit: BucketUnit.HOUR,
        bucketInterval: 1,
      };
      try {
        const data = await GoogleFit.getDailyCalorieSamples(options);
        setWeeklyCaloriesBurn(data);
      } catch (err: any) {}
    }
  }, [isAuthorized, fetchAppleHealthData]);

  const getDailyDistanceSamples = useCallback(async () => {
    if (!isAuthorized) {
      throw new Error('Not authorized');
    }
    const startDate = moment().startOf('week').toISOString();
    const endDate = moment().endOf('week').toISOString();

    if (Platform.OS === 'ios') {
      try {
        setLoading(true);
        const distances = await fetchAppleHealthData(
          startDate,
          endDate,
          AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        );
      } catch (err) {
        console.error('Apple HealthKit distance fetch error:', err);
        setError('Failed to fetch distance data');
      } finally {
        setLoading(false);
      }
    } else {
      const options = {
        startDate,
        endDate,
        bucketUnit: BucketUnit.HOUR,
        bucketInterval: 1,
      };
      try {
        const data = await GoogleFit.getDailyDistanceSamples(options);
        console.log('Weekly distance samples:', data);
      } catch (err: any) {
        console.error('Error fetching daily distance samples:', err);
      }
    }
  }, [isAuthorized, fetchAppleHealthData]);

  useEffect(() => {
    if (isAuthorized) {
      fetchDailySteps();
      fetchDailyHeartRate();
      fetchWeeklySteps();
      getActivitySamples();
      getMoveMinutes();
      getDailyCalorieSamples();
      getDailyDistanceSamples();
    }
  }, [
    isAuthorized,
    fetchDailySteps,
    fetchDailyHeartRate,
    fetchWeeklySteps,
    getActivitySamples,
    getMoveMinutes,
    getDailyCalorieSamples,
    getDailyDistanceSamples,
  ]);

  const calculateWalkMetrics = (
    weight: number,
    gender: 'male' | 'female',
    height: number,
    walkType: 'Slow walking' | 'Brisk walking' | 'Jogging' | 'Running',
  ) => {
    const MET_VALUES: Record<string, number> = {
      'Slow walking': 2.8,
      'Brisk walking': 3.8,
      Jogging: 7.0,
      Running: 10.0,
    };

    const avgStrideLength = gender === 'male' ? height * 0.415 : height * 0.413;
    const totalSteps =
      dailySteps?.reduce((acc, cur) => acc + cur.value, 0) || 0;
    const kilometers = (totalSteps * avgStrideLength) / 100000; // converting cm to km
    const caloriesBurned =
      (MET_VALUES[walkType] * 3.5 * weight * kilometers) / 200;
    const walkSessions = dailySteps?.length || 0;
    const avgStepsPerHour = totalSteps / 24;

    return {caloriesBurned, kilometers, walkSessions, avgStepsPerHour};
  };

  const requestPermission = useCallback(async () => {
    setError(null);

    const hasPermission = await requestActivityRecognitionPermission();
    if (!hasPermission) {
      showPermissionDeniedAlert();
      setError('Activity Recognition permission denied');
      return;
    }

    const authorized =
      Platform.OS === 'ios'
        ? await authorizeAppleHealthKit()
        : await GoogleFit.authorize({
            scopes: [Scopes.FITNESS_ACTIVITY_READ, Scopes.FITNESS_BODY_READ],
          });

    if (authorized) {
      setIsAuthorized(true);
      fetchDailySteps();
      fetchDailyHeartRate();
      fetchWeeklySteps();
      getActivitySamples();
      getMoveMinutes();
      getDailyCalorieSamples();
      getDailyDistanceSamples();
    } else {
      Alert.alert(
        'Authorization Failed',
        'Authorization to access health data was denied.',
      );
      setError('Authorization denied');
      setIsAuthorized(false);
    }
  }, [
    fetchDailySteps,
    fetchDailyHeartRate,
    fetchWeeklySteps,
    getActivitySamples,
    getMoveMinutes,
    getDailyCalorieSamples,
    getDailyDistanceSamples,
  ]);

  const saveWeight = useCallback(
    async (weight: number) => {
      if (!isAuthorized) {
        throw new Error('Not authorized');
      }

      const date = moment().toISOString();

      if (Platform.OS === 'ios') {
        const options = {
          value: weight,
          unit: HealthUnit.pound,
          date,
        };
        try {
          await new Promise<void>((resolve, reject) => {
            AppleHealthKit.saveWeight(options, (err: any, result: any) => {
              if (err) {
                reject(new Error('Failed to save weight'));
              } else {
                resolve();
              }
            });
          });
        } catch (err) {
          console.error('Apple HealthKit save weight error:', err);
          throw err;
        }
      } else {
        const options: WeightData = {
          date,
          unit: 'pound',
          value: weight,
        };
        try {
          await new Promise<void>((resolve, reject) => {
            GoogleFit.saveWeight(options, (isError: boolean, result: true) => {
              if (isError) {
                reject(new Error('Failed to save weight'));
              } else {
                resolve();
              }
            });
          });
        } catch (err: any) {
          console.error('Error saving weight:', err);
        }
      }
    },
    [isAuthorized],
  );

  return {
    isAuthorized,
    dailySteps,
    dailyHeartRate,
    weeklySteps,
    loading,
    error,
    calculateWalkMetrics,
    requestPermission,
    activities,
    saveWeight,
    weeklyCaloriesBurn,
    weeklyStartAndEndDate,
  };
};

export default useHealthData;
