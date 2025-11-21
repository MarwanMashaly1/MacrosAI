import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export class ImageService {
  /**
   * Convert image URI to base64 string efficiently
   * This happens in the background and doesn't block the UI
   */
  async convertUriToBase64(uri: string): Promise<string> {
    if (!uri) {
      throw new Error("Image URI is required for conversion");
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`Image file does not exist at path: ${uri}`);
      }

      if (!fileInfo.isDirectory && fileInfo.size === 0) {
        throw new Error("Image file is empty");
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64 || base64.length === 0) {
        throw new Error("Image conversion resulted in empty base64 string");
      }
      return base64;
    } catch (error) {
      console.error("❌ Error converting image to base64:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to convert image to base64: ${String(error)}`);
    }
  }

  /**
   * Resize and compress image for faster API calls
   * This significantly reduces base64 size and API response time
   */
  async optimizeImage(uri: string): Promise<string> {
    if (!uri) {
      throw new Error("Image URI is required for optimization");
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`Image file does not exist at path: ${uri}`);
      }

      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        {
          compress: 0.6,
          format: SaveFormat.JPEG,
        }
      );

      if (!manipResult || !manipResult.uri) {
        console.warn(
          "⚠️ Image optimization returned invalid result, using original"
        );
        return uri;
      }
      return manipResult.uri;
    } catch (error) {
      console.error("❌ Error optimizing image:", error);
      console.warn("⚠️ Falling back to original image");
      return uri;
    }
  }

  /**
   * Complete workflow: optimize then convert to base64
   * This is what identify screen will use
   */
  async prepareImageForAI(uri: string): Promise<string> {
    if (!uri) {
      throw new Error("Image URI is required for AI preparation");
    }

    try {
      const optimizedUri = await this.optimizeImage(uri);

      const base64 = await this.convertUriToBase64(optimizedUri);

      if (!base64 || base64.length === 0) {
        throw new Error("Image preparation resulted in empty data");
      }
      return base64;
    } catch (error) {
      console.error("❌ Error preparing image:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to prepare image for AI: ${error.message}`);
      }
      throw new Error(`Failed to prepare image for AI: ${String(error)}`);
    }
  }

  /**
   * Save image permanently to document directory
   * This ensures images persist across app restarts
   */
  async saveImagePermanently(uri: string): Promise<string> {
    if (!uri) {
      throw new Error("Image URI is required for permanent storage");
    }

    try {
      // Check if image already exists in permanent storage
      if (uri.includes(FileSystem.documentDirectory || "")) {
        console.log("✅ Image already in permanent storage");
        return uri;
      }

      // Create directory if it doesn't exist
      const imageDir = `${FileSystem.documentDirectory}food_images/`;
      const dirInfo = await FileSystem.getInfoAsync(imageDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
      }

      // Generate unique filename
      const filename = `food_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.jpg`;
      const newPath = `${imageDir}${filename}`;

      // Copy file to permanent location
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      console.log("✅ Image saved permanently:", newPath);
      return newPath;
    } catch (error) {
      console.error("❌ Error saving image permanently:", error);
      // Return original URI as fallback
      console.warn("⚠️ Falling back to original URI");
      return uri;
    }
  }
}

export const imageService = new ImageService();
