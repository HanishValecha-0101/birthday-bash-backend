import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import AppLayout from "@/components/AppLayout";

const overlays = [
  { id: "party", label: "Party hat", emoji: "🥳", x: 0.5, y: 0.18, size: 0.16 },
  { id: "cake", label: "Cake burst", emoji: "🎂", x: 0.82, y: 0.78, size: 0.13 },
  { id: "crown", label: "Birthday crown", emoji: "👑", x: 0.5, y: 0.16, size: 0.14 },
  { id: "sparkle", label: "Sparkles", emoji: "✨", x: 0.2, y: 0.2, size: 0.11 },
];

const frames = [
  { id: "primary", label: "Neon green", borderClass: "border-primary", variable: "--primary" },
  { id: "secondary", label: "Birthday gold", borderClass: "border-secondary", variable: "--secondary" },
  { id: "accent", label: "Party lavender", borderClass: "border-accent", variable: "--accent" },
];

const PhotoBooth = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedOverlay, setSelectedOverlay] = useState(overlays[0]);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);
  const BOOTH_KEY = "birthday-booth-captures";
  const [captures, setCaptures] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(BOOTH_KEY) || "[]"); } catch { return []; }
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const hasCaptureSource = cameraReady || Boolean(uploadedImage);

  const boothStatus = useMemo(() => {
    if (error) return error;
    if (uploadedImage) return "Photo loaded — add an overlay, frame it up, and save the birthday booth version.";
    if (cameraReady) return "Camera live — frame the shot, hit capture, and save the birthday chaos.";
    if (isStartingCamera) return "Requesting camera access...";
    return "Allow camera access or upload a photo to use the live birthday booth.";
  }, [cameraReady, error, isStartingCamera, uploadedImage]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  };

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
      }

      stopCamera();
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem("birthday-booth-captures", JSON.stringify(captures)); } catch {}
  }, [captures]);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera API not available in this browser. Try uploading a photo instead.");
      return;
    }

    try {
      setIsStartingCamera(true);
      setError(null);
      setUploadedImage(null);
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        setError("Video element not found. Please reload the page.");
        return;
      }

      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timeout")), 5000);
        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };
        if (video.readyState >= 1) {
          clearTimeout(timeout);
          resolve();
        }
      });

      await video.play();
      setCameraReady(true);
    } catch (err) {
      stopCamera();
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Camera permission was denied. Please allow access in your browser settings, or upload a photo instead.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setError("No camera found on this device. Upload a photo instead.");
      } else {
        setError("Could not start camera (may be blocked in preview). Upload a photo to use the booth instead.");
      }
      setCameraReady(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const getCanvasColor = (variable: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return `hsl(${value})`;
  };

  const drawBoothFrame = (context: CanvasRenderingContext2D, width: number, height: number) => {
    context.strokeStyle = getCanvasColor(selectedFrame.variable);
    context.lineWidth = Math.max(18, width * 0.018);
    context.strokeRect(0, 0, width, height);

    context.font = `${Math.round(width * selectedOverlay.size)}px serif`;
    context.textAlign = "center";
    context.fillText(selectedOverlay.emoji, width * selectedOverlay.x, height * selectedOverlay.y);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !hasCaptureSource) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (uploadedImage) {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image();
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("failed"));
        nextImage.src = uploadedImage;
      }).catch(() => null);

      if (!image) {
        setError("That photo could not be loaded. Try another image.");
        return;
      }

      canvas.width = image.naturalWidth || 960;
      canvas.height = image.naturalHeight || 720;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      drawBoothFrame(context, canvas.width, canvas.height);

      const file = canvas.toDataURL("image/png");
      setCaptures((current) => [file, ...current]);
      return;
    }

    if (!video || !cameraReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera feed is not ready yet. Wait a second after enabling it, then try again.");
      return;
    }

    const width = video.videoWidth || 960;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -width, 0, width, height);
    context.restore();

    drawBoothFrame(context, width, height);

    const file = canvas.toDataURL("image/png");
    setCaptures((current) => [file, ...current]);
  };

  const startCountdown = () => {
    if (!hasCaptureSource) return;

    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
    }

    let current = 3;
    setCountdown(current);

    countdownTimerRef.current = window.setInterval(() => {
      current -= 1;

      if (current === 0) {
        if (countdownTimerRef.current) {
          window.clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }

        setCountdown(null);
        void capturePhoto();
        return;
      }

      setCountdown(current);
    }, 1000);
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    stopCamera();
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const downloadCapture = (image: string, index: number) => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `birthday-booth-${index + 1}.png`;
    link.click();
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">📸 Photo Booth</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Open the camera, pick an overlay, and capture birthday-polaroid energy right inside the app.
          </p>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4 rounded-[1.8rem] border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Live booth</h2>
                <p className="text-xs text-muted-foreground">{boothStatus}</p>
              </div>
              <button
                onClick={cameraReady ? stopCamera : startCamera}
                className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm font-semibold text-foreground"
              >
                {cameraReady ? "Stop camera" : isStartingCamera ? "Starting..." : "Start camera"}
              </button>
            </div>

            <div className={`relative aspect-[4/3] overflow-hidden rounded-[1.8rem] border-4 bg-muted/40 ${selectedFrame.borderClass}`}>
              {/* Video always rendered so ref is stable */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover [transform:scaleX(-1)] ${cameraReady ? "" : "hidden"}`}
              />
              {!cameraReady && uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded booth source" className="h-full w-full object-cover" />
              ) : !cameraReady ? (
                <div className="flex h-full items-center justify-center px-8 text-center text-sm text-muted-foreground">
                  Start the camera or upload a photo to use the live birthday booth.
                </div>
              ) : null}

              <div
                className="pointer-events-none absolute"
                style={{ left: `${selectedOverlay.x * 100}%`, top: `${selectedOverlay.y * 100}%`, transform: "translate(-50%, -50%)" }}
              >
                <span className="text-5xl md:text-7xl">{selectedOverlay.emoji}</span>
              </div>

              {countdown ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/55 text-7xl font-bold text-foreground">
                  {countdown}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={startCountdown}
                disabled={!hasCaptureSource || countdown !== null}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                Capture in 3
              </button>
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="rounded-xl border border-border bg-muted/50 px-5 py-3 text-sm font-semibold text-foreground"
              >
                Upload photo
              </button>
              <button
                onClick={() => captures[0] && downloadCapture(captures[0], 0)}
                disabled={captures.length === 0}
                className="rounded-xl border border-border bg-muted/50 px-5 py-3 text-sm font-semibold text-foreground disabled:opacity-40"
              >
                Download latest
              </button>
            </div>

            <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </section>

          <section className="space-y-4 rounded-[1.8rem] border border-border bg-card p-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Booth styling</h2>
              <p className="text-xs text-muted-foreground">Pick the overlay and border before the countdown starts.</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overlay</p>
              <div className="grid grid-cols-2 gap-3">
                {overlays.map((overlay) => (
                  <button
                    key={overlay.id}
                    onClick={() => setSelectedOverlay(overlay)}
                    className={`rounded-2xl border px-4 py-3 text-left ${selectedOverlay.id === overlay.id ? "border-primary bg-primary/10" : "border-border bg-muted/40"}`}
                  >
                    <div className="text-2xl">{overlay.emoji}</div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{overlay.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Frame</p>
              <div className="grid gap-3">
                {frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm ${selectedFrame.id === frame.id ? "border-primary bg-primary/10 text-foreground" : "border-border bg-muted/40 text-muted-foreground"}`}
                  >
                    {frame.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-4 rounded-[1.8rem] border border-border bg-card p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Captured moments</h2>
            <p className="text-xs text-muted-foreground">Your booth shots are saved permanently — they'll be here when you come back.</p>
          </div>

          {captures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No photos yet — take the first one.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {captures.map((capture, index) => (
                <div key={capture} className="space-y-3 rounded-2xl border border-border bg-muted/30 p-3">
                  <img src={capture} alt={`Birthday booth capture ${index + 1}`} className="aspect-[4/3] w-full rounded-xl object-cover" />
                  <button
                    onClick={() => downloadCapture(capture, index)}
                    className="w-full rounded-xl border border-border bg-background/40 px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    Download shot #{index + 1}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </AppLayout>
  );
};

export default PhotoBooth;