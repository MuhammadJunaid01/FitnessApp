/* eslint-disable react/no-unstable-nested-components */
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import {
//   Entypo,
//   Ionicons,
//   MaterialCommunityIcons,
// } from 'react-native-vector-icons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// Configure GoogleSignin
GoogleSignin.configure({
  webClientId:
    '316480721164-qk54st1cb8mkqadub2qsiaff1l5tt4gh.apps.googleusercontent.com', // Get from Firebase console
});

interface User {
  email: string;
  displayName: string;
  photoURL: string | null;
}

const WelcomeScreen: React.FC = () => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Handle user state changes
  const onAuthStateChanged = useCallback(
    (userInfo: any) => {
      if (userInfo) {
        setUser({
          email: userInfo.email,
          displayName: userInfo.displayName,
          photoURL: userInfo.photoURL,
        });
      } else {
        setUser(null);
      }
      if (initializing) setInitializing(false);
    },
    [initializing],
  );

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribe on unmount
  }, [onAuthStateChanged]);

  const signInWithGoogle = async () => {
    try {
      // Get the user ID token
      await GoogleSignin.hasPlayServices();
      const {idToken} = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in with credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.log('Google Sign-In Error:', error);
    }
  };

  // Custom heart logo component using Vector Icons
  const HeartLogo = () => (
    <View style={styles.logoContainer}>
      <View style={styles.logoOverlay}>
        <MaterialCommunityIcons
          name="heart"
          size={60}
          color="#4285F4"
          style={styles.blueHeart}
        />
        <MaterialCommunityIcons
          name="heart"
          size={60}
          color="#EA4335"
          style={styles.redHeart}
        />
        <MaterialCommunityIcons
          name="heart"
          size={60}
          color="#34A853"
          style={styles.greenHeart}
        />
        <MaterialCommunityIcons
          name="heart"
          size={60}
          color="#FBBC05"
          style={[styles.yellowHeart, {opacity: 0}]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      {/* Help icon in corner */}
      <View style={styles.helpIconContainer}>
        <Ionicons name="help-circle-outline" size={28} color="#AAAAAA" />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <HeartLogo />

        <Text style={styles.titleText}>
          Coaching you to a healthier and more active life
        </Text>

        {/* User profile section */}
        <View style={styles.profileSection}>
          {user?.photoURL ? (
            <Image source={{uri: user.photoURL}} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitials}>MJ</Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.displayName || 'M Junaid'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'm.junaidbkh2020@gmail.com'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#AAAAAA" />
          </View>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={signInWithGoogle}>
          <Text style={styles.continueButtonText}>
            Continue as {user?.displayName || 'M Junaid'}
          </Text>
        </TouchableOpacity>

        {/* Terms section */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By continuing, you agree to the{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>.
          </Text>
          <Text style={styles.termsText}>
            Note: The Google{' '}
            <Text style={styles.termsLink}>privacy policy</Text> describes how
            data is handled in this service. Fit sends diagnostics data to
            Google to help improve the app.
          </Text>
        </View>
      </View>

      {/* Bottom indicator */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginHorizontal: 4,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginRight: 2,
  },
  signalGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    marginRight: 6,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 1,
    backgroundColor: '#FFFFFF',
  },
  signalBar1: {
    height: 4,
  },
  signalBar2: {
    height: 7,
  },
  signalBar3: {
    height: 10,
  },
  signalBar4: {
    height: 13,
  },
  batteryText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  helpIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoOverlay: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  redHeart: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.7,
    transform: [{scale: 0.75}, {rotate: '-10deg'}],
  },
  blueHeart: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.7,
    transform: [{scale: 0.75}, {rotate: '5deg'}],
  },
  greenHeart: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.7,
    transform: [{scale: 0.75}, {rotate: '20deg'}],
  },
  yellowHeart: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  titleText: {
    color: '#CCCCCC',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 80,
    lineHeight: 38,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  profileImagePlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  profileEmail: {
    color: '#999999',
    fontSize: 14,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3a559f',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
  termsSection: {
    width: '100%',
  },
  termsText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  termsLink: {
    color: '#4285F4',
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 8,
  },
});

export default WelcomeScreen;
