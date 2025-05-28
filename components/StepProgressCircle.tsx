/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {calculateDailyStepPercentage} from '../lib/utils';
interface StepProgressCircleProps {
  dailyStepCount: number;
  dailyGoal: number;
  isLoadingGoal: boolean;
  isDark: boolean;
  iGoalReached: boolean;
}
const StepProgressCircle: React.FC<StepProgressCircleProps> = ({
  dailyStepCount,
  dailyGoal,
  isLoadingGoal,
  isDark,
  iGoalReached = false,
}) => {
  const [goalReached, setGoalReached] = useState(false); // new state
  const navigation = useNavigation();
  const progressPercentage = useMemo(
    () => calculateDailyStepPercentage(dailyGoal, dailyStepCount),
    [dailyGoal, dailyStepCount],
  );
  console.log('dailyu step', dailyGoal);
  console.log('progressPercentage', progressPercentage);
  useEffect(() => {
    if (iGoalReached) {
      setGoalReached(true); // prevent multiple alerts

      Alert.alert(
        '🎉 Goal Reached!',
        "You've hit your step goal! Do you want to set a new goal?",
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Yes',
            onPress: () => navigation.navigate('SetGoal'),
          },
        ],
      );
    }
  }, [dailyGoal, dailyStepCount, goalReached, iGoalReached, navigation]);

  return (
    <View
      style={[
        styles.progressContainer,
        isDark && {backgroundColor: '#182b4d'},
      ]}>
      <View style={styles.circleContainer}>
        <View style={[styles.outerCircle, isDark && {borderColor: '#2c3e50'}]}>
          <View style={styles.progressCircleContainer}>
            <View
              style={[
                styles.progressCircle,
                {width: `${progressPercentage}%`},
                {
                  backgroundColor:
                    progressPercentage >= 100 ? '#4cd964' : '#3498db',
                },
              ]}
            />
          </View>
          <View style={styles.innerCircle}>
            {isLoadingGoal ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text style={[styles.stepCountText]}>
                  {dailyStepCount?.toLocaleString()}
                </Text>
                <Text style={[styles.stepsLabel]}>STEPS</Text>
                <Text style={[styles.goalText]}>
                  Goal: {dailyGoal?.toLocaleString()}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  progressContainer: {
    borderRadius: 20,
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 18,
    borderColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircleContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  progressCircle: {
    position: 'absolute',
    height: '100%',
    left: 0,
    backgroundColor: '#3498db',
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCountText: {
    fontSize: 36,
    fontWeight: '700',
    color: 'black',
  },
  stepsLabel: {
    fontSize: 14,
    color: 'black',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  goalText: {
    fontSize: 14,
    color: 'black',
    marginTop: 8,
  },
});
export default StepProgressCircle;
