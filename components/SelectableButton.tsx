import {styles} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/BottomSheetFlashList';
import {Text, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-vector-icons/Icon';

interface SelectableButtonProps {
  label: string;
  value: string;
  onPress: () => void;
  isDarkMode: boolean;
  iconName: string;
}

const SelectableButton: React.FC<SelectableButtonProps> = ({
  label,
  value,
  onPress,
  isDarkMode,
  iconName,
}) => {
  const theme = {
    backgroundColor: isDarkMode ? '#1e3a8a' : '#f8fafc',
    borderColor: isDarkMode ? '#374151' : '#e2e8f0',
    textColor: isDarkMode ? '#ffffff' : '#1e293b',
    placeholderColor: isDarkMode ? '#9ca3af' : '#64748b',
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, {color: theme.textColor}]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: theme.backgroundColor,
            borderColor: theme.borderColor,
          },
        ]}
        onPress={onPress}>
        <Icon
          name={iconName}
          size={20}
          color={theme.textColor}
          style={styles.buttonIcon}
        />
        <Text
          style={[
            styles.selectButtonText,
            {
              color: value ? theme.textColor : theme.placeholderColor,
            },
          ]}>
          {value || `Select ${label.toLowerCase()}...`}
        </Text>
        <Icon
          name="keyboard-arrow-down"
          size={20}
          color={theme.textColor}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    </View>
  );
};
