import {Platform, ToastAndroid} from 'react-native';
import Toast from 'react-native-toast-message';
const showToast = ({
  type,
  message,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
}) => {
  if (Platform.OS !== 'ios') {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  } else {
    Toast.show({
      type: type,
      text2: message,
    });
  }
};
export default showToast;
