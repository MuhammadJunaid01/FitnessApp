/* eslint-disable no-catch-shadow */
/* eslint-disable react-native/no-inline-styles */
// import auth from '@react-native-firebase/auth';
import React, {useEffect, useRef, useState} from 'react';

// import firestore from '@react-native-firebase/firestore';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import PagerView from 'react-native-pager-view';
import DailyStepsChart from '../components/DailyStepsChart';
import SelectableTabs from '../components/SelectableTabs';
import WeeklyStepsChart from '../components/WeeklyStepsChart';
import {useHook} from '../hooks/ThemeContext';
import {IGetStepsPayload, ISteps} from '../lib/interfaces';
import {getTodayDateRange, getWeeklyDateRange} from '../lib/utils';
import {getStepsByDateRange} from '../lib/utils/apis';

const HistoryScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [todayStepData, setTodayStepData] = useState<ISteps[] | null>(null);
  const [weeklyStepData, setWeeklyStepData] = useState<ISteps[] | null>(null);
  const tabs = ['Day', 'Week'];

  const {isDark, user} = useHook();
  // const [isShowCaloriesData, setIsShowCaloriesData] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(1);
  const pagerRef = useRef<PagerView>(null);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    pagerRef.current?.setPage(index);
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  //     StatusBar.setBackgroundColor(isDark ? '#0a1a3a' : '#FFFFFF');
  //   }, [isDark]),
  // );
  useEffect(() => {
    const fetchStepData = async () => {
      try {
        setIsLoading(true);
        if (!user?._id) {
          return;
        }
        const {startOfWeek, endOfWeek} = getWeeklyDateRange();
        const weeklyPayload: IGetStepsPayload = {
          userId: user._id,
          startDate: startOfWeek,
          endDate: endOfWeek,
        };
        const {startDate, endDate} = getTodayDateRange();
        const todayStepPayload: IGetStepsPayload = {
          userId: user._id,
          startDate: startDate,
          endDate: endDate,
        };
        const weeklyStep = await getStepsByDateRange(weeklyPayload);
        const todayStep = await getStepsByDateRange(todayStepPayload);
        console.log('weekly data', weeklyStep.data);
        console.log('today steps data', todayStep.data);
        setTodayStepData(todayStep.data);
        setWeeklyStepData(weeklyStep.data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchStepData();
  }, [user]);

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
                fitnessData={todayStepData}
                isDarkMode={isDark}
              />
            )}
          </View>
          <View key="2" style={styles.page}>
            {weeklyStepData ? (
              <WeeklyStepsChart
                fitnessData={weeklyStepData}
                isDarkMode={isDark}
              />
            ) : null}
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
