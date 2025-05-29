/* eslint-disable react/no-unstable-nested-components */
// import { Ionicons } from "@expo/vector-icons";
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useCallback, useMemo} from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ThemeProvider, useHook} from './hooks/ThemeContext';
import {hasIncompleteGoals, hasIncompletePresences} from './lib/utils';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HistoryScreen from './screens/HistoryScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import SetGoalScreen from './screens/SetGoalScreen';
import SetNewPasswordScreen from './screens/SetNewPasswordScreen';
import SettingsScreen from './screens/SettingsScreen';
import SignUpScreen from './screens/SignUpScreen';
import VerifyOTPScreen from './screens/VerifyOTPScreen';
// import VerifyOTPScreen from './screens/VerifyOTPScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const {goal, userPreferences, isDark} = useHook();
  const isGoalSet = useMemo(() => {
    return hasIncompleteGoals(goal as any);
  }, [goal]);
  const isSetUserPreferences = useMemo(() => {
    return hasIncompletePresences(userPreferences as any);
  }, [userPreferences]);
  const route = useRoute();
  console.log('route name', route.name);
  console.log('isSetUserPreferences', isSetUserPreferences);
  console.log('isGoalSet', isGoalSet);
  const shouldHideTabBar =
    route.name === 'MainTabs' && (isGoalSet || isSetUserPreferences);
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor('#0a1a3a');
    }, [isDark]),
  );
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName = 'home';
          if (route.name === 'Profile') {
            iconName = 'person';
          }
          if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4caf50',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          display: shouldHideTabBar ? 'none' : 'flex',
          backgroundColor: isDark ? '#0a1a3a' : '#ffffff', // Dynamic background color
        },
      })}>
      <Tab.Screen
        name="Home"
        options={{headerShown: false}}
        component={HomeScreen}
      />
      <Tab.Screen
        options={{headerShown: false}}
        name="Settings"
        component={SettingsScreen}
      />
      <Tab.Screen
        options={{headerShown: false}}
        name="Profile"
        component={ProfileScreen}
      />
      <Tab.Screen
        options={{headerShown: false}}
        name="History"
        component={HistoryScreen}
      />
      {/* <Tab.Screen
        options={{headerShown: false}}
        name="Profile"
        component={ProfileScreen}
      />

      <Tab.Screen
        options={{headerShown: false}}
        name="History"
        component={HistoryScreen}
      /> */}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <BottomSheetModalProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{headerShown: false}}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                options={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
                name="ForgotPassword"
                component={ForgotPasswordScreen}
              />
              <Stack.Screen
                options={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
                name="VerifyOTP"
                component={VerifyOTPScreen}
              />
              <Stack.Screen
                options={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
                name="setNewPassword"
                component={SetNewPasswordScreen}
              />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="SetGoal" component={SetGoalScreen} />
              <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
