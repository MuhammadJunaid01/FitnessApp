import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons'; // Vector Icons
import {useHook} from '../hooks/ThemeContext';
import {signin} from '../lib/utils/apis';
import showToast from '../lib/utils/showToast';
type Props = NativeStackScreenProps<any, any>;
const LoginScreen: React.FC<Props> = ({navigation, route}) => {
  const {setUser} = useHook();
  const emailParam = route.params?.email ?? '';
  const passwordParam = route.params?.password ?? '';
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState(passwordParam);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isBiometricEnabled, setBiometricEnabled] = useState(false);

  // Check if device supports biometric authentication
  useEffect(() => {
    // Replace with a custom biometric handling library if required
    setIsBiometricSupported(false); // Adjust for platform support
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
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
        setUser(response.data);
        // navigation.replace('MainTabs');
      }
      // await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.log(error.message);
      Alert.alert('Login Failed', error.message);
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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchBiometricStatus = async () => {
        try {
          const biometricEnabled = await AsyncStorage.getItem(
            'biometricEnabled',
          );
          if (isActive && biometricEnabled) {
            setBiometricEnabled(biometricEnabled === 'true');
          }
        } catch (error) {
          console.error('Error fetching biometricEnabled:', error);
        }
      };

      fetchBiometricStatus();
      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor="#888"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#0a1a3a" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      {isBiometricSupported && isBiometricEnabled && (
        <TouchableOpacity style={styles.biometricButton} disabled={isLoading}>
          <Text style={styles.biometricButtonText}>
            Login with {biometricType}
          </Text>
          <Ionicons
            name={biometricType === 'FaceID' ? 'ios-scan' : 'finger-print'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      )}

      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ForgotPassword');
          }}>
          <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SignUp');
          }}>
          <Text style={styles.signupLink}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default LoginScreen;
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
    marginBottom: 30,
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
  biometricButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
    minHeight: 50,
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'white',
  },
  biometricButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  linksContainer: {
    alignItems: 'center',
  },
  forgotPasswordLink: {
    color: 'white',
    marginBottom: 10,
  },
  signupLink: {
    color: 'white',
  },
});
