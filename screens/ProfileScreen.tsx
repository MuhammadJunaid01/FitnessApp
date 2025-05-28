import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useHook} from '../hooks/ThemeContext';
import {IUpdateProfilePayload} from '../lib/interfaces';
import {updateProfile} from '../lib/utils/apis';
import showToast from '../lib/utils/showToast';

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const {isDark, user, setUser} = useHook();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAddress(user.address || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }

    return true;
  }, [name]);

  const handleUpdateProfile = useCallback(async () => {
    if (!user?._id || !validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const payload: IUpdateProfilePayload = {
        name: name.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      const response = await updateProfile(user._id, payload);

      if (response.success) {
        showToast({
          type: 'success',
          message: response.message || 'Profile updated successfully!',
        });
        setUser(response.data);
        Alert.alert('Success', 'Profile updated successfully!');
      }

      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
      showToast({
        type: 'error',
        message: error.message || 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  }, [address, name, phoneNumber, setUser, user, validateForm]);

  // Dynamic theme colors
  const colors = useMemo(() => {
    return {
      background: isDark ? '#0a1a3a' : '#f5f5f5',
      cardBackground: isDark ? '#1e3a5f' : 'white',
      text: isDark ? 'white' : '#0a1a3a',
      secondaryText: isDark ? '#b0c4de' : '#0a1a3a',
      border: isDark ? '#2d4a75' : '#e0e0e0',
      buttonPrimary: isDark ? '#4a90e2' : '#0a1a3a',
      buttonText: isDark ? 'white' : 'white',
      placeholder: isDark ? '#7a9cc6' : '#999',
      icon: isDark ? '#b0c4de' : '#0a1a3a',
    };
  }, [isDark]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="person" size={50} color={colors.icon} />
          <Text style={[styles.title, {color: colors.text}]}>Edit Profile</Text>
          <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
            Update your personal information
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Icon name="person-outline" size={20} color={colors.icon} />
              <Text style={[styles.label, {color: colors.secondaryText}]}>
                Full Name *
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          {/* Phone Number Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Icon name="phone" size={20} color={colors.icon} />
              <Text style={[styles.label, {color: colors.secondaryText}]}>
                Phone Number
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.placeholder}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          {/* Address Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Icon name="location-on" size={20} color={colors.icon} />
              <Text style={[styles.label, {color: colors.secondaryText}]}>
                Address
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your address"
              placeholderTextColor={colors.placeholder}
              value={address}
              onChangeText={setAddress}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: colors.buttonPrimary},
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleUpdateProfile}
          disabled={isLoading}>
          <View style={styles.buttonContent}>
            {isLoading ? (
              <Icon name="refresh" size={20} color={colors.buttonText} />
            ) : (
              <Icon name="save" size={20} color={colors.buttonText} />
            )}
            <Text style={[styles.buttonText, {color: colors.buttonText}]}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 15,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
