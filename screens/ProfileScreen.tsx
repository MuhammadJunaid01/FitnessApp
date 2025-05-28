import auth from '@react-native-firebase/auth';
import React, {useContext, useState} from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {ThemeContext} from '../hooks/ThemeContext';

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const {isDark} = useContext(ThemeContext); // ✅ get dark mode
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);
  const currentUser = auth().currentUser;

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, authUser => {
  //     setUser(authUser);
  //     if (authUser?.displayName) {
  //       setName(authUser.displayName);
  //     }
  //   });
  //   return unsubscribe;
  // }, []);

  const handleUpdateName = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      await currentUser.updateProfile({
        displayName: name,
      });
      // await updateProfile(user, {displayName: name});
      Alert.alert('Success', 'Name updated!');
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const theme = isDark ? darkStyles : lightStyles; // ✅ choose theme

  return (
    <View style={theme.container}>
      <Text style={theme.title}>Edit Profile</Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={theme.input}
        placeholderTextColor={isDark ? '#ccc' : '#888'} // ✅ fix placeholder color
      />
      <TouchableOpacity style={theme.button} onPress={handleUpdateName}>
        <Text style={theme.buttonText}>
          {isLoading ? 'Saving...' : 'Save Name'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const baseStyles = {
  container: {flex: 1, padding: 20, justifyContent: 'center'},
  title: {fontSize: 28, fontWeight: 'bold', marginBottom: 20},
  input: {padding: 15, borderRadius: 8, marginBottom: 20},
  button: {padding: 15, borderRadius: 8, alignItems: 'center'},
  buttonText: {fontWeight: 'bold'},
};

const lightStyles = StyleSheet.create({
  ...baseStyles,
  container: {...baseStyles.container, backgroundColor: '#f5f5f5'},
  title: {...baseStyles.title, color: '#0a1a3a'},
  input: {...baseStyles.input, backgroundColor: 'white', color: 'black'},
  button: {...baseStyles.button, backgroundColor: '#0a1a3a'},
  buttonText: {...baseStyles.buttonText, color: 'white'},
});

const darkStyles = StyleSheet.create({
  ...baseStyles,
  container: {...baseStyles.container, backgroundColor: '#0a1a3a'},
  title: {...baseStyles.title, color: 'white'},
  input: {...baseStyles.input, backgroundColor: 'white', color: 'black'},
  button: {...baseStyles.button, backgroundColor: 'white'},
  buttonText: {...baseStyles.buttonText, color: '#0a1a3a'},
});
