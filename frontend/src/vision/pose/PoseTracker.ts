import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";

export class PoseTracker {
  private static instance: PoseTracker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  // Last processed time to skip duplicate frames
  private lastVideoTime: number = -1;

  private constructor() {}

  public static getInstance(): PoseTracker {
    if (!PoseTracker.instance) {
      PoseTracker.instance = new PoseTracker();
    }
    return PoseTracker.instance;
  }

  public async initialize(): Promise<void> {
    if (this.poseLandmarker) return; // Already initialized

    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;

    this.initializationPromise = (async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        this.poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "/models/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputSegmentationMasks: false,
        });
      } catch (error) {
        console.error("Failed to initialize PoseTracker:", error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initializationPromise;
  }

  public isReady(): boolean {
    return this.poseLandmarker !== null;
  }

  /**
   * Detects pose landmarks from a video frame.
   * Returns an array of 33 NormalizedLandmarks (x, y, z, visibility), or null if no pose is found.
   */
  public detectPose(videoElement: HTMLVideoElement, timestampMs: number): NormalizedLandmark[] | null {
    if (!this.poseLandmarker || videoElement.videoWidth === 0) {
      return null;
    }

    // Skip duplicate frames
    if (timestampMs === this.lastVideoTime) {
      return null;
    }

    this.lastVideoTime = timestampMs;

    try {
      const results = this.poseLandmarker.detectForVideo(videoElement, timestampMs);

      if (results.landmarks && results.landmarks.length > 0) {
        return results.landmarks[0];
      }
    } catch (error) {
      console.warn("Pose detection error:", error);
    }

    return null;
  }
}
