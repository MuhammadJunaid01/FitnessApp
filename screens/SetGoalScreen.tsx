/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import SetGoal, {activityTypes, daysOfWeek} from '../components/SetGoal';
import {useHook} from '../hooks/ThemeContext';

const SetGoalScreen = () => {
  const {isDark, user} = useHook();

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
