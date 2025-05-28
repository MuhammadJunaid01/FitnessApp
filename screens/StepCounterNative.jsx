import React, { useEffect } from "react";
import { Text, View } from "react-native";
import useGoogleFitSteps from "../lib/hooks/useGoogleFitSteps";

const StepCounterNative = () => {
  const { isAuthorized, dailySteps, weeklySteps, requestPermission } =
    useGoogleFitSteps();
  console.log("App.js: isAuthorized:", isAuthorized);
  console.log("App.js: dailySteps:", dailySteps);
  console.log("weeklySteps:", weeklySteps);
  useEffect(() => {
    if (!isAuthorized) {
      requestPermission();
    }
  }, [isAuthorized, requestPermission]);
  return (
    <View>
      <Text>StepCounterNative</Text>
    </View>
  );
};

export default StepCounterNative;
