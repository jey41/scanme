"use client";

import { BrowserCodeReader, BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, CameraOff, Copy, ExternalLink, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveQrHistoryEntry } from "@/lib/history/client";
import { validateUrl } from "@/lib/qr/validate-url";

const cameraReader = new BrowserQRCodeReader();

function getPreferredDeviceId(devices: MediaDeviceInfo[], selectedDeviceId?: string) {
  if (selectedDeviceId && devices.some((device) => device.deviceId === selectedDeviceId)) {
    return selectedDeviceId;
  }

  const environmentFacing = devices.find((device) => /back|rear|environment/i.test(device.label));

  return environmentFacing?.deviceId ?? devices[0]?.deviceId;
}

export function QrCameraScanCard() {
  const t = useTranslations("Tool.camera");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      BrowserCodeReader.releaseAllStreams();
    };
  }, []);

  async function startScan() {
    if (!videoRef.current) {
      return;
    }

    setLoadingDevices(true);
    setError(null);
    setResult(null);

    try {
      controlsRef.current?.stop();

      let availableDevices = await BrowserCodeReader.listVideoInputDevices();

      if (availableDevices.length === 0) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
            },
            audio: false,
          });

          stream.getTracks().forEach((track) => track.stop());
          availableDevices = await BrowserCodeReader.listVideoInputDevices();
        } catch {
          setError(t("errors.permission"));
          setScanning(false);
          return;
        }
      }

      setDevices(availableDevices);

      if (availableDevices.length === 0) {
        setError(t("errors.noDevice"));
        setScanning(false);
        return;
      }

      const nextDeviceId = getPreferredDeviceId(availableDevices, selectedDeviceId);
      setSelectedDeviceId(nextDeviceId);

      controlsRef.current = await cameraReader.decodeFromVideoDevice(
        nextDeviceId,
        videoRef.current,
        (scanResult, scanError, controls) => {
          if (scanResult) {
            const text = scanResult.getText();
            setResult(text);
            setScanning(false);
            controls.stop();
            void saveQrHistoryEntry({
              action: "scanned",
              content: text,
              payload: { source: "camera" },
            });
            return;
          }

          if (scanError) {
            setError(null);
          }
        },
      );

      setScanning(true);
    } catch {
      setError(t("errors.permission"));
      setScanning(false);
    } finally {
      setLoadingDevices(false);
    }
  }

  function stopScan() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }

  async function handleCopy() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setError(t("errors.copy"));
    }
  }

  const parsed = result ? validateUrl(result) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="p-6 sm:p-7">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-foreground-muted">{t("eyebrow")}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="max-w-xl text-sm leading-7 text-foreground-muted">{t("description")}</p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={startScan} disabled={loadingDevices || scanning}>
            {loadingDevices ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Camera className="mr-2 size-4" />}
            {scanning ? t("actions.scanning") : t("actions.start")}
          </Button>
          <Button variant="secondary" onClick={stopScan} disabled={!scanning}>
            <CameraOff className="mr-2 size-4" />
            {t("actions.stop")}
          </Button>
        </div>

        {devices.length > 1 ? (
          <select
            value={selectedDeviceId}
            onChange={(event) => setSelectedDeviceId(event.target.value)}
            className="mt-4 h-12 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || t("cameraLabel")}
              </option>
            ))}
          </select>
        ) : null}
      </Card>

      <Card className="p-6 sm:p-7">
        <div className="mb-6 space-y-1">
          <p className="text-sm font-medium text-foreground-muted">{t("resultLabel")}</p>
          <h3 className="text-xl font-semibold">{t("resultTitle")}</h3>
        </div>
        <div className="flex min-h-64 flex-col justify-center rounded-[24px] border border-border bg-white/80 p-6">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {result ? (
            <div className="space-y-5">
              <p className="break-all text-sm leading-7 text-foreground">{result}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={handleCopy}>
                  <Copy className="mr-2 size-4" />
                  {t("actions.copy")}
                </Button>
                <Button
                  onClick={() => window.open(result, "_blank", "noopener,noreferrer")}
                  disabled={!parsed?.valid}
                >
                  <ExternalLink className="mr-2 size-4" />
                  {t("actions.open")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-7 text-foreground-muted">
              {scanning ? t("liveHint") : t("empty")}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
