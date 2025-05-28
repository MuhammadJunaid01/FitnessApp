import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ActivityHeaderProps = {
  title: string;
  onBackPress: () => void;
  onAddPress: () => void;
  onMenuPress: () => void;
  isDarkMode: boolean;
};

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  title,
  onBackPress,
  onAddPress,
  onMenuPress,
  isDarkMode,
}) => {
  // Colors based on theme
  const theme = {
    background: isDarkMode ? '#0a1a3a' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#000000',
  };

  return (
    <View style={[styles.header, {backgroundColor: theme.background}]}>
      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity> */}

      <Text style={[styles.headerTitle, {color: theme.text}]}>{title}</Text>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          accessibilityLabel="Add activity">
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          accessibilityLabel="More options">
          <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 16,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addButton: {
    padding: 4,
    marginLeft: 16,
  },
  menuButton: {
    padding: 4,
    marginLeft: 16,
  },
});

export default ActivityHeader;
