import { useState, useCallback, useRef } from "react";

export enum CameraState {
  IDLE = "IDLE",
  STARTING = "STARTING",
  PLAYING = "PLAYING",
  ERROR = "ERROR",
}

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>(CameraState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Keep track of the stream to properly stop it
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setState(CameraState.IDLE);
    setErrorMsg(null);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setState(CameraState.STARTING);
      setErrorMsg(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" // Front-facing camera
        },
        audio: false // No audio needed
      });
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setState(CameraState.PLAYING);
      
    } catch (err: unknown) {
      console.error("Camera start error:", err);
      setState(CameraState.ERROR);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setErrorMsg("Camera access denied. Please grant permission.");
        } else if (err.name === 'NotFoundError') {
          setErrorMsg("No camera found. Please connect a webcam.");
        } else {
          setErrorMsg(err.message || "Failed to start camera.");
        }
      } else {
        setErrorMsg("An unknown error occurred.");
      }
    }
  }, []);

  return {
    stream,
    state,
    errorMsg,
    startCamera,
    stopCamera
  };
}
