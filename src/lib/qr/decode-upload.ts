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

export async function decodeQrFromFile(file: File) {
  const image = await loadImage(file);
  const result = await reader.decodeFromImageElement(image);

  return result.getText();
}
