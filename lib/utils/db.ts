// import auth from '@react-native-firebase/auth';
// import firestore, {
//   FirebaseFirestoreTypes,
// } from '@react-native-firebase/firestore';

// import moment from 'moment';
// import {IStepData, IUserGoal, UserPreference} from '../interfaces';

// export const getThemePreference = async () => {
//   try {
//     const doc = await firestore().collection('theme').doc('preference').get();
//     if (doc.exists()) {
//       const data = doc.data(); // Retrieve the document data
//       if (data) {
//         const {darkMode} = data; // Extract the darkMode value
//         console.log('Dark Mode:', darkMode);
//         return darkMode;
//       }
//     } else {
//       console.log('No such document!');
//     }
//   } catch (error) {
//     console.error('Error reading theme preference:', error);
//   }
// };
// export const fetchSingleUserPreference = async (
//   userId: string,
// ): Promise<UserPreference | null> => {
//   try {
//     const snapshot = await firestore()
//       .collection('userPreferences')
//       .where('userId', '==', userId)
//       .limit(1) // Retrieve only the first matching document
//       .get();

//     if (snapshot.empty) {
//       console.warn(`No preference found for userId: ${userId}`);
//       return null;
//     }

//     const doc = snapshot.docs[0]; // Access the first document
//     const userPreference: UserPreference = {
//       id: doc.id, // Include the Firestore document ID if needed
//       ...doc.data(),
//     } as UserPreference;

//     console.log('Fetched User Preference:', userPreference);
//     return userPreference;
//   } catch (error) {
//     console.log('Error fetching user preference:', error);
//     // throw new Error('Failed to fetch user preference.');
//     return null;
//   }
// };
// export const getGoalByUserId = async (
//   userId: string,
// ): Promise<IUserGoal | null> => {
//   try {
//     const snapshot = await firestore()
//       .collection('goals')
//       .where('userId', '==', userId)
//       .limit(1) // Retrieve only the first matching document
//       .get();

//     if (snapshot.empty) {
//       console.warn(`No preference found for userId: ${userId}`);
//       return null;
//     }

//     const doc = snapshot.docs[0]; // Access the first document
//     const userGoal = {
//       ...(doc.data() as unknown as Omit<IUserGoal, 'id'>),
//       id: doc.id, // Include the Firestore document ID if needed
//     } as IUserGoal;

//     console.log('Fetched User Preference:', userGoal);
//     return userGoal;
//   } catch (error) {
//     console.log('Error fetching user preference:', error);
//     // throw new Error('Failed to fetch user preference.');
//     return null;
//   }
// };

// interface StepRecord {
//   date: FirebaseFirestoreTypes.Timestamp;
//   steps: IStepData;
// }

// export async function getStepDataByUserIdAndDateRange(
//   userId: string,
//   startDate: Date,
//   endDate: Date,
// ): Promise<IStepData[]> {
//   try {
//     const historyRef = firestore()
//       .collection('stepData')
//       .doc(userId)
//       .collection('history');

//     const querySnapshot = await historyRef
//       .where('date', '>=', firestore.Timestamp.fromDate(startDate))
//       .where('date', '<=', firestore.Timestamp.fromDate(endDate))
//       .orderBy('date', 'asc')
//       .get();

//     const stepRecords: IStepData[] = [];

//     querySnapshot.forEach(doc => {
//       const data = doc.data();
//       const {step, caloriesBurn, minutes, kilometers, userId} = data;

//       stepRecords.push({
//         step,
//         caloriesBurn,
//         minutes,
//         kilometers,
//         userId,
//         date: '',
//       });
//     });

//     return stepRecords;
//   } catch (error) {
//     console.error('Error fetching step data:', error);
//     return [];
//   }
// }

// export const getTodaySteps = async (
//   userId: string,
// ): Promise<IStepData | null> => {
//   if (!userId) return null;

//   try {
//     const docRef = firestore().collection('stepData').doc(userId);
//     const docSnapshot = await docRef.get();

//     if (!docSnapshot.exists || !docSnapshot.data()) {
//       console.log('No step data document found for user.');
//       return null;
//     }

//     const existingData = docSnapshot.data();
//     const dailySteps = existingData?.dailySteps || {};
//     const todayKey = moment().format('YYYY-MM-DD');

//     return dailySteps[todayKey] || null; // Return IStepData or null if no data for today
//   } catch (error) {
//     console.error("Error fetching today's step data:", error);
//     return null;
//   }
// };

// export const getWeeklySteps = async (userId: string) => {
//   if (!userId) return [];

//   try {
//     const docRef = firestore().collection('stepData').doc(userId);
//     const docSnapshot = await docRef.get();

