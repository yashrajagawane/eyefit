# Computer Vision Methodology

GazeFlap processes raw video frames directly in the browser to extract meaningful human inputs without needing specialized hardware.

## Face & Gaze Tracking

We utilize the `FaceLandmarker` task from MediaPipe to track 478 3D points on the user's face. 

To determine where the user is looking, we isolate the specific landmarks surrounding the **left eye**, **right eye**, and the **irises**.

1. **Eye Aspect Ratio (EAR)**: 
   While initially considered, EAR is better for detecting blinks. For directional gaze, we calculate the relative position of the iris center to the corners of the eye contour.
2. **Pitch Estimation (Up/Down)**:
   We calculate the vertical distance from the center of the iris to the top and bottom eyelids. If the iris is significantly closer to the top eyelid, the user is looking UP.
3. **Calibration**:
   Because eye shapes differ wildly across users, hardcoding thresholds leads to poor user experiences. GazeFlap includes a **Calibration UI** that prompts the user to look CENTER, UP, and DOWN. It averages the ratios over several frames to establish personalized bounding thresholds.

## Body Pose & Push-Up Detection

We utilize the `PoseLandmarker` task to extract 33 skeletal landmarks.

### Angle Calculation
The core of the push-up engine is calculating the interior angle of the elbow. We use the 3D coordinates (x,y,z) of three specific landmarks:
- Shoulder (Landmark 11 or 12)
- Elbow (Landmark 13 or 14)
- Wrist (Landmark 15 or 16)

Using the mathematical law of cosines, we derive the exact angle of the user's arm in real-time.

### Repetition State Machine
A raw angle is not enough to count a push-up. We pass the angle through a finite state machine:
1. **UP**: Angle > 150°
2. **MOVING_DOWN**: Angle drops below 150°
3. **BOTTOM**: Angle drops below 90° (Critical threshold for a "Good" push-up)
4. **MOVING_UP**: Angle starts increasing again.
5. **VALID REP**: Returns to UP state after passing through BOTTOM.

### Form Analysis
The engine evaluates form strictly:
- If the user goes from `MOVING_DOWN` back to `UP` without reaching the `BOTTOM` threshold, the rep is logged as **SHALLOW**.
- If tracking is lost mid-rep, it is flagged as a **TRACKING ERROR**.
