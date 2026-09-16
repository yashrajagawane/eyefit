import { FaceLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";

export class FaceTracker {
  private static instance: FaceTracker | null = null;
  private faceLandmarker: FaceLandmarker | null = null;
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  
  // Last processed time to ensure we only process new frames
  private lastVideoTime: number = -1;

  private constructor() {}

  public static getInstance(): FaceTracker {
    if (!FaceTracker.instance) {
      FaceTracker.instance = new FaceTracker();
    }
    return FaceTracker.instance;
  }

  public async initialize(): Promise<void> {
    if (this.faceLandmarker) return; // Already initialized
    
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    
    this.initializationPromise = (async () => {
      try {
        // Fetch the WASM binaries from the CDN (recommended by MediaPipe for Next.js)
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task", // Our local model
            delegate: "GPU",
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          runningMode: "VIDEO",
          numFaces: 1, // We only care about the primary user
        });
      } catch (error) {
        console.error("Failed to initialize FaceTracker:", error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initializationPromise;
  }

  public isReady(): boolean {
    return this.faceLandmarker !== null;
  }

  public detectFace(videoElement: HTMLVideoElement, timestampMs: number): NormalizedLandmark[] | null {
    if (!this.faceLandmarker || videoElement.videoWidth === 0) {
      return null;
    }

    // Only process if it's a new frame
    if (timestampMs === this.lastVideoTime) {
      return null;
    }
    
    this.lastVideoTime = timestampMs;

    try {
      const results = this.faceLandmarker.detectForVideo(videoElement, timestampMs);
      
      // Return the first face's landmarks if detected
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        return results.faceLandmarks[0];
      }
    } catch (error) {
      console.warn("Face detection error:", error);
    }
    
    return null;
  }
}
