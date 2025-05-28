import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useHook} from '../hooks/ThemeContext';
import {IForgotVerifyOtpPayload} from '../lib/interfaces';
import {verifyForgotPasswordOtp} from '../lib/utils/apis';

type Props = NativeStackScreenProps<any, any>;
const OTP_EXPIRY_MINUTES = 10;
const VerifyOTPScreen: React.FC<Props> = ({route, navigation}) => {
  const {isDark} = useHook();
  const email = route?.params?.email ?? '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_MINUTES * 60); // 10 minutes in seconds
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const theme = {
    background: isDark ? '#0a1a3a' : '#ffffff',
    surface: isDark ? '#1e2a4a' : '#f5f5f5',
    primary: '#4caf50',
    text: isDark ? '#ffffff' : '#000000',
    textSecondary: isDark ? '#b0b0b0' : '#666666',
    inputBackground: isDark ? '#2a3a5a' : '#ffffff',
    inputText: isDark ? '#ffffff' : '#000000',
    inputPlaceholder: isDark ? '#888888' : '#999999',
    border: isDark ? '#3a4a6a' : '#e0e0e0',
    link: isDark ? '#64b5f6' : '#1976d2',
    buttonBackground: isDark ? '#ffffff' : '#4caf50',
    buttonText: isDark ? '#0a1a3a' : '#ffffff',
    otpBackground: isDark ? '#ffffff' : '#f8f9fa',
    otpText: isDark ? '#0a1a3a' : '#000000',
    timer: isDark ? '#ffa726' : '#ff9800',
    success: '#4caf50',
    error: '#f44336',
  };

  // Timer for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    if (/^[0-9]?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    try {
      setIsLoading(true);
      const payload: IForgotVerifyOtpPayload = {
        email,
        otp: otp.join(''),
      };
      const response = await verifyForgotPasswordOtp(payload);
      if (response.success) {
        navigation.navigate('setNewPassword', {token: response.data, email});
      }
      setShowPasswordFields(true);
    } catch (error: any) {
      console.log(error.message);
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }

    try {
      setIsLoading(true);
      Alert.alert('Success', 'Your password has been reset successfully.', [
        {text: 'OK', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error: any) {
      console.log(error.message);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setTimeLeft(OTP_EXPIRY_MINUTES * 60);
      Alert.alert('Success', 'A new verification code has been sent');
    } catch (error: any) {
      console.log(error.message);
      Alert.alert('Error', 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor(theme.background);

      return () => {
        StatusBar.setBarStyle('default');
        StatusBar.setBackgroundColor('#FFFFFF');
      };
    }, [isDark, theme.background]),
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[styles.iconContainer, {backgroundColor: theme.surface}]}>
            <Icon
              name={
                showPasswordFields
                  ? 'lock-closed-outline'
                  : 'shield-checkmark-outline'
              }
              size={40}
              color={theme.primary}
            />
          </View>
          <Text style={[styles.title, {color: theme.text}]}>
            {showPasswordFields ? 'Set New Password' : 'Verify Your Email'}
          </Text>
        </View>

        {!showPasswordFields ? (
          <>
            {/* OTP Verification Section */}
            <View style={styles.otpSection}>
              <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
                Enter the 6-digit verification code sent to
              </Text>
              <Text style={[styles.emailText, {color: theme.primary}]}>
                {email}
              </Text>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      {
                        backgroundColor: theme.otpBackground,
                        color: theme.otpText,
                        borderColor: digit ? theme.primary : theme.border,
                      },
                    ]}
                    value={digit}
                    onChangeText={text => handleOtpChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Timer */}
              <View style={styles.timerContainer}>
                <Icon
                  name="time-outline"
                  size={16}
                  color={timeLeft > 0 ? theme.timer : theme.error}
                />
                <Text
                  style={[
                    styles.timer,
                    {color: timeLeft > 0 ? theme.timer : theme.error},
                  ]}>
                  {timeLeft > 0
                    ? `Code expires in ${formatTime(timeLeft)}`
                    : 'Code expired'}
                </Text>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={verifyOTP}
                style={[
                  styles.button,
                  {backgroundColor: theme.buttonBackground},
                  (isLoading || otp.some(digit => !digit)) &&
                    styles.disabledButton,
                ]}
                disabled={isLoading || otp.some(digit => !digit)}>
                {isLoading ? (
                  <ActivityIndicator color={theme.buttonText} size="small" />
                ) : (
                  <>
                    <Icon
                      name="checkmark-circle-outline"
                      size={20}
                      color={theme.buttonText}
                      style={styles.buttonIcon}
                    />
                    <Text
                      style={[styles.buttonText, {color: theme.buttonText}]}>
                      Verify Code
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Resend Section */}
              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, {color: theme.textSecondary}]}>
                  Didn't receive the code?{' '}
                </Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={isLoading || timeLeft > 0}
                  style={styles.resendButton}>
                  <Icon
                    name="refresh-outline"
                    size={16}
                    color={
                      isLoading || timeLeft > 0
                        ? theme.textSecondary
                        : theme.link
                    }
                    style={styles.resendIcon}
                  />
                  <Text
                    style={[
                      styles.resendLink,
                      {
                        color:
                          isLoading || timeLeft > 0
                            ? theme.textSecondary
                            : theme.link,
                      },
                    ]}>
                    Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Password Reset Section */}
            <View style={styles.passwordSection}>
              <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
                Create a new password for your account
              </Text>

              {/* New Password Input */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={[styles.input, {color: theme.inputText}]}
                  secureTextEntry={!isNewPasswordVisible}
                  placeholderTextColor={theme.inputPlaceholder}
                />
                <TouchableOpacity
                  onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={
                      isNewPasswordVisible ? 'eye-outline' : 'eye-off-outline'
                    }
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, {color: theme.inputText}]}
                  secureTextEntry={!isConfirmPasswordVisible}
                  placeholderTextColor={theme.inputPlaceholder}
                />
                <TouchableOpacity
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                  style={styles.eyeIcon}>
                  <Icon
                    name={
                      isConfirmPasswordVisible
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Icon
                  name="information-circle-outline"
                  size={16}
                  color={theme.textSecondary}
                  style={styles.requirementIcon}
                />
                <Text
                  style={[
                    styles.requirementText,
                    {color: theme.textSecondary},
                  ]}>
                  Password must be at least 6 characters long
                </Text>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
                style={[
                  styles.button,
                  {backgroundColor: theme.buttonBackground},
                  isLoading && styles.disabledButton,
                ]}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={theme.buttonText} size="small" />
                ) : (
                  <>
                    <Icon
                      name="shield-checkmark-outline"
                      size={20}
                      color={theme.buttonText}
                      style={styles.buttonIcon}
                    />
                    <Text
                      style={[styles.buttonText, {color: theme.buttonText}]}>
                      Reset Password
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Back Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon
              name="arrow-back-outline"
              size={20}
              color={theme.link}
              style={styles.backIcon}
            />
            <Text style={[styles.backLink, {color: theme.link}]}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyOTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  otpSection: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timer: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  passwordSection: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  requirementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  requirementIcon: {
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    minHeight: 56,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendIcon: {
    marginRight: 4,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backIcon: {
    marginRight: 8,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
