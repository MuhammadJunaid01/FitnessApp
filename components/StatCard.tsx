/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface StatCardProps {
  isDarkMode: boolean;
  iconName: string;
  value: number | string;
  label: string;
  cardStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
  valueStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const StatCard: React.FC<StatCardProps> = ({
  isDarkMode,
  iconName,
  value,
  label,
  cardStyle,
  iconColor = '#9b59b6',
  valueStyle,
  labelStyle,
}) => {
  return (
    <View
      style={[
        styles.statCard,
        cardStyle,
        isDarkMode && {backgroundColor: '#182b4d'},
      ]}>
      <Ionicons name={iconName} size={24} color={iconColor} />
      <View style={styles.statContent}>
        <Text
          style={[styles.statValue, isDarkMode && {color: '#fff'}, valueStyle]}>
          {value}
        </Text>
        <Text
          style={[styles.statLabel, isDarkMode && {color: '#bbb'}, labelStyle]}>
          {label.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});

export default StatCard;
