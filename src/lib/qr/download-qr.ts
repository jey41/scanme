import JSZip from "jszip";

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
}

export function downloadPng(dataUrl: string, filename: string) {
  triggerDownload(dataUrl, filename);
}

export function downloadSvg(svgMarkup: string, filename: string) {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  triggerDownload(url, filename);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export async function downloadZip(
  items: { pngDataUrl: string; svgMarkup: string; filename: string }[],
  zipFilename: string,
) {
  const zip = new JSZip();

  items.forEach((item) => {
    // Extract base64 part of the dataUrl for PNG
    const base64Data = item.pngDataUrl.replace(/^data:image\/png;base64,/, "");
    zip.file(`${item.filename}.png`, base64Data, { base64: true });
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, zipFilename);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
