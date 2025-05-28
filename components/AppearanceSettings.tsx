import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  isDarkMode: boolean;
  onThemeChange: (isDarkMode: boolean) => void;
};

const AppearanceSettings: React.FC<Props> = ({isDarkMode, onThemeChange}) => {
  const theme = {
    background: isDarkMode ? '#0a1a3a' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    cardBackground: isDarkMode ? '#162442' : '#f8f9fa',
    borderColor: isDarkMode ? '#333' : '#eaeaea',
    iconColor: isDarkMode ? '#81b0ff' : '#4CAF50',
  };

  const toggleTheme = () => {
    if (onThemeChange) {
      onThemeChange(!isDarkMode);
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
      <Text style={[styles.sectionTitle, {color: theme.text}]}>Appearance</Text>
      <View style={[styles.row, {borderBottomColor: theme.borderColor}]}>
        <View style={styles.rowLeft}>
          <Ionicons
            name={isDarkMode ? 'moon' : 'sunny'}
            size={24}
            color={theme.iconColor}
          />
          <Text style={[styles.label, {color: theme.text}]}>Dark Mode</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          thumbColor={isDarkMode ? '#fff' : '#fff'}
          trackColor={{false: '#767577', true: '#81b0ff'}}
          ios_backgroundColor="#3e3e3e"
          style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
          accessibilityLabel="Toggle dark mode"
        />
      </View>
    </View>
  );
};

export default AppearanceSettings;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginLeft: 12,
  },
});
