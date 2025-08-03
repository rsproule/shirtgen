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
    <div className="relative container mx-auto flex min-h-screen items-center justify-center bg-white p-4">
      {/* Dancing Pepe video in top left corner */}
      <div className="absolute top-4 left-4 z-10">
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
          <source
            src="/Dancing_Pepe_1_with_Galaxy_Background_Free_Video_Background.mp4"
            type="video/mp4"
          />
          <div className="flex h-48 w-full items-center justify-center bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </video>
      </div>

      {/* Sad Arrested Development GIF underneath Pepe video */}
      <div className="absolute top-52 left-4 z-10">
        <img
          src="/Sad Arrested Development GIF.gif"
          alt="Sad Arrested Development"
          className="h-40 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load sad arrested development gif", e);
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Watermelon Cat image underneath Sad Arrested Development GIF */}
      <div className="absolute top-[calc(13rem+12rem)] left-4 z-10">
        <img
          src="/Cat Watermelon GIF.gif"
          alt="Watermelon Cat"
          className="h-56 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load watermelon cat image", e);
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Fortnite Default Dance video in top right corner */}
      <div className="absolute top-4 right-4 z-10">
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
          <source
            src="/FORTNITE_DEFAULT_DANCE_BASS_BOOSTED.mp4"
            type="video/mp4"
          />
          <div className="flex h-48 w-full items-center justify-center bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </video>
      </div>

      {/* Cat is shooting video underneath Fortnite dance */}
      <div className="absolute top-52 right-4 z-10">
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
          <source
            src="/The_cat_is_shooting_from_AK_47_2023_3d_meme_gun.mp4"
            type="video/mp4"
          />
          <div className="flex h-48 w-full items-center justify-center bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </video>
      </div>

      {/* Zoo walks off GIF underneath cat shooting video */}
      <div className="absolute top-[calc(13rem+8rem)] right-4 z-10">
        <img
          src="/zoo walks off GIF.gif"
          alt="Zoo walks off"
          className="h-40 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load zoo walks off gif", e);
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Dance Party Cat GIF underneath zoo walks off GIF */}
      <div className="absolute top-[calc(13rem+24rem)] right-4 z-10">
        <img
          src="/Dance Party Cat GIF.gif"
          alt="Dance Party Cat"
          className="h-56 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load dance party cat gif", e);
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Shrek meme video to the right of the cat */}
      <div className="absolute top-52 right-52 z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-40 w-auto rounded-none shadow-lg"
          onError={e => {
            console.error("Failed to load Shrek meme video", e);
            e.currentTarget.style.display = "none";
          }}
        >
          <source
            src="/Meme_Doy_clases_los_jueves_no_cobro_mucho_Shrek.mp4"
            type="video/mp4"
          />
          <div className="flex h-48 w-full items-center justify-center bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </video>
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
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-black opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
