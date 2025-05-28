/* eslint-disable react-native/no-inline-styles */
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {StatusBar, View} from 'react-native';
import SetGoal, {activityTypes, daysOfWeek} from '../components/SetGoal';
import {ThemeContext} from '../hooks/ThemeContext';

const SetGoalScreen = () => {
  const themeContextVal = useContext(ThemeContext);
  if (!themeContextVal) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }
  const {isDark} = themeContextVal;
  const userId = auth().currentUser?.uid;
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
        userId={userId}
      />
    </View>
  );
};

export default SetGoalScreen;
