import {Ionicons} from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {Pedometer} from 'expo-sensors';
import {doc, getDoc, setDoc} from 'firebase/firestore';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {auth, db} from '../firebase.client';
import {ThemeContext} from '../ThemeContext';

const StepCounter = () => {
  const [dailyGoal, setDailyGoal] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);
  const {isDark} = useContext(ThemeContext);
  const [isLoadingGoal, setIsLoadingGoal] = useState(false);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [isFakeCounterActive, setIsFakeCounterActive] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const userId = auth.currentUser?.uid;
  const [newGoal, setNewGoal] = useState(null);
  const [isSettingNewGoal, setIsSettingNewGoal] = useState(false);
  // Water tracking state
  const [waterIntake, setWaterIntake] = useState(0);

  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  const fakeCounterIntervalRef = useRef(null);

  const checkAndRequestPermissions = async () => {
    try {
      const {status} = await Pedometer.getPermissionsAsync();
      if (status !== 'granted') {
        const permissionResponse = await Pedometer.requestPermissionsAsync();
        if (permissionResponse.status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Activity Recognition permission is needed to track your steps.',
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Failed to obtain permissions.');
      return false;
    }
  };

  const startStepCounting = () => {
    if (isLoadingGoal || dailyGoal === 0) {
      return null;
    }
    const subscription = Pedometer.watchStepCount(result => {
      if (result?.steps !== undefined) {
        updateStepData(result.steps);
        if (result.steps >= dailyGoal) {
          bottomSheetRef.current?.expand(); // Open bottom sheet when goal is exceeded
        }
      }
    });
    return subscription;
  };

  // const startFakeStepCounter = useCallback(() => {
  //   // console.log("isLoadingGoal", isLoadingGoal);
  //   // if (isLoadingGoal && dailyGoal === 0) {
  //   //   return;
  //   // }
  //   fakeCounterIntervalRef.current = setInterval(() => {
  //     setStepCount((prev) => {
  //       const newStepCount = prev + 1;
  //       updateStepData(newStepCount);
  //       if (newStepCount >= dailyGoal) {
  //         // bottomSheetRef.current?.present();
  //         bottomSheetRef.current?.expand();
  //         clearInterval(fakeCounterIntervalRef.current);
  //       }
  //       return newStepCount;
  //     });
  //   }, 1000);
  //   setIsFakeCounterActive(true);
  // }, [dailyGoal]);
  const startFakeStepCounter = useCallback(() => {
    if (isLoadingGoal || dailyGoal === 0) {
      return;
    }
    fakeCounterIntervalRef.current = setInterval(() => {
      setStepCount(prev => {
        const newStepCount = prev + 1;
        updateStepData(newStepCount);
        if (newStepCount >= dailyGoal) {
          bottomSheetRef.current?.expand();
          clearInterval(fakeCounterIntervalRef.current);
        }
        return newStepCount;
      });
    }, 1000);
    setIsFakeCounterActive(true);
  }, [dailyGoal, isLoadingGoal]);

  const stopFakeStepCounter = () => {
    clearInterval(fakeCounterIntervalRef.current);
    setIsFakeCounterActive(false);
  };

  const updateStepData = steps => {
    const distanceWalked = steps * 0.000762; // Avg step length: 0.762 meters
    const activeTimeMinutes = steps / 100; // Approx. 100 steps per minute
    const caloriesBurned = steps * 0.04; // Approx. 0.04 calories per step

    setStepCount(steps);
    setDistance(distanceWalked);
    setActiveTime(activeTimeMinutes);
    setCalories(caloriesBurned);
  };
  const saveToFirestore = async () => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'stepData', userId, 'dailyData', today);
      await setDoc(docRef, {
        stepCount,
        calories,
        activeTime,
        distance,
        goal: dailyGoal,
        waterIntake, // Add water intake to Firestore
      });
    } catch (error) {
      setError('Error saving to Firestore.');
    }
  };

  useEffect(() => {
    const initializePedometer = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        if (!isAvailable) {
          startFakeStepCounter();
        } else {
          const hasPermission = await checkAndRequestPermissions();
          if (!hasPermission) return;

          const subscription = startStepCounting();
          return () => subscription && subscription.remove();
        }
      } catch (error) {
        setError('Failed to initialize pedometer.');
      }
    };

    initializePedometer();
    return () => stopFakeStepCounter();
  }, [dailyGoal]);

  useEffect(() => {
    saveToFirestore();
  }, [stepCount, calories, activeTime, distance, dailyGoal, waterIntake]);

  const loadGoal = async () => {
    try {
      const storedGoal = await AsyncStorage.getItem('dailyGoal');
      const storedWaterIntake = await AsyncStorage.getItem('waterIntake');

      if (storedGoal) {
        setDailyGoal(parseInt(storedGoal));
      }

      if (storedWaterIntake) {
        setWaterIntake(parseInt(storedWaterIntake));
      }
    } catch (error) {
      setError('Error loading data.');
    }
  };

  const fetchDailyGoal = useCallback(async userId => {
    try {
      const docRef = doc(db, 'dailyGoal', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Daily Goal:', docSnap.data().dailyGoal);
        const goal = parseInt(docSnap.data().dailyGoal);
        setDailyGoal(goal);
        // return docSnap.data().dailyGoal;
      } else {
        console.warn('Document does not exist for userId:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching daily goal:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDailyGoal(userId);
    }, []),
  );

  const handleStartSettingGoal = () => {
    setIsSettingNewGoal(true);
  };

  const progressPercentage = Math.min((stepCount / dailyGoal) * 100, 100);

  // const handleSave = async () => {
  //   if (!newGoal || isNaN(newGoal)) {
  //     Alert.alert("Invalid goal", "Please enter a valid number.");
  //     return;
  //   }
  //   await AsyncStorage.setItem("dailyGoal", newGoal);
  //   setDailyGoal(newGoal);
  //   setNewGoal(null);
  //   bottomSheetRef.current?.close();
  // };
  const handleSave = async () => {
    if (!newGoal || isNaN(newGoal)) {
      Alert.alert('Invalid goal', 'Please enter a valid number.');
      return;
    }

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('dailyGoal', newGoal);
      setDailyGoal(newGoal);

      // Save to Firebase Firestore

      await setDoc(
        doc(db, 'dailyGoal', userId),
        {dailyGoal: newGoal},
        {merge: true},
      );

      // Clear the input and close the bottom sheet
      setNewGoal(null);
      bottomSheetRef.current?.close();
    } catch (error) {
      Alert.alert('Error', 'Failed to save the daily goal. Please try again.');
    }
  };
  // Add 250ml of water to daily tracking
  const handleAddWater = async () => {
    const newIntake = waterIntake + 250;
    setWaterIntake(newIntake);
    await AsyncStorage.setItem('waterIntake', newIntake.toString());

    // Optional: Show a small confirmation message
    Alert.alert('Water Added', '250ml of water added to your daily intake!');
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏃 I’ve walked ${stepCount} steps today! That's ${distance.toFixed(
          2,
        )} km!`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <View
      contentContainerStyle={[
        styles.scrollContainer,
        isDark && {backgroundColor: '#0d1b30'},
      ]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, isDark && {color: '#fff'}]}>
          Activity Tracker
        </Text>
        <Text style={[styles.dateText, isDark && {color: '#aaa'}]}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={isDark ? 'orange' : 'red'}
          />
          <Text style={[styles.errorText, isDark && {color: 'orange'}]}>
            {error}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.progressContainer,
          isDark && {backgroundColor: '#182b4d'},
        ]}>
        <View style={styles.circleContainer}>
          <View
            style={[styles.outerCircle, isDark && {borderColor: '#2c3e50'}]}>
            <View style={styles.progressCircleContainer}>
              <View
                style={[
                  styles.progressCircle,
                  {width: `${progressPercentage}%`},
                  {
                    backgroundColor:
                      progressPercentage >= 100 ? '#4cd964' : '#3498db',
                  },
                ]}
              />
            </View>
            <View style={styles.innerCircle}>
              {isLoadingGoal ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text style={[styles.stepCountText]}>
                    {stepCount.toLocaleString()}
                  </Text>
                  <Text style={[styles.stepsLabel]}>STEPS</Text>
                  <Text style={[styles.goalText]}>
                    Goal: {dailyGoal.toLocaleString()}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, isDark && {backgroundColor: '#182b4d'}]}>
          <Ionicons name="flame" size={24} color="#ff7f50" />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, isDark && {color: '#fff'}]}>
              {calories.toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, isDark && {color: '#bbb'}]}>
              CALORIES
            </Text>
          </View>
        </View>

        <View style={[styles.statCard, isDark && {backgroundColor: '#182b4d'}]}>
          <Ionicons name="location" size={24} color="#3498db" />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, isDark && {color: '#fff'}]}>
              {distance?.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, isDark && {color: '#bbb'}]}>
              KILOMETERS
            </Text>
          </View>
        </View>

        <View style={[styles.statCard, isDark && {backgroundColor: '#182b4d'}]}>
          <Ionicons name="timer" size={24} color="#9b59b6" />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, isDark && {color: '#fff'}]}>
              {activeTime?.toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, isDark && {color: '#bbb'}]}>
              MINUTES
            </Text>
          </View>
        </View>

        <View style={[styles.statCard, isDark && {backgroundColor: '#182b4d'}]}>
          <Ionicons name="trending-up" size={24} color="#2ecc71" />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, isDark && {color: '#fff'}]}>
              {(stepCount / 1000)?.toFixed(1)}K
            </Text>
            <Text style={[styles.statLabel, isDark && {color: '#bbb'}]}>
              AVG / HOUR
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.detailCard, isDark && {backgroundColor: '#182b4d'}]}>
        <Text style={[styles.detailTitle, isDark && {color: '#fff'}]}>
          Daily Progress
        </Text>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              isDark && {backgroundColor: '#2c3e50'},
            ]}>
            <View
              style={[
                styles.progressFill,
                {width: `${progressPercentage}%`},
                progressPercentage >= 100
                  ? {backgroundColor: '#4cd964'}
                  : progressPercentage >= 75
                  ? {backgroundColor: '#3498db'}
                  : progressPercentage >= 50
                  ? {backgroundColor: '#f39c12'}
                  : {backgroundColor: '#e74c3c'},
              ]}
            />
          </View>
          <Text style={[styles.progressText, isDark && {color: '#bbb'}]}>
            {progressPercentage.toFixed(0)}% of daily goal
          </Text>
        </View>
      </View>

      {/* Water Intake Tracking Card */}
      <View style={[styles.detailCard, isDark && {backgroundColor: '#182b4d'}]}>
        <Text style={[styles.detailTitle, isDark && {color: '#fff'}]}>
          Water Intake Tracker
        </Text>

        <View style={styles.waterTrackerContainer}>
          <View style={styles.waterInfoContainer}>
            <Ionicons
              name="water"
              size={28}
              color={isDark ? '#3498db' : '#2980b9'}
              style={styles.waterIcon}
            />
            <Text style={[styles.waterAmount, isDark && {color: '#fff'}]}>
              {(waterIntake / 1000).toFixed(1)}L
            </Text>
            <Text style={[styles.waterSubtext, isDark && {color: '#bbb'}]}>
              of water today
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddWater}
            activeOpacity={0.7}
            style={[
              styles.waterButton,
              isDark && {backgroundColor: '#3498db'},
            ]}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.waterButtonText}>Add 250ml</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>📤 Share Progress</Text>
      </TouchableOpacity>
      {/* Bottom Sheet Modal */}
      <BottomSheet
        backdropComponent={props => <BottomSheetBackdrop {...props} />}
        ref={bottomSheetRef}
        snapPoints={['25%', '60%']}
        index={-1}
        backgroundStyle={{backgroundColor: isDark ? '#182b4d' : '#fff'}}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={[styles.congratulationText, isDark && styles.darkText]}>
            Congratulations!
          </Text>

          <Text style={[styles.messageText, isDark && styles.darkText]}>
            You've achieved your daily step goal of {dailyGoal} steps!
          </Text>

          {!isSettingNewGoal ? (
            <TouchableOpacity
              onPress={handleStartSettingGoal}
              activeOpacity={0.7}
              style={[styles.button, isDark && styles.darkButton]}>
              <Text
                style={[styles.buttonText, isDark && styles.darkButtonText]}>
                Want to set a new goal?
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                value={newGoal}
                onChangeText={setNewGoal}
                placeholder="Set new goal"
                placeholderTextColor={isDark ? 'white' : 'gray'}
                keyboardType="numeric"
                style={[styles.input, isDark && styles.darkInput]}
              />
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.7}
                style={[styles.button, isDark && styles.darkButton]}>
                <Text
                  style={[styles.buttonText, isDark && styles.darkButtonText]}>
                  Save New Goal
                </Text>
              </TouchableOpacity>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  bottomSheetContent: {padding: 16, alignItems: 'center'},
  modalMessage: {fontSize: 16, textAlign: 'center', marginTop: 10},
  shareButton: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginLeft: 8,
  },
  progressContainer: {
    borderRadius: 20,
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 18,
    borderColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircleContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  progressCircle: {
    position: 'absolute',
    height: '100%',
    left: 0,
    backgroundColor: '#3498db',
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCountText: {
    fontSize: 36,
    fontWeight: '700',
    color: 'black',
  },
  stepsLabel: {
    fontSize: 14,
    color: 'black',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  goalText: {
    fontSize: 14,
    color: 'black',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    letterSpacing: 0.5,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ecf0f1',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'right',
  },
  bottomSheetContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  congratulationText: {
    fontSize: 18,
    fontWeight: '500',
  },
  darkText: {
    color: 'white',
  },
  messageText: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 8,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkButton: {
    backgroundColor: '#4cd964',
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
  },
  darkButtonText: {
    color: 'white',
  },
  input: {
    width: '80%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderColor: 'black',
    borderWidth: 1,
    marginTop: 20,
    borderRadius: 8,
    color: 'black',
  },
  darkInput: {
    borderColor: '#4cd964',
    color: 'white',
  },
  // Water tracking styles
  waterTrackerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  waterInfoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  waterIcon: {
    marginBottom: 5,
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  waterSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  waterButton: {
    backgroundColor: '#2980b9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  waterButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default StepCounter;
