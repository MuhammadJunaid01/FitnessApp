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
import Icon from 'react-native-vector-icons/Ionicons';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useHook} from '../hooks/ThemeContext';
import {forgotPassword} from '../lib/utils/apis';
import showToast from '../lib/utils/showToast';

type ForgotPasswordScreenNavigationProp = NativeStackScreenProps<any, any>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenNavigationProp> = ({
  navigation,
}) => {
  const {isDark} = useHook();
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
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, {backgroundColor: theme.surface}]}>
          <Icon name="key-outline" size={40} color={theme.primary} />
        </View>
        <Text style={[styles.title, {color: theme.text}]}>Reset Password</Text>
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          Enter your email address and we'll send you instructions to reset your
          password.
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Email Input */}
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: theme.inputBackground, borderColor: theme.border},
          ]}>
          <Icon
            name="mail-outline"
            size={20}
            color={theme.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, {color: theme.inputText}]}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.inputPlaceholder}
          />
        </View>

        {/* Send Button */}
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
                name="send-outline"
                size={20}
                color={theme.buttonText}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, {color: theme.buttonText}]}>
                Send Reset Email
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <Icon
            name="information-circle-outline"
            size={16}
            color={theme.textSecondary}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, {color: theme.textSecondary}]}>
            Check your spam folder if you don't receive the email within a few
            minutes.
          </Text>
        </View>
      </View>

      {/* Footer */}
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
          <Text style={[styles.backLink, {color: theme.link}]}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
