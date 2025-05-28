import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';

export default function StepTestScreen() {
  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    const setup = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setAvailable(isAvailable);
      console.log('📲 Pedometer available:', isAvailable);

      if (!isAvailable) return;

      const sub = Pedometer.watchStepCount(result => {
        console.log('👣 Counted steps:', result.steps);
        setSteps(result.steps);
      });

      return () => sub && sub.remove();
    };

    setup();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Counter Test</Text>
      <Text style={styles.text}>Pedometer Available: {String(available)}</Text>
      <Text style={styles.text}>Steps Counted: {steps}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1a3a' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  text: { fontSize: 18, color: 'white', marginVertical: 5 },
});
