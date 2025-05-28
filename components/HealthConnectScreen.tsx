import {useEffect} from 'react';
import {Text, View} from 'react-native';
import useHealthConnect from './useHealthConnectSteps';

const HealthConnectScreen = () => {
  const {initializeHealthConnect, checkAvailability, sdkStatus, data} =
    useHealthConnect();
  console.log('data', data);
  useEffect(() => {
    // Initialize Health Connect on component mount
    initializeHealthConnect();
    checkAvailability();
  }, [checkAvailability, initializeHealthConnect]);

  return (
    <View style={{padding: 20}}>
      <Text style={{fontSize: 18, marginBottom: 10}}>
        SDK Status: {sdkStatus || 'Checking...'}
      </Text>
    </View>
  );
};

export default HealthConnectScreen;
