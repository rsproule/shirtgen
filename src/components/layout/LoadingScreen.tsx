import { useState } from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Creating your design... This may take a minute... enjoy the show!",
}: LoadingScreenProps) {
  // All loading videos to display (updated with new videos)
  const loadingVideos = [
    "/parkour.mp4",
    "/subwaysurfers.mp4",
    "/loading-video-3.mp4",
  ];

  // Mobile-only videos (excluding bouncing DVD)
  const mobileVideos = [
    "/parkour.mp4",
    "/subwaysurfers.mp4",
  ];

  // All GIFs and videos to randomize
  const loadingGifs = [
    "/Sad Arrested Development GIF.gif",
    "/Cat Watermelon GIF.gif",
    "/zoo walks off GIF.gif",
    "/Dance Party Cat GIF.gif",
    "/Dancing_Pepe_1_with_Galaxy_Background_Free_Video_Background.mp4",
    "/Meme_Doy_clases_los_jueves_no_cobro_mucho_Shrek.mp4",
  ];

  // Random video for mobile - select fresh each time
  const mobileVideo = mobileVideos[Math.floor(Math.random() * mobileVideos.length)];

  // Random GIF to show
  const [randomGif] = useState(() => {
    return loadingGifs[Math.floor(Math.random() * loadingGifs.length)];
  });

  return (
    <div className="relative container mx-auto flex min-h-screen items-center justify-center bg-white p-4">
      {/* Random GIF/Video in top left corner */}
      <div className="absolute top-32 left-8 z-10 hidden lg:block">
        {randomGif.endsWith(".mp4") ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-40 w-auto rounded-none shadow-lg"
            onError={e => {
              console.error("Failed to load random video", e);
              e.currentTarget.style.display = "none";
            }}
          >
            <source src={randomGif} type="video/mp4" />
            <div className="flex h-48 w-full items-center justify-center bg-gray-800">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          </video>
        ) : (
          <img
            src={randomGif}
            alt="Random loading GIF"
            className="h-40 w-auto rounded-none shadow-lg"
            onError={e => {
              console.error("Failed to load random gif", e);
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      <div className="w-full text-center">
        <p className="mb-8 text-lg font-light text-black lg:text-xl">
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
        <div className="lg:hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`h-auto w-full max-h-96 rounded-none ${
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
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-black opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
