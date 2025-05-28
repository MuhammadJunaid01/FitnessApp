import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // or MaterialIcons, FontAwesome, etc.

interface SelectableComponentProps {
  isDarkMode: boolean;
  data: string[]; // name of the week
  selectedVal: string;
  onSelect: (val: string) => void;
  title?: string; // optional title
}

const SelectableComponent: React.FC<SelectableComponentProps> = ({
  isDarkMode,
  data,
  selectedVal,
  onSelect,
  title = 'Select an option', // default title
}) => {
  const themeStyles = createThemeStyles(isDarkMode);

  return (
    <View style={[styles.container, themeStyles.container, {flex: 1}]}>
      <Text style={[styles.title, themeStyles.title]}>{title} </Text>

      <View style={styles.listContainer}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.itemContainer,
              selectedVal === item
                ? [styles.selectedItem, themeStyles.selectedItem]
                : [styles.unselectedItem, themeStyles.unselectedItem],
            ]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}>
            <Text style={[styles.itemText, themeStyles.itemText]}>{item}</Text>

            {selectedVal === item && (
              <View style={[styles.iconContainer, themeStyles.iconContainer]}>
                <Icon
                  name="checkmark-circle"
                  size={24}
                  color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedVal && (
        <View style={[styles.selectedContainer, themeStyles.selectedContainer]}>
          <Text style={[styles.selectedLabel, themeStyles.selectedLabel]}>
            Selected:{' '}
            <Text style={[styles.selectedValue, themeStyles.selectedValue]}>
              {selectedVal}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const createThemeStyles = (isDarkMode: boolean) => {
  return StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#0a1a3a' : '#FFFFFF',
    },
    title: {
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
    },
    selectedItem: {
      backgroundColor: isDarkMode
        ? 'rgba(96, 165, 250, 0.2)'
        : 'rgba(59, 130, 246, 0.1)',
      borderColor: isDarkMode ? '#60A5FA' : '#3B82F6',
    },
    unselectedItem: {
      backgroundColor: isDarkMode
        ? 'rgba(75, 85, 99, 0.3)'
        : 'rgba(243, 244, 246, 0.8)',
      borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
    },
    itemText: {
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
    },
    iconContainer: {
      backgroundColor: isDarkMode
        ? 'rgba(96, 165, 250, 0.2)'
        : 'rgba(59, 130, 246, 0.1)',
    },
    selectedContainer: {
      backgroundColor: isDarkMode
        ? 'rgba(31, 41, 55, 0.5)'
        : 'rgba(243, 244, 246, 0.8)',
      borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
    },
    selectedLabel: {
      color: isDarkMode ? '#D1D5DB' : '#6B7280',
    },
    selectedValue: {
      color: isDarkMode ? '#60A5FA' : '#3B82F6',
    },
  });
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  listContainer: {
    gap: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedItem: {
    // Theme-specific styles applied via themeStyles
  },
  unselectedItem: {
    // Theme-specific styles applied via themeStyles
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedLabel: {
    fontSize: 14,
  },
  selectedValue: {
    fontWeight: '600',
  },
});

export default SelectableComponent;