//     if (!docSnapshot.exists || !docSnapshot.data()) {
//       console.log('No step data document found for user.');
//       return [];
//     }

//     const existingData = docSnapshot.data();
//     const dailySteps = existingData?.dailySteps || {};

//     // Generate the last 7 days (including today)
//     const lastWeek: IStepData[] = [];
//     for (let i = 0; i < 7; i++) {
//       const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
//       const stepData = dailySteps[date] || {};
//       lastWeek.push({
//         date,
//         step: stepData.step || 0,
//         caloriesBurn: stepData.caloriesBurn || 0,
//         minutes: stepData.minutes || 0,
//         kilometers: stepData.kilometers || 0,
//         userId: userId,
//       });
//     }

//     // Sort by date (most recent first)
//     return lastWeek.sort(
//       (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf(),
//     );
//   } catch (error) {
//     console.error('Failed to fetch weekly steps:', error);
//     return [];
//   }
// };
// export const checkDailyGoalAgainstCurrent = async (
//   dailyGoal: number,
// ): Promise<boolean> => {
//   const userCurrent = auth().currentUser;
//   if (!userCurrent) {
//     console.warn('No user logged in.');
//     return false;
//   }

//   try {
//     const docRef = firestore().collection('stepData').doc(userCurrent.uid);
//     const docSnapshot = await docRef.get();

//     if (!docSnapshot.exists || !docSnapshot.data()) {
//       console.log('No step data found for user.');
//       return false;
//     }

//     const dailySteps = docSnapshot.data()?.dailySteps || {};
//     const currentDayKey = moment().format('YYYY-MM-DD');
//     const currentStepData = dailySteps[currentDayKey];

//     if (!currentStepData || !currentStepData.step) {
//       console.log('No step data found for current day.');
//       return false;
//     }

//     const currentSteps = currentStepData.step;
//     return dailyGoal >= currentSteps;
//   } catch (error) {
//     console.error('Error fetching current day steps:', error);
//     return false;
//   }
// };
// interface IStepData {
//   step: number;
//   caloriesBurn: number;
//   kilometers: number;
//   minutes: number;
//   userId: string;
//   date: string;
// }

// export const saveStepsToFirestore = async (
//   userId: string,
//   newSteps: number,
//   caloriesBurned: number,
//   kilometers: number,
//   spendMinutes: number,
// ): Promise<void> => {
//   if (!userId) {
//     console.warn('No user ID provided. Skipping Firestore save.');
//     return;
//   }

//   try {
//     const docRef = firestore().collection('stepData').doc(userId);
//     const todayKey = moment().format('YYYY-MM-DD');

//     // Fetch existing document data
//     const docSnapshot = await docRef.get();
//     const existingData =
//       docSnapshot.exists() && docSnapshot.data()
//         ? docSnapshot.data()
//         : {dailySteps: {}, totalSteps: 0};

//     // Initialize daily steps
//     const dailySteps = existingData?.dailySteps || {};
//     const previousStepData: IStepData = dailySteps[todayKey] || {
//       step: 0,
//       caloriesBurn: 0,
//       kilometers: 0,
//       minutes: 0,
//       userId,
//       date: new Date().toISOString(),
//     };

//     // Update today's step data by accumulating new values
//     const updatedStepData: IStepData = {
//       step: previousStepData.step + newSteps,
//       caloriesBurn: previousStepData.caloriesBurn + caloriesBurned,
//       kilometers: previousStepData.kilometers + kilometers,
//       userId,
//       date: previousStepData.date, // Preserve the original date
//       minutes: previousStepData.minutes + spendMinutes,
//     };

//     // Update Firestore document
//     await docRef.set(
//       {
//         dailySteps: {
//           ...dailySteps,
//           [todayKey]: updatedStepData,
//         },
//         totalSteps: firestore.FieldValue.increment(newSteps), // Increment total steps
//         lastUpdated: firestore.FieldValue.serverTimestamp(), // Update timestamp
//       },
//       {merge: true},
//     );

//     console.log(
//       `Step data for ${todayKey} saved/updated successfully in Firestore.`,
//     );
//   } catch (error) {
//     console.error('Error updating steps in Firestore:', error);
//     throw new Error(
//       `Unable to save/update step data for ${moment().format(
//         'YYYY-MM-DD',
//       )}. Please try again.`,
//     );
//   }
// };
import axios from 'axios';
const BASE_URL = 'https://fitness-tracker-dusky-eight.vercel.app/'; // Use your server's URL
// const BASE_URL = 'http://192.168.170.76:5000'; // Use your server's URL

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`, // Base URL for all requests
  timeout: 10000, // Timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
