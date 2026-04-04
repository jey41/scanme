import QRCode, { type QRCodeToDataURLOptions, type QRCodeToStringOptions } from "qrcode";

const sharedOptions = {
  errorCorrectionLevel: "M",
  margin: 1,
  width: 320,
  color: {
    dark: "#171717",
    light: "#ffffffff",
  },
} satisfies QRCodeToDataURLOptions & QRCodeToStringOptions;

export async function generateQrPngDataUrl(value: string) {
  return QRCode.toDataURL(value, sharedOptions);
}

export async function generateQrSvgMarkup(value: string) {
  return QRCode.toString(value, {
    ...sharedOptions,
    type: "svg",
  });
}
