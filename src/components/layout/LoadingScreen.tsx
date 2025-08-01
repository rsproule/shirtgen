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
              playsInline
              preload="auto"
              className={`max-w-md w-full h-auto rounded-none shadow-lg ${
                videoSrc === "/loading-video-3.mp4"
                  ? "border-1 border-white"
                  : ""
              }`}
              onError={(e) => {
                console.error(`Failed to load video: ${videoSrc}`, e);
                // Hide the video element if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            >
              <source src={videoSrc} type="video/mp4" />
              {/* Fallback content */}
              <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
              </div>
            </video>
          ))}
        </div>

        {/* Mobile: Show 1 random video */}
        <div className="lg:hidden flex justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`w-full max-w-sm h-auto rounded-none shadow-lg ${
              mobileVideo === "/loading-video-3.mp4"
                ? "border-1 border-white"
                : ""
            }`}
            onError={(e) => {
              console.error(`Failed to load mobile video: ${mobileVideo}`, e);
              // Hide the video element if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          >
            <source src={mobileVideo} type="video/mp4" />
            {/* Fallback content */}
            <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          </video>
        </div>

        {/* Fallback loading spinner if videos fail */}
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white opacity-50"></div>
        </div>
      </div>
    </div>
  );
}