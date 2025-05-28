import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {forgotPassword} from '../lib/utils/apis';
import showToast from '../lib/utils/showToast';

type ForgotPasswordScreenNavigationProp = NativeStackScreenProps<any, any>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenNavigationProp> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await forgotPassword({email});

      if (response?.success) {
        showToast({
          type: 'success',
          message: 'Password reset email sent. Please check your inbox.',
        });

        navigation.navigate('VerifyOTP', {
          email,
          purpose: 'reset_password',
        });
      } else {
        throw new Error('Unexpected error while sending reset email.');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error?.message || error);

      const errorMessage =
        error?.code === 'auth/user-not-found'
          ? 'No user found with this email address.'
          : 'Failed to send password reset email. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('#0a1a3a');

      return () => {
        StatusBar.setBarStyle('default');
        StatusBar.setBackgroundColor('#FFFFFF');
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you instructions to reset your
        password.
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        onPress={handleResetPassword}
        style={[styles.button, isLoading && styles.disabledButton]}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#0a1a3a" />
        ) : (
          <Text style={styles.buttonText}>Send</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backLink}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};
export default ForgotPasswordScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0a1a3a',
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
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
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
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0a1a3a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backLink: {
    color: 'white',
    textAlign: 'center',
  },
});
