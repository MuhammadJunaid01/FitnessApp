/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {StatusBar, View} from 'react-native';
import SetGoal, {activityTypes, daysOfWeek} from '../components/SetGoal';
import {useHook} from '../hooks/ThemeContext';

const SetGoalScreen = () => {
  const {isDark, user} = useHook();
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor(isDark ? '#0a1a3a' : '#FFFFFF');
      return () => {
        StatusBar.setBarStyle('default');
        StatusBar.setBackgroundColor('#FFFFFF');
      };
    }, [isDark]),
  );
  console.log('isDark', isDark);
  return (
    <View style={{flex: 1, backgroundColor: isDark ? '#0a1a3a' : '#FFFFFF'}}>
      <SetGoal
        data={daysOfWeek}
        activity={activityTypes}
        isDarkMode={isDark}
        userId={user?._id}
      />
    </View>
  );
};

export default SetGoalScreen;
