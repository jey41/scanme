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
