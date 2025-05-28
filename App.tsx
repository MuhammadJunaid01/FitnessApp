/* eslint-disable react/no-unstable-nested-components */
// import { Ionicons } from "@expo/vector-icons";
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ThemeProvider} from './hooks/ThemeContext';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import LoginScreen from './screens/LoginScreen';
import SetNewPasswordScreen from './screens/SetNewPasswordScreen';
import SignUpScreen from './screens/SignUpScreen';
import VerifyOTPScreen from './screens/VerifyOTPScreen';
// import VerifyOTPScreen from './screens/VerifyOTPScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({route}) => ({
//         tabBarIcon: ({color, size}) => {
//           let iconName = 'home';
//           if (route.name === 'Profile') iconName = 'person';
//           if (route.name === 'Settings') iconName = 'settings';
//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#4caf50',
//         tabBarInactiveTintColor: 'gray',
//       })}>
//       <Tab.Screen
//         name="Home"
//         options={{headerShown: false}}
//         component={HomeScreen}
//       />
//       <Tab.Screen
//         options={{headerShown: false}}
//         name="Profile"
//         component={ProfileScreen}
//       />
//       <Tab.Screen
//         options={{headerShown: false}}
//         name="Settings"
//         component={SettingsScreen}
//       />
//       <Tab.Screen
//         options={{headerShown: false}}
//         name="History"
//         component={HistoryScreen}
//       />
//     </Tab.Navigator>
//   );
// }

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
              {/* <Stack.Screen name="SetGoal" component={SetGoalScreen} /> */}
              {/* <Stack.Screen name="MainTabs" component={MainTabs} /> */}
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
