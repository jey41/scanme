import { BrowserQRCodeReader } from "@zxing/browser";

const reader = new BrowserQRCodeReader();

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("invalid-image"));
    };

    image.src = objectUrl;
  });
}

async function invertImage(image: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(image);
        return;
      }

      ctx.drawImage(image, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Invert RGB channels
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];       // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
      }

      ctx.putImageData(imgData, 0, 0);

      const invertedImage = new Image();
      invertedImage.onload = () => resolve(invertedImage);
      invertedImage.onerror = () => resolve(image);
      invertedImage.src = canvas.toDataURL();
    } catch {
      resolve(image);
    }
  });
}

export async function decodeQrFromFile(file: File) {
  const image = await loadImage(file);
  try {
    const result = await reader.decodeFromImageElement(image);
    return result.getText();
  } catch (normalError) {
    // If decoding the original image fails, try inverting it (for dark-themed / white-on-dark QRs)
    try {
      const invertedImage = await invertImage(image);
      const result = await reader.decodeFromImageElement(invertedImage);
      return result.getText();
    } catch {
      throw normalError;
    }
  }
}
