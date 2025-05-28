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
import {IForgotVerifyOtpPayload} from '../lib/interfaces';
import {verifyForgotPasswordOtp} from '../lib/utils/apis';
type Props = NativeStackScreenProps<any, any>;
const VerifyOTPScreen: React.FC<Props> = ({route, navigation}) => {
  const email = route?.params?.email ?? '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

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
    // if (otp.some(digit => !digit)) {
    //   Alert.alert('Error', 'Please enter the complete verification code');
    //   return;
    // }

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
      // if (!otpDoc.exists()) {
      //   Alert.alert('Error', 'Invalid verification code');
      //   return;
      // }

      // const otpData = otpDoc.data();

      // Check if OTP is expired
      // const now = new Date();
      // const expiresAt = otpData.expiresAt.toDate();

      // if (now > expiresAt) {
      //   Alert.alert(
      //     'Error',
      //     'Verification code has expired. Please request a new one.',
      //   );
      //   return;
      // }

      // Check if OTP is already used
      // if (otpData.used) {
      //   Alert.alert('Error', 'This verification code has already been used');
      //   return;
      // }

      // Check if OTP matches
      // const enteredOtp = otp.join('');
      // if (enteredOtp !== otpData.otp) {
      //   Alert.alert('Error', 'Invalid verification code');
      //   return;
      // }

      // OTP is valid, show password reset fields
      setShowPasswordFields(true);
    } catch (error) {
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

      // In a real implementation, you would have a proper backend to handle this securely
      // Here's a simplified approach for demonstration:

      // 1. Mark the OTP as used
      const otpDocRef = doc(db, 'passwordResetOTPs', otpId);
      await updateDoc(otpDocRef, {
        used: true,
        usedAt: Timestamp.now(),
      });

      // 2. In a real implementation, you would use Firebase Admin SDK or a Cloud Function
      // to reset the password. This client-side approach is just for demonstration.
      // (You would typically NOT sign in the user like this)

      // For demo purposes, we'll show a success message
      Alert.alert('Success', 'Your password has been reset successfully.', [
        {text: 'OK', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error) {
      console.log(error.message);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);

      // Generate new OTP (this would typically be handled on the server)
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Update expiration time (15 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Update OTP in Firestore
      const otpDocRef = doc(db, 'passwordResetOTPs', otpId);
      await updateDoc(otpDocRef, {
        otp: newOtp,
        createdAt: Timestamp.now(),
        expiresAt,
        used: false,
      });

      // Reset timer
      setTimeLeft(180);

      // For development purposes
      console.log('New OTP for development: ', newOtp);

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
      // Set the status bar style when this screen is focused
      StatusBar.setBarStyle('light-content'); // For iOS
      StatusBar.setBackgroundColor('#0a1a3a'); // For Android

      return () => {
        // Reset to default status bar style when this screen is unfocused
        StatusBar.setBarStyle('default');
        StatusBar.setBackgroundColor('#FFFFFF');
      };
    }, []),
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>

        {!showPasswordFields ? (
          <>
            <Text style={styles.subtitle}>
              Enter the 6-digit verification code sent to {email}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <Text style={styles.timer}>
              {timeLeft > 0
                ? `Code expires in ${formatTime(timeLeft)}`
                : 'Code expired'}
            </Text>

            <TouchableOpacity
              onPress={verifyOTP}
              style={styles.button}
              disabled={isLoading || otp.some(digit => !digit)}>
              {isLoading ? (
                <ActivityIndicator color="#0a1a3a" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isLoading || timeLeft > 0}>
                <Text
                  style={[
                    styles.resendLink,
                    (isLoading || timeLeft > 0) && styles.resendLinkDisabled,
                  ]}>
                  Resend
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Create a new password for your account
            </Text>

            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              secureTextEntry
            />

            <TextInput
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={handleResetPassword}
              style={styles.button}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#0a1a3a" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
export default VerifyOTPScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1a3a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: 'white',
    width: 45,
    height: 50,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0a1a3a',
  },
  timer: {
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: 'black',
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#0a1a3a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#cccccc',
  },
  resendLink: {
    color: 'white',
    fontWeight: 'bold',
  },
  resendLinkDisabled: {
    color: '#666666',
  },
  backLink: {
    color: 'white',
    textAlign: 'center',
  },
});
