/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import type {KeyboardTypeOptions} from 'react-native';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useHook} from '../hooks/ThemeContext';
import {signin} from '../lib/utils/apis';
import showToast from '../lib/utils/showToast';

const {width, height} = Dimensions.get('window');

type Props = NativeStackScreenProps<any, any>;

const LoginScreen: React.FC<Props> = ({navigation, route}) => {
  const {setUser, isDark, setToken} = useHook();
  const emailParam = route.params?.email ?? '';
  const passwordParam = route.params?.password ?? '';
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState(passwordParam);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isBiometricEnabled, setBiometricEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Check if device supports biometric authentication
  useEffect(() => {
    // Replace with a custom biometric handling library if required
    setIsBiometricSupported(false); // Adjust for platform support
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await signin({email, password});
      if (response.success) {
        showToast({
          type: 'success',
          message: 'Login Successful!',
        });
        console.log('response data', response.data);
        setUser(response?.data?.user);
        setToken(response?.data?.token);
        navigation.replace('MainTabs');
      }
    } catch (error: any) {
      console.log(error.message);
      Alert.alert(
        'Login Failed',
        error.message || 'An error occurred during login',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    // Implement biometric login logic here
    Alert.alert(
      'Biometric Login',
      'Biometric authentication would be triggered here',
    );
  };

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

  // useFocusEffect(
  //   useCallback(() => {
  //     let isActive = true;

  //     const fetchBiometricStatus = async () => {
  //       try {
  //         const biometricEnabled = await AsyncStorage.getItem(
  //           'biometricEnabled',
  //         );
  //         if (isActive && biometricEnabled) {
  //           setBiometricEnabled(biometricEnabled === 'true');
  //         }
  //       } catch (error) {
  //         console.error('Error fetching biometricEnabled:', error);
  //       }
  //     };

  //     fetchBiometricStatus();
  //     return () => {
  //       isActive = false;
  //     };
  //   }, []),
  // );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#0a1a3a' : '#ffffff'},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0a1a3a' : '#ffffff'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          // keyboardShouldPersistTaps="handled" // Ensures taps are handled properly
          // showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View
              style={[
                styles.logoContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(79, 70, 229, 0.1)'
                    : 'rgba(79, 70, 229, 0.1)',
                  borderColor: isDark
                    ? 'rgba(79, 70, 229, 0.2)'
                    : 'rgba(79, 70, 229, 0.2)',
                },
              ]}>
              <Ionicons name="shield-checkmark" size={48} color="#4f46e5" />
            </View>
            <Text
              style={[styles.title, {color: isDark ? '#ffffff' : '#1f2937'}]}>
              Welcome Back
            </Text>
            <Text
              style={[
                styles.subtitle,
                {color: isDark ? '#9ca3af' : '#6b7280'},
              ]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  {color: isDark ? '#ffffff' : '#1f2937'},
                ]}>
                Email Address
              </Text>
              <View
                style={[
                  isDark ? styles.inputContainer : styles.inputContainerLight,
                  emailFocused &&
                    (isDark
                      ? styles.inputContainerFocused
                      : styles.inputContainerFocusedLight),
                ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    emailFocused ? '#4f46e5' : isDark ? '#9ca3af' : '#6b7280'
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={[
                    styles.textInput,
                    {color: isDark ? '#ffffff' : '#1f2937'},
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  // onFocus={() => setEmailFocused(true)}
                  // onBlur={() => setEmailFocused(false)}
                  selectionColor="#4f46e5"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  {color: isDark ? '#ffffff' : '#1f2937'},
                ]}>
                Password
              </Text>
              <View
                style={[
                  isDark ? styles.inputContainer : styles.inputContainerLight,
                  passwordFocused &&
                    (isDark
                      ? styles.inputContainerFocused
                      : styles.inputContainerFocusedLight),
                ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    passwordFocused ? '#4f46e5' : isDark ? '#9ca3af' : '#6b7280'
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={[
                    styles.textInput,
                    {color: isDark ? '#ffffff' : '#1f2937'},
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                  secureTextEntry={!showPassword}
                  // onFocus={() => setPasswordFocused(true)}
                  // onBlur={() => setPasswordFocused(false)}
                  selectionColor="#4f46e5"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={isDark ? '#9ca3af' : '#6b7280'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#ffffff"
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Biometric Login */}
            {isBiometricSupported && isBiometricEnabled && (
              <TouchableOpacity
                style={[
                  styles.biometricButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                    borderColor: 'rgba(79, 70, 229, 0.3)',
                  },
                ]}
                onPress={handleBiometricLogin}
                disabled={isLoading}
                activeOpacity={0.8}>
                <Ionicons
                  name={biometricType === 'FaceID' ? 'scan' : 'finger-print'}
                  size={24}
                  color="#4f46e5"
                  style={styles.biometricIcon}
                />
                <Text style={styles.biometricButtonText}>
                  Use {biometricType || 'Biometric'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View
                style={[
                  styles.dividerLine,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
              />
              <Text
                style={[
                  styles.dividerText,
                  {color: isDark ? '#9ca3af' : '#6b7280'},
                ]}>
                OR
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
              />
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity
              style={styles.signUpContainer}
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.signUpText,
                  {color: isDark ? '#9ca3af' : '#6b7280'},
                ]}>
                Don't have an account?
                <Text style={styles.signUpLink}> Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  inputContainerLight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: '#4f46e5',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    shadowColor: '#4f46e5',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerFocusedLight: {
    borderColor: '#4f46e5',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    shadowColor: '#4f46e5',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  toggleButton: {
    padding: 8,
    marginLeft: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#4f46e5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  biometricIcon: {
    marginRight: 8,
  },
  biometricButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  signUpContainer: {
    alignItems: 'center',
    // paddingVertical: 16,
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 16,
    textAlign: 'center',
  },
  signUpLink: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});

export default LoginScreen;
