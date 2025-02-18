"use client";

import HandRecognizer from "@/components/HandRecognizer";
import RocketComponent from "@/components/RocketComponent";
import { useEffect, useState } from "react";

export default function Home() {
  const [rocketLeft, setRocketLeft] = useState(0);
  const [isDetected, setIsDetected] = useState(false);
  const [degrees, setDegrees] = useState(0);

  // Center the rocket initially and on resize
  useEffect(() => {
    const updateRocketPosition = () => {
      setRocketLeft(window.innerWidth / 2);
    };

    updateRocketPosition();
    window.addEventListener("resize", updateRocketPosition);

    return () => {
      window.removeEventListener("resize", updateRocketPosition);
    };
  }, []);

  const setHandResults = (result: any) => {
    if (result.isDetected !== isDetected) setIsDetected(result.isDetected);
    if (result.degrees != null && result.degrees !== degrees) setDegrees(result.degrees);

    if (result.degrees && !isNaN(result.degrees)) {
      setRocketLeft((prev) => {
        const newPosition = prev - result.degrees / 2;
        return Math.max(30, Math.min(window.innerWidth - 100, newPosition));
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute left-3 top-3 z-30 w-24">
        <HandRecognizer setHandResults={setHandResults} />
      </div>
      <div
        id="rocket-container"
        style={{
          position: "absolute",
          left: rocketLeft,
          transition: "left 100ms linear", // Smoother transition
          marginTop: "500px",
        }}
      >
        <RocketComponent degrees={degrees} />
      </div>
    </main>
  );
}
