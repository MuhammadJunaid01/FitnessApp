import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {signup} from '../lib/utils/apis';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useHook} from '../hooks/ThemeContext';
import showToast from '../lib/utils/showToast';

type SignUpScreenNavigationProp = NativeStackScreenProps<any, any>;

export default function SignUpScreen({navigation}: SignUpScreenNavigationProp) {
  const {isDark} = useHook();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isValidEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  const handleSignUp = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await signup({
        name: name,
        email: email,
        password: password,
      });
      if (response.success) {
        navigation.replace('VerifyOTP', {email, isVerifyEmail: true});
        showToast({
          type: 'success',
          message: 'Sign Up Successful! Please Login.',
        });
      }
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={styles.header}>
        <Icon
          name="person-add-outline"
          size={60}
          color={theme.primary}
          style={styles.headerIcon}
        />
        <Text style={[styles.title, {color: theme.text}]}>Create Account</Text>
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          Join us and get started
        </Text>
      </View>

      <View style={styles.form}>
        {/* Name Input */}
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: theme.inputBackground, borderColor: theme.border},
          ]}>
          <Icon
            name="person-outline"
            size={20}
            color={theme.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, {color: theme.inputText}]}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.inputPlaceholder}
            autoCapitalize="none"
          />
        </View>

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
            style={[styles.input, {color: theme.inputText}]}
            placeholder="Email Address"
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholderTextColor={theme.inputPlaceholder}
          />
        </View>

        {/* Password Input */}
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: theme.inputBackground, borderColor: theme.border},
          ]}>
          <Icon
            name="lock-closed-outline"
            size={20}
            color={theme.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, {color: theme.inputText}]}
            placeholder="Password"
            value={password}
            secureTextEntry={!isPasswordVisible}
            onChangeText={setPassword}
            placeholderTextColor={theme.inputPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}>
            <Icon
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, {backgroundColor: theme.primary}]}
          disabled={isLoading}
          onPress={handleSignUp}>
          {isLoading ? (
            <ActivityIndicator color={'white'} size="small" />
          ) : (
            <>
              <Icon
                name="checkmark-circle-outline"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.textSecondary}]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, {color: theme.link}]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
  headerIcon: {
    marginBottom: 20,
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
  },
  form: {
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
});
