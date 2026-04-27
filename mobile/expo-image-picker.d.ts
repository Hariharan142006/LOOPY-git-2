declare module 'expo-image-picker' {
  export enum MediaTypeOptions {
    All = 'All',
    Images = 'Images',
    Videos = 'Videos',
  }

  export interface ImagePickerResult {
    canceled: boolean;
    assets?: Array<{
      uri: string;
      width: number;
      height: number;
      type?: 'image' | 'video';
      fileName?: string;
      fileSize?: number;
    }>;
  }

  export function launchImageLibraryAsync(options?: any): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: any): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ status: string }>;
  export function requestCameraPermissionsAsync(): Promise<{ status: string }>;
}
