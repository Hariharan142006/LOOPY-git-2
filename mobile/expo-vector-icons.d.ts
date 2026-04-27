declare module '@expo/vector-icons' {
  import { ReactNode } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
    onPress?: () => void;
  }

  export const Ionicons: (props: IconProps) => ReactNode;
  export const MaterialIcons: (props: IconProps) => ReactNode;
  export const FontAwesome: (props: IconProps) => ReactNode;
  export const Feather: (props: IconProps) => ReactNode;
  export const MaterialCommunityIcons: (props: IconProps) => ReactNode;
  export const Entypo: (props: IconProps) => ReactNode;
  export const AntDesign: (props: IconProps) => ReactNode;
  export const SimpleLineIcons: (props: IconProps) => ReactNode;
}
