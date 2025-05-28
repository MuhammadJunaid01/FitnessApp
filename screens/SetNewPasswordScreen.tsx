/* eslint-disable react/no-unstable-nested-components */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useHook} from '../hooks/ThemeContext';
import {IResetPasswordPayload} from '../lib/interfaces';
import {resetPassword} from '../lib/utils/apis';
interface IPasswordInput {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  style?: any;
}
type Props = NativeStackScreenProps<any, any>;
const SetNewPasswordScreen: React.FC<Props> = ({navigation, route}) => {
  const token = route.params?.token;
  const email = route.params?.email;
  console.log('TOKEN', token);
  const {isDark} = useHook();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = {
    background: isDark ? '#0a1a3a' : '#ffffff',
    surface: isDark ? '#1a2851' : '#f8f9fa',
    card: isDark ? '#2d3748' : '#ffffff',
    text: isDark ? '#ffffff' : '#333333',
    textSecondary: isDark ? '#b0b8cc' : '#666666',
    primary: '#4f46e5',
    success: '#10b981',
    border: isDark ? '#374151' : '#e2e8f0',
    inputBackground: isDark ? '#374151' : '#f8f9fa',
    shadow: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
  };

  const handleSetPassword = useCallback(async () => {
    // Validation
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Validation Error', 'Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Validation Error',
        'Password must be at least 8 characters long',
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      Alert.alert(
        'Validation Error',
        'Password must contain at least one uppercase letter',
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      Alert.alert(
        'Validation Error',
        'Password must contain at least one number',
      );
      return;
    }
    const payload: IResetPasswordPayload = {
      token: token,
      newPassword: password,
      email,
    };
    const response = await resetPassword(payload);
    if (response.success) {
      Alert.alert('success');
    }
    // Success
    Alert.alert('Success', 'Password has been set successfully!', [
      {
        text: 'OK',
        onPress: () => {
          // Reset form
          setPassword('');
          setConfirmPassword('');
          setShowPassword(false);
          setShowConfirmPassword(false);
        },
      },
    ]);
  }, [confirmPassword, email, password, token]);

  const PasswordInput = useCallback(
    ({
      onChangeText,
      placeholder,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      showPassword,
      onTogglePassword,
      style,
    }: IPasswordInput) => (
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
          style,
        ]}>
        <Icon
          name="lock-closed-outline"
          size={20}
          color={theme.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.textInput, {color: theme.text}]}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={onTogglePassword}
          style={styles.eyeButton}
          activeOpacity={0.7}>
          <Icon
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    ),
    [
      theme.border,
      theme.inputBackground,
      theme.shadow,
      theme.text,
      theme.textSecondary,
    ],
  );

  interface RequirementItemProps {
    text: string;
    isValid: boolean;
  }

  const RequirementItem = ({text, isValid}: RequirementItemProps) => (
    <View style={styles.requirementItem}>
      <Icon
        name={isValid ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={isValid ? theme.success : theme.textSecondary}
        style={styles.requirementIcon}
      />
      <Text
        style={[
          styles.requirementText,
          {color: isValid ? theme.success : theme.textSecondary},
        ]}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[styles.iconContainer, {backgroundColor: theme.primary}]}>
            <Icon name="shield-checkmark" size={32} color="#ffffff" />
          </View>
          <Text style={[styles.title, {color: theme.text}]}>
            Set New Password
          </Text>
          <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
            Create a strong password to secure your account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* New Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: theme.text}]}>
              New Password
            </Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your new password"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: theme.text}]}>
              Confirm Password
            </Text>
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              showPassword={showConfirmPassword}
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
          </View>

          {/* Password Requirements */}
          <View
            style={[
              styles.requirementsContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}>
            <Text style={[styles.requirementsTitle, {color: theme.text}]}>
              Password Requirements
            </Text>
            <RequirementItem
              text="At least 8 characters"
              isValid={password.length >= 8}
            />
            <RequirementItem
              text="One uppercase letter"
              isValid={/[A-Z]/.test(password)}
            />
            <RequirementItem
              text="One number"
              isValid={/[0-9]/.test(password)}
            />
            <RequirementItem
              text="Passwords match"
              isValid={password === confirmPassword && password.length > 0}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, {backgroundColor: theme.primary}]}
            onPress={handleSetPassword}
            activeOpacity={0.8}>
            <Icon
              name="checkmark-circle"
              size={20}
              color="#ffffff"
              style={styles.buttonIcon}
            />
            <Text style={styles.submitButtonText}>Set Password</Text>
          </TouchableOpacity>

          {/* Theme Toggle (for testing purposes)
          <TouchableOpacity
            style={[
              styles.themeToggle,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setIsDark(!isDark)}
            activeOpacity={0.7}>
            <Icon
              name={isDark ? 'sunny' : 'moon'}
              size={16}
              color={theme.textSecondary}
              style={styles.themeIcon}
            />
            <Text
              style={[styles.themeToggleText, {color: theme.textSecondary}]}>
              Switch to {isDark ? 'Light' : 'Dark'} Mode
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontFamily: 'System',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  requirementsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
  },
  themeIcon: {
    marginRight: 8,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SetNewPasswordScreen;
