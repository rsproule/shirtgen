import { useState } from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Creating your design... This may take a few seconds." }: LoadingScreenProps) {
  // All loading videos to display
  const loadingVideos = [
    "/loading-video-ss.mp4",
    "/loading-video-2.mp4",
    "/loading-video-3.mp4",
  ];

  // Random video for mobile
  const [mobileVideo] = useState(() => {
    return loadingVideos[Math.floor(Math.random() * loadingVideos.length)];
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center w-full">
        <p className="text-white text-lg lg:text-xl font-light mb-8">
          {message}
        </p>

        {/* Desktop: Show all 3 videos */}
        <div className="hidden lg:flex flex-row items-center justify-center gap-8 max-w-6xl mx-auto">
          {loadingVideos.map((videoSrc) => (
            <video
              key={videoSrc}
              autoPlay
              loop
              muted
              className={`max-w-md w-full h-auto rounded-none shadow-lg ${
                videoSrc === "/loading-video-3.mp4"
                  ? "border-1 border-white"
                  : ""
              }`}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ))}
        </div>

        {/* Mobile: Show 1 random video */}
        <div className="lg:hidden flex justify-center">
          <video
            autoPlay
            loop
            muted
            className={`w-full max-w-sm h-auto rounded-none shadow-lg ${
              mobileVideo === "/loading-video-3.mp4"
                ? "border-1 border-white"
                : ""
            }`}
          >
            <source src={mobileVideo} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}