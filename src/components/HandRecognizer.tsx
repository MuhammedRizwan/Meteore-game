"use client";
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

interface HandRecognizerProps {
  setHandResults: (result: any) => void;
}

export default function HandRecognizer({ setHandResults }: HandRecognizerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handLandMarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    initVideoAndModel();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const initVideoAndModel = async () => {
    setHandResults({ isLoading: true });
    const videoElement = videoRef.current;
    if (!videoElement) return;

    await initVideo(videoElement);
    handLandMarkerRef.current = await initModel();
    setHandResults({ isLoading: false });

    const detectHands = async () => {
      if (handLandMarkerRef.current) {
        const detection = await handLandMarkerRef.current.detectForVideo(videoElement, Date.now());
        processDetection(detection, setHandResults);
      }
      animationFrameRef.current = requestAnimationFrame(detectHands);
    };

    detectHands();
  };

  return (
    <div>
      <video className="-scale-x-1 border-2 border-zinc-800 rounded" ref={videoRef}></video>
    </div>
  );
}

async function initVideo(videoElement: HTMLVideoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
  });
  videoElement.srcObject = stream;
  videoElement.onloadeddata = () => {
    videoElement.play();
  };
}

async function initModel() {
  const wasm = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  return HandLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    numHands: 2,
    runningMode: "VIDEO",
  });
}

function processDetection(detection: HandLandmarkerResult, setHandResults: (result: any) => void) {
  if (detection && detection.handedness.length > 1) {
    const RightIndex = detection.handedness[0][0].categoryName === "Right" ? 0 : 1;
    const LeftIndex = RightIndex === 0 ? 1 : 0;

    const { x: leftX, y: leftY } = detection.landmarks[LeftIndex][6];
    const { x: rightX, y: rightY } = detection.landmarks[RightIndex][6];

    const tilt = (rightY - leftY) / (rightX - leftX);
    const degrees = (Math.atan(tilt) * 180) / Math.PI;

    setHandResults({ isDetected: true, tilt, degrees });
  } else {
    setHandResults({ isDetected: false, tilt: 0, degrees: 0 });
  }
}
