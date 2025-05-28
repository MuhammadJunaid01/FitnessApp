import moment from 'moment';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Platform} from 'react-native';

import {
  aggregateRecord,
  initialize,
  insertRecords,
  readRecords,
  requestPermission,
  StepsRecord,
} from 'react-native-health-connect';
const useHealthConnectSteps = () => {
  const [steps, setSteps] = useState(0);

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recordsData, setRecordsData] = useState<any>(null);
  // Initialize Health Connect
  const initHealthConnect = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setError('Health Connect is only available on Android');
      return false;
    }

    try {
      const initialized = await initialize();
      setIsInitialized(initialized);
      if (!initialized) {
        setError('Failed to initialize Health Connect');
      }
      return initialized;
    } catch (err: any) {
      setError('Error initializing Health Connect: ' + err.message);
      return false;
    }
  }, []);
  const dailyStartAndEndDate = useMemo(() => {
    return {
      start: moment().startOf('day').toISOString(),
      end: moment().endOf('day').toISOString(),
    };
  }, []);
  // Request read/write permissions for steps
  const requestStepPermissions = useCallback(async () => {
    try {
      const grantedPermissions = await requestPermission([
        {accessType: 'read', recordType: 'Steps'},
        {accessType: 'write', recordType: 'Steps'},
      ]);
      const hasRead = grantedPermissions.some(
        perm => perm.recordType === 'Steps' && perm.accessType === 'read',
      );
      const hasWrite = grantedPermissions.some(
        perm => perm.recordType === 'Steps' && perm.accessType === 'write',
      );
      if (!hasRead || !hasWrite) {
        setError('Required step permissions not granted');
        return false;
      }
      return true;
    } catch (err: any) {
      setError('Error requesting permissions: ' + err.message);
      return false;
    }
  }, []);

  // Save step data
  const saveSteps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isInitialized) {
        const initSuccess = await initHealthConnect();
        if (!initSuccess) {
          setIsLoading(false);
          return null;
        }
      }

      const hasPermission = await requestStepPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const currentDateTime = new Date();
      const startTime = new Date(currentDateTime.getTime() - 60 * 60 * 1000); // 1 hour ago
      const endTime = currentDateTime;

      const stepRecord: StepsRecord[] = [
        {
          count: 100,
          startTime: startTime.toISOString(), // ISO 8601 string
          endTime: endTime.toISOString(), // ISO 8601 string
          metadata: {
            dataOrigin: 'com.fitnessapp', // Replace with your app’s package name
          },
          recordType: 'Steps',
        },
      ];

      const result = await insertRecords(stepRecord);
      setIsLoading(false);
      return result; // Array of record IDs
    } catch (err: any) {
      Alert.alert('ERROR:', JSON.stringify(err));
      setError('Error saving steps: ' + err.message);
      setIsLoading(false);
      console.log('error  save step data', err);
      return null;
    }
  }, [isInitialized, initHealthConnect, requestStepPermissions]);

  // Retrieve step data (individual records or aggregated)
  const getSteps = useCallback(
    async (startTime: any, endTime: any, aggregate = false) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isInitialized) {
          const initSuccess = await initHealthConnect();
          if (!initSuccess) {
            setIsLoading(false);
            return null;
          }
        }

        const hasPermission = await requestStepPermissions();
        if (!hasPermission) {
          setIsLoading(false);
          return null;
        }

        if (aggregate) {
          // Fetch aggregated step count
          const result = await aggregateRecord({
            recordType: 'Steps',
            timeRangeFilter: {
              operator: 'between',
              startTime,
              endTime,
            },
          });
          setIsLoading(false);
          setRecordsData(result);
        } else {
          // Fetch individual step records
          const records = await readRecords('Steps', {
            timeRangeFilter: {
              operator: 'between',
              startTime,
              endTime,
            },
          });
          setIsLoading(false);
          setRecordsData(records);
        }
      } catch (err: any) {
        setError('Error retrieving steps: ' + err.message);
        setIsLoading(false);
        return null;
      }
    },
    [isInitialized, initHealthConnect, requestStepPermissions],
  );
  console.log('records', recordsData);
  // Configuration

  useEffect(() => {
    initHealthConnect();
    getSteps(dailyStartAndEndDate.start, dailyStartAndEndDate.end);
  }, [getSteps, initHealthConnect, dailyStartAndEndDate]);
  return {
    isInitialized,
    isLoading,
    error,
    initHealthConnect,
    requestStepPermissions,
    saveSteps,
    getSteps,
  };
};

export default useHealthConnectSteps;
