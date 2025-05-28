import React, {useCallback, useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const {width} = Dimensions.get('window');

/**
 * SelectableTabs Component
 *
 * @param {Object} props
 * @param {string[]} props.data - Array of tab names (e.g. ["Day", "Week", "Month"])
 * @param {(index: number) => void} props.onChange - Callback function when tab changes, receives index
 * @param {boolean} props.isDarkMode - Whether dark mode is enabled
 * @param {number} [props.initialTab=0] - Initial selected tab index
 * @param {Object} [props.style] - Additional styles for the container
 */
type SelectableTabsProps = {
  data: string[];
  onChange: (index: number) => void;
  isDarkMode?: boolean;
  initialTab?: number;
  style?: StyleProp<ViewStyle>;
};

const SelectableTabs = ({
  data = [],
  onChange,
  isDarkMode = false,
  initialTab = 0,
  style = {},
}: SelectableTabsProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialTab);
  const animatedValue = useState(new Animated.Value(initialTab))[0];

  const animateToTab = useCallback(
    (index: any) => {
      Animated.spring(animatedValue, {
        toValue: index,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    },
    [animatedValue],
  );
  // Handle initial tab selection
  useEffect(() => {
    setActiveTabIndex(initialTab);
    animateToTab(initialTab);
  }, [animateToTab, initialTab]);

  const handleTabPress = (index: any) => {
    if (index !== activeTabIndex) {
      setActiveTabIndex(index);
      animateToTab(index);

      if (onChange) {
        onChange(index);
      }
    }
  };

  // Determine theme colors
  const theme = {
    background: isDarkMode ? '#0a1a3a' : '#FFFFFF',
    activeTabColor: isDarkMode ? '#FFFFFF' : '#000000',
    inactiveTabColor: isDarkMode
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(0, 0, 0, 0.5)',
    activeIndicatorColor: '#00E096', // Green color for the active indicator
  };

  // Calculate the tab width for the animated indicator
  const tabWidth = width / data.length;

  // Position animation for the indicator
  const indicatorTranslate = animatedValue.interpolate({
    inputRange: [0, data.length - 1],
    outputRange: [0, tabWidth * (data.length - 1)],
  });

  return (
    <View
      style={[styles.container, {backgroundColor: theme.background}, style]}>
      <View style={styles.tabsContainer}>
        {data.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => handleTabPress(index)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTabIndex === index
                      ? theme.activeTabColor
                      : theme.inactiveTabColor,
                },
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Animated indicator line */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth / 3, // Make indicator about 1/3 the width of the tab
            backgroundColor: theme.activeIndicatorColor,
            transform: [{translateX: indicatorTranslate}],
            left: tabWidth / 3, // Center the indicator in the tab
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  indicator: {
    height: 3,
    position: 'absolute',
    bottom: 0,
    borderRadius: 3,
  },
});

export default SelectableTabs;
