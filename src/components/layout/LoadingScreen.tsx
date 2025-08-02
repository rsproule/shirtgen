import { useState } from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Creating your design... This may take a minute... enjoy the show!",
}: LoadingScreenProps) {
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
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4">
      {/* Dancing Pepe video in top left corner */}
      <div className="absolute left-4 top-4 z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-40 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load dancing pepe video", e);
            e.currentTarget.style.display = "none";
          }}
        >
          <source src="/Dancing_Pepe_1_with_Galaxy_Background_Free_Video_Background.mp4" type="video/mp4" />
          <div className="flex h-48 w-full items-center justify-center bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </video>
      </div>

      {/* Fortnite Default Dance video in top right corner */}
      <div className="absolute right-4 top-4 z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-40 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load fortnite dance video", e);
            e.currentTarget.style.display = "none";
          }}
        >
          <source src="/FORTNITE_DEFAULT_DANCE_BASS_BOOSTED.mp4" type="video/mp4" />
          <div className="flex h-48 w-full items-center justify-center bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </video>
      </div>

      {/* Cat is shooting video underneath Fortnite dance */}
      <div className="absolute right-4 top-52 z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-40 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load cat shooting video", e);
            e.currentTarget.style.display = "none";
          }}
        >
          <source src="/The_cat_is_shooting_from_AK_47_2023_3d_meme_gun.mp4" type="video/mp4" />
          <div className="flex h-48 w-full items-center justify-center bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </video>
      </div>
      
      <div className="w-full text-center">
        <p className="mb-8 text-lg font-light text-white lg:text-xl">
          {message}
        </p>

        {/* Desktop: Show all 3 videos */}
        <div className="mx-auto hidden max-w-6xl flex-row items-center justify-center gap-8 lg:flex">
          {loadingVideos.map(videoSrc => (
            <video
              key={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`h-auto w-full max-w-md rounded-none shadow-lg ${
                videoSrc === "/loading-video-3.mp4"
                  ? "border-1 border-white"
                  : ""
              }`}
              onError={e => {
                console.error(`Failed to load video: ${videoSrc}`, e);
                // Hide the video element if it fails to load
                e.currentTarget.style.display = "none";
              }}
            >
              <source src={videoSrc} type="video/mp4" />
              {/* Fallback content */}
              <div className="flex h-48 w-full items-center justify-center bg-gray-800">
                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            </video>
          ))}
        </div>

        {/* Mobile: Show 1 random video */}
        <div className="flex justify-center lg:hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`h-auto w-full max-w-sm rounded-none shadow-lg ${
              mobileVideo === "/loading-video-3.mp4"
                ? "border-1 border-white"
                : ""
            }`}
            onError={e => {
              console.error(`Failed to load mobile video: ${mobileVideo}`, e);
              // Hide the video element if it fails to load
              e.currentTarget.style.display = "none";
            }}
          >
            <source src={mobileVideo} type="video/mp4" />
            {/* Fallback content */}
            <div className="flex h-48 w-full items-center justify-center bg-gray-800">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          </video>
        </div>

        {/* Fallback loading spinner if videos fail */}
        <div className="mt-8 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
