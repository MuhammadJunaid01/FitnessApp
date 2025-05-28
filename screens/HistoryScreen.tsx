/* eslint-disable no-catch-shadow */
/* eslint-disable react-native/no-inline-styles */
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {ActivityIndicator, StatusBar, StyleSheet, View} from 'react-native';
import PagerView from 'react-native-pager-view';
import DailyStepsChart from '../components/DailyStepsChart';
import SelectableTabs from '../components/SelectableTabs';
import WeeklyStepsChart from '../components/WeeklyStepsChart';
import {ThemeContext} from '../hooks/ThemeContext';
import {IStepData} from '../lib/interfaces';
import {
  getStepDataByUserIdAndDateRange,
  getTodaySteps,
  getWeeklySteps,
} from '../lib/utils/db';

const HistoryScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stepData, setStepData] = useState<IStepData[] | null>(null);
  const [todayStepData, setTodayStepData] = useState<any>(null);
  const [weeklyStepData, setWeeklyStepData] = useState<any>(null);
  const tabs = ['Day', 'Week'];
  // console.log('todayStepData', todayStepData);
  // console.log('weeklyStepData', weeklyStepData);
  const [goals, setGoals] = useState({
    dailyGoal: 0,
    weeklyGoal: 0,
  });
  const [isShowStepsData, setIsShowStepsData] = useState(true);
  // const [isShowCaloriesData, setIsShowCaloriesData] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(1);
  const pagerRef = useRef<PagerView>(null);
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }
  const userId = auth().currentUser?.uid;
  const fetchGoals = useCallback(async () => {
    if (!userId) {
      return;
    }
    const goalsCollection = firestore().collection('goals');
    const querySnapshot = await goalsCollection

      .where('userId', '==', userId) // Replace with actual user ID
      .get();

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      setGoals({
        dailyGoal: data.dailyGoal || 0,
        weeklyGoal: data.weeklyGoal || 0,
      });
    }
  }, [userId]);
  const {isDark} = themeContext;
  // const {
  //   dailySteps,
  //   requestPermission,
  //   error,
  //   weeklySteps,
  //   activities,
  //   weeklyCaloriesBurn,
  //   weeklyStartAndEndDate,
  // } = useHealthData();
  // console.log('error', error);

  // console.log('dailySteps', dailySteps);
  // console.log('weeklyStepsffff', weeklySteps);
  // console.log('activities', activities);
  // const formattedDateRange = useMemo<string>(() => {
  //   return formatDateRange(
  //     weeklyStartAndEndDate.start,
  //     weeklyStartAndEndDate.end,
  //   );
  // }, [weeklyStartAndEndDate]);
  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    pagerRef.current?.setPage(index);
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor(isDark ? '#0a1a3a' : '#FFFFFF');
      return () => {
        StatusBar.setBarStyle('default');
        StatusBar.setBackgroundColor('#FFFFFF');
      };
    }, [fetchGoals, isDark]),
  );
  useEffect(() => {
    const fetchStepData = async () => {
      try {
        setIsLoading(true);
        if (!userId) {
          return;
        }
        const weeklyStep = await getWeeklySteps(userId);
        const todayStep = await getTodaySteps(userId);
        setTodayStepData(todayStep);
        setWeeklyStepData(weeklyStep);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchStepData();
  }, [userId]);
  // useEffect(() => {
  //   requestPermission();
  // }, [requestPermission]);
  // const stepsData = transformData(weeklySteps || []);

  // const totalSteps = weeklyStepData?.reduce(
  //   (sum: any, day: {step: any}) => sum + day.step,
  //   0,
  // );
  const dateRange = useMemo(
    () => ({
      start: moment().startOf('week').toISOString(),
      end: moment().endOf('week').toISOString(),
    }),
    [],
  );
  // Calculate weekly average steps
  // const weeklyAverage = Math.round(totalSteps / 7);
  // const weeklyHigh = weeklyStepData
  //   ? Math.max(...weeklyStepData?.map((day: {step: any}) => day?.step))
  //   : 0;
  // console.log('weeklyHigh', weeklyHigh);
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // Flag to avoid state updates if the component is unmounted

      const fetchStepData = async () => {
        if (!userId || !dateRange?.start || !dateRange?.end) {
          console.warn('Missing userId or date range');
          return;
        }

        try {
          const data = await getStepDataByUserIdAndDateRange(
            userId,
            new Date(dateRange.start),
            new Date(dateRange.end),
          );

          if (isActive) {
            setStepData(data.length > 0 ? data : []); // Safely update state only if component is active
          }
        } catch (error) {
          if (isActive) {
            console.error('Error fetching step data:', error);
          }
        }
      };

      fetchStepData();

      return () => {
        isActive = false; // Cleanup flag on unmount
      };
    }, [dateRange?.start, dateRange?.end, userId]),
  );
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDark ? '#0a1a3a' : '#FFFFFF'},
      ]}>
      {/* <Text>HistoryScreen</Text>
      <WeeklyCalories data={weeklyCaloriesBurn || []} isDarkMode={isDark} /> */}
      <SelectableTabs
        data={tabs}
        onChange={handleTabChange}
        isDarkMode={isDark}
        initialTab={activeTabIndex}
      />
      {isLoading ? (
        <ActivityIndicator size={'large'} color={isDark ? 'white' : 'black'} />
      ) : (
        <PagerView
          ref={pagerRef}
          style={{flex: 1}}
          initialPage={activeTabIndex}
          pageMargin={0}
          onPageSelected={e => setActiveTabIndex(e.nativeEvent.position)}>
          <View key="1" style={styles.page}>
            {todayStepData && (
              <DailyStepsChart
                fitnessData={[todayStepData]}
                isDarkMode={isDark}
              />
            )}
          </View>
          <View key="2" style={styles.page}>
            {
              isShowStepsData
                ? weeklyStepData && (
                    <WeeklyStepsChart
                      fitnessData={weeklyStepData}
                      isDarkMode={isDark}
                    />
                  )
                : null
              // <WeeklyCalories
              //   data={weeklyCaloriesBurn || []}
              //   isDarkMode={isDark}
              //   // weeklyAverage={weeklyAverage}
              //   // weeklyGoal={5303}
              //   // selectedDate={formattedDateRange}
              // />
            }

            {/* <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: isShowStepsData
                  ? isDark
                    ? '#4a90e2'
                    : '#007bff'
                  : isDark
                  ? '#1f1f1f'
                  : '#f8f9fa',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 5,
              }}
              onPress={() => setIsShowStepsData(true)}>
              <Text
                style={{
                  color: isShowStepsData
                    ? '#ffffff'
                    : isDark
                    ? '#aaaaaa'
                    : '#666666',
                }}>
                Steps
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: !isShowStepsData
                  ? isDark
                    ? '#4a90e2'
                    : '#007bff'
                  : isDark
                  ? '#1f1f1f'
                  : '#f8f9fa',
                paddingHorizontal: 20,
                paddingVertical: 10,
                marginLeft: 10,
                borderRadius: 5,
              }}
              onPress={() => setIsShowStepsData(false)}>
              <Text
                style={{
                  color: !isShowStepsData
                    ? '#ffffff'
                    : isDark
                    ? '#aaaaaa'
                    : '#666666',
                }}>
                Calories
              </Text>
            </TouchableOpacity>
          </View> */}
          </View>
        </PagerView>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  page: {
    flex: 1,
  },
});
export default HistoryScreen;
