/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import auth from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useContext, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ActivityHeader from '../components/ActivityHeader';
import AppearanceSettings from '../components/AppearanceSettings';
import SelectableComponent from '../components/SelectableComponent';
import { ThemeContext } from '../hooks/ThemeContext';
import { activityTypes, genderOptions } from '../lib/data';
import { getThemePreference } from '../lib/utils/db';

type Props = NativeStackScreenProps<any, any>;
const SettingsScreen: React.FC<Props> = ({navigation}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [weight, setWeight] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [age, setAge] = useState<number>(0);
  const [gender, setGender] = useState<string | null>(null);
  const [isShowGenderModal, setIsShowGenderModal] = useState(false);
  const [activityType, setActivityType] = useState<string | null>(null);
  const themeContext = useContext(ThemeContext);
  const ref = useRef<BottomSheetModal>(null);
  if (!themeContext) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }

  const {isDark, toggleTheme} = themeContext;

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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchTheme = async () => {
        try {
          const theme = await getThemePreference();
          if (isActive && typeof theme === 'boolean') {
            toggleTheme(theme);
          }
        } catch (error) {
          console.error('Error fetching theme:', error);
        }
      };
      fetchTheme();
      return () => {
        isActive = false;
      };
    }, [toggleTheme]),
  );
  const userId = auth().currentUser?.uid;
  const theme = {
    backgroundColor: isDark ? '#0a1a3a' : '#ffffff',
    cardColor: isDark ? '#162442' : '#f8fafc',
    textColor: isDark ? '#ffffff' : '#1e293b',
    borderColor: isDark ? '#374151' : '#e2e8f0',
    placeholderColor: isDark ? '#9ca3af' : '#64748b',
    inputBg: isDark ? '#162442' : '#ffffff',
  };
  const handleThemeChange = async (isDarkMode: boolean) => {
    toggleTheme(isDarkMode);
    await firestore().collection('theme').doc('preference').set({
      darkMode: isDarkMode,
    });
  };

  // Find weekly high

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
  const onSaveUserPreference = async () => {
    if (!weight || !height || !age || !gender || !activityType) {
      console.log('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await firestore().collection('userPreferences').doc().set({
        weight,
        height,
        age,
        gender,
        activityType,
        userId: userId,
      });
      setWeight(0);
      setHeight(0);
      setAge(0);
      setGender(null);
      setActivityType(null);
      Alert.alert('Success!', 'Your preferences have been saved successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      ]);
      console.log('User preferences saved');
    } catch (error) {
      console.error('Error saving user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDark ? '#0a1a3a' : '#FFFFFF'},
      ]}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <ActivityHeader
          title="My activity"
          isDarkMode={isDark}
          onBackPress={() => console.log('Back')}
          onAddPress={() => {
            console.log('Add');
            navigation.navigate('SetGoal');
          }}
          onMenuPress={() => console.log('Menu')}
        />
        <View style={{flex: 1, padding: 14}}>
          <AppearanceSettings
            onThemeChange={handleThemeChange}
            isDarkMode={isDark}
          />
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, {color: theme.textColor}]}>
              Set your weight
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
                name="fitness-center"
                size={20}
                color={theme.textColor}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, {color: theme.textColor}]}
                onChangeText={weight => setWeight(parseInt(weight, 10))}
                placeholder="Enter weight (e.g., 70)"
                placeholderTextColor={theme.placeholderColor}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, {color: theme.textColor}]}>
              Set your Age
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
                name="fitness-center"
                size={20}
                color={theme.textColor}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, {color: theme.textColor}]}
                onChangeText={age => setAge(parseInt(age))}
                placeholder="Enter age (e.g., 25)"
                placeholderTextColor={theme.placeholderColor}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, {color: theme.textColor}]}>
              Set your height
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
                name="fitness-center"
                size={20}
                color={theme.textColor}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, {color: theme.textColor}]}
                onChangeText={height => setHeight(parseInt(height))}
                placeholder="Enter height (e.g., 175)"
                placeholderTextColor={theme.placeholderColor}
                keyboardType="numeric"
              />
            </View>
          </View>
          {/* info */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, {color: theme.textColor}]}>
              Select your gender
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.borderColor,
                },
              ]}>
              <TouchableOpacity
                onPress={() => {
                  setIsShowGenderModal(true);
                  ref.current?.present();
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <Text style={{color: theme.textColor}}>Select your gender</Text>
                <Icon
                  name="arrow-drop-down"
                  size={40}
                  color={theme.textColor}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, {color: theme.textColor}]}>
              Select your activity type
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.borderColor,
                },
              ]}>
              <TouchableOpacity
                onPress={() => {
                  setIsShowGenderModal(false);
                  ref.current?.present();
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <Text style={{color: theme.textColor}}>
                  Select your activity type
                </Text>
                <Icon
                  name="arrow-drop-down"
                  size={40}
                  color={theme.textColor}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: isDark ? '#6b7280' : '#3b82f6',
            opacity: isLoading ? 0.7 : 1,
          },
        ]}
        onPress={onSaveUserPreference}
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
      <BottomSheetModal
        onChange={index => {
          if (index === -1) {
            setIsShowGenderModal(false);
          }
        }}
        ref={ref}
        index={1}
        snapPoints={['20%', '70%']}
        enablePanDownToClose
        onDismiss={() => {
          setIsShowGenderModal(false);
        }}
        backdropComponent={props => <BottomSheetBackdrop {...props} />}
        backgroundStyle={{
          backgroundColor: theme.cardColor,
          borderRadius: 12,
        }}>
        <BottomSheetView style={{flex: 1, padding: 16}}>
          {isShowGenderModal ? (
            <SelectableComponent
              isDarkMode={isDark}
              data={genderOptions}
              selectedVal={gender || ''}
              onSelect={(val: string) => {
                setGender(val);
                setIsShowGenderModal(false);
                ref.current?.close();
              }}
            />
          ) : (
            <SelectableComponent
              isDarkMode={isDark}
              data={activityTypes}
              selectedVal={activityType || ''}
              onSelect={(val: string) => {
                setActivityType(val);
                setIsShowGenderModal(false);
                ref.current?.close();
              }}
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    minHeight: 56,
    marginHorizontal: 16,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
