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
import {signup} from '../lib/utils/apis';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import showToast from '../lib/utils/showToast';

type SignUpScreenNavigationProp = NativeStackScreenProps<any, any>;

export default function SignUpScreen({navigation}: SignUpScreenNavigationProp) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        navigation.replace('Login', {email, password});
        showToast({
          type: 'success',
          message: 'Sign Up Successful! Please Login.',
        });
        // Alert.alert(
        //   'Verify Email',
        //   'A verification email has been sent. Please verify before logging in.',
        // );
      }
      // const userCred = await auth().createUserWithEmailAndPassword(
      //   email,
      //   password,
      // );
      // await userCred.user.updateProfile({displayName: name});

      // await userCred.user.sendEmailVerification();
      // Alert.alert(
      //   'Verify Email',
      //   'A verification email has been sent. Please verify before logging in.',
      // );

      // await auth().signOut();
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={'black'}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholderTextColor={'black'}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        placeholderTextColor={'black'}
      />

      <TouchableOpacity
        style={styles.button}
        disabled={isLoading}
        onPress={handleSignUp}>
        {isLoading ? (
          <ActivityIndicator color={'white'} />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1a3a',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: 'black',
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontWeight: 'bold'},
  link: {color: '#ddd', textAlign: 'center', marginTop: 20},
});
