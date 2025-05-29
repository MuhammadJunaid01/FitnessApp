import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {IGoal, IUserPhysicalStats} from '../lib/interfaces';
import {hasIncompleteGoals, hasIncompletePresences} from '../lib/utils';

export interface ICheckPresencesGoal {
  presences: IUserPhysicalStats;
  isDark: boolean;
  goal: IGoal;
  navigation: any; // You might want to type this more specifically based on your navigation setup
}

const CheckPresencesGoal: React.FC<ICheckPresencesGoal> = ({
  presences,
  isDark,
  goal,
  navigation,
}) => {
  // Check if any presence value is 0 or undefined

  const handleSetPreferences = () => {
    // Navigate to preferences screen or handle preference setting
    console.log('Navigate to set preferences');
    navigation.navigate('Settings');
  };

  const handleSetGoals = () => {
    // Navigate to goals screen or handle goal setting
    console.log('Navigate to set goals');
    navigation.navigate('SetGoal');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a1a3a' : '#ffffff',
      padding: 20,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 30,
      textAlign: 'center',
    },
    warningContainer: {
      backgroundColor: isDark ? '#1a2a4a' : '#f5f5f5',
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
      width: '100%',
    },
    warningText: {
      color: isDark ? '#ffffff' : '#000000',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 15,
    },
    button: {
      backgroundColor: isDark ? '#2a4a8a' : '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginVertical: 8,
      width: '100%',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    successContainer: {
      backgroundColor: isDark ? '#1a3a2a' : '#e8f5e8',
      padding: 20,
      borderRadius: 12,
      width: '100%',
    },
    successText: {
      color: isDark ? '#4ade80' : '#16a34a',
      fontSize: 18,
      textAlign: 'center',
      fontWeight: '600',
    },
    statsContainer: {
      marginTop: 20,
      backgroundColor: isDark ? '#1a2a4a' : '#f5f5f5',
      padding: 15,
      borderRadius: 8,
      width: '100%',
    },
    statsText: {
      color: isDark ? '#ffffff' : '#000000',
      fontSize: 14,
      marginBottom: 5,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Health & Fitness Setup</Text>

        {hasIncompletePresences(presences) && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Your physical stats are incomplete. Please set your preferences to
              get personalized recommendations.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSetPreferences}>
              <Text style={styles.buttonText}>Set Your Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasIncompleteGoals(goal) && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Your fitness goals are not set. Please define your daily and
              weekly goals to track your progress.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleSetGoals}>
              <Text style={styles.buttonText}>Set Your Goals</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CheckPresencesGoal;
