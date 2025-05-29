/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */

import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useHook} from '../hooks/ThemeContext';
import {IGoal} from '../lib/interfaces';
import {updateAndCreateGoal} from '../lib/utils/apis';
import showToast from '../lib/utils/showToast';

// Types and Data
export type ActivityType =
  | 'Slow walking'
  | 'Brisk walking'
  | 'Jogging'
  | 'Running';

export const daysOfWeek: string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const activityTypes: ActivityType[] = [
  'Slow walking',
  'Brisk walking',
  'Jogging',
  'Running',
];

interface SetGoalProps {
  data: string[]; // name of the week
  activity: ActivityType[]; // activity type
  isDarkMode: boolean; // dark mode
  userId?: string; // optional user ID
}

const SetGoal: React.FC<SetGoalProps> = ({isDarkMode, userId}) => {
  console.log('userId', userId);
  const {goal} = useHook();
  const navigation = useNavigation<any>();
  const [goalValue, setGoalValue] = useState<string>(
    goal?.dailyGoal?.toString() || '',
  );
  const [weeklyGoalValue, setWeeklyGoalValue] = useState<string>(
    goal?.weeklyGoal?.toString() || '',
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const theme = {
    backgroundColor: isDarkMode ? '#0a1a3a' : '#ffffff',
    cardColor: isDarkMode ? '#162442' : '#f8fafc',
    textColor: isDarkMode ? '#ffffff' : '#1e293b',
    borderColor: isDarkMode ? '#374151' : '#e2e8f0',
    placeholderColor: isDarkMode ? '#9ca3af' : '#64748b',
    inputBg: isDarkMode ? '#162442' : '#ffffff',
  };

  const handleSaveGoal = async () => {
    if (!goalValue || !weeklyGoalValue) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (!userId) {
        Alert.alert('Error', 'User ID is missing. Please log in again.');
        return;
      }

      const payload: IGoal = {
        userId: userId as string,
        weeklyGoal: parseFloat(weeklyGoalValue),
        dailyGoal: parseFloat(goalValue),
      };

      const response = await updateAndCreateGoal(userId, payload);

      if (response && response.success) {
        showToast({
          type: 'success',
          message: response.message,
        });
        navigation.navigate('MainTabs');
        setGoalValue('');
        setWeeklyGoalValue('');
        // Alert.alert('Success!', 'Your goal has been updated successfully', [
        //   {
        //     text: 'OK',
        //     onPress: () => {
        //       // Reset form fields
        //       setSelectedDay('');
        //       setSelectedActivity('');
        //       setGoalValue('');
        //       setWeeklyGoalValue('');
        //     },
        //   },
        // ]);
      }
    } catch (error: any) {
      showToast({
        type: 'success',
        message: error?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon
            name="flag"
            size={28}
            color={theme.textColor}
            style={styles.headerIcon}
          />
          <Text style={[styles.title, {color: theme.textColor}]}>
            Set Your Goal
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Day Selection */}

          {/* Goal Input */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, {color: theme.textColor}]}>
              Weekly Step Goal
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.borderColor,
                },
              ]}>
              <Icon
                name="timer"
                size={20}
                color={theme.textColor}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, {color: theme.textColor}]}
                value={weeklyGoalValue}
                onChangeText={setWeeklyGoalValue}
                placeholder="Enter goal (e.g., 1000)"
                placeholderTextColor={theme.placeholderColor}
                keyboardType="numeric"
              />
            </View>
          </View>
          {/* Goal Input */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, {color: theme.textColor}]}>
              Daily Step Goal
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.borderColor,
                },
              ]}>
              <Icon
                name="timer"
                size={20}
                color={theme.textColor}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, {color: theme.textColor}]}
                value={goalValue}
                onChangeText={setGoalValue}
                placeholder="Enter goal (e.g., 1000)"
                placeholderTextColor={theme.placeholderColor}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isDarkMode ? '#6b7280' : '#3b82f6',
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleSaveGoal}
            disabled={isLoading}>
            <Icon
              name={isLoading ? 'hourglass-empty' : 'save'}
              size={20}
              color="#ffffff"
              style={styles.saveButtonIcon}
            />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving Goal...' : 'Save Goal'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  buttonIcon: {
    marginRight: 12,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  arrowIcon: {
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    minHeight: 56,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    maxHeight: 300,
    marginTop: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SetGoal;
