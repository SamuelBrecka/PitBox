import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSizeKb: number;
  compressedSizeKb: number;
  previewUrl: string;
}

export async function compressVehicleImage(file: File): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1600,
    useWebWorker: typeof window !== 'undefined' && typeof Worker !== 'undefined',
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
    });
    const compressedSizeKb = Math.round(compressedFile.size / 1024);
    const previewUrl = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      originalSizeKb,
      compressedSizeKb,
      previewUrl,
    };
  } catch (error) {
    console.warn('Image compression fallback to original file:', error);
    return {
      file,
      originalSizeKb,
      compressedSizeKb: originalSizeKb,
      previewUrl: URL.createObjectURL(file),
    };
  }
}
