import React, { useState, useRef, useEffect } from "react";
import "./systemAudio.css";
import soundManager from "../utils/SoundManager";

const SystemAudio = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.12);
  const [isSfxEnabled, setIsSfxEnabled] = useState(soundManager.enabled);
  const [isMuted, setIsMuted] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef(null);
  const barRef = useRef(null);

  // Example tracks - User should replace these with local paths or actual assets
  const tracks = [
    {
      id: "01",
      title: "Entranced",
      src: `${import.meta.env.BASE_URL}audio/music/1.Agnet 75 - Entranced.mp3`,
    },
    {
      id: "02",
      title: "Achromahedonia",
      src: `${import.meta.env.BASE_URL}audio/music/2.Agnet 75 - Achromahedonia.mp3`,
    },
    {
      id: "03",
      title: "Farewell",
      src: `${import.meta.env.BASE_URL}audio/music/3.Agnet 75 - Farewell.mp3`,
    },
  ];

  useEffect(() => {
    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            document.removeEventListener("click", tryPlay);
          })
          .catch(() => {});
      }
    };
    audioRef.current.play().catch(() => {
      document.addEventListener("click", tryPlay);
    });
    return () => document.removeEventListener("click", tryPlay);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Drag logic for volume bar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newVol = Math.max(0, Math.min(1, x / rect.width));
      setVolume(newVol);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const nextTrack = () => {
    const nextIdx = (currentTrack + 1) % tracks.length;
    setCurrentTrack(nextIdx);
    setTimeout(() => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
    }, 10);
  };

  const handleTrackEnded = () => {
    const nextIdx = (currentTrack + 1) % tracks.length;
    setCurrentTrack(nextIdx);
  };

  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  const handleVolumeChange = (increment, amount = 0.2) => {
    setVolume((prev) => {
      const newVal = prev + (increment ? amount : -amount);
      return Math.max(0, Math.min(1, newVal));
    });
  };

  const renderVolBlocks = () => {
    const totalBlocks = 6;
    const filledBlocks = Math.round(volume * totalBlocks);
    return "█".repeat(filledBlocks) + "░".repeat(totalBlocks - filledBlocks);
  };

  return (
    <div className="system-audio-container">
      <audio
        ref={audioRef}
        src={tracks[currentTrack].src}
        onEnded={handleTrackEnded}
      />

      <div className="system-audio-wrapper">
        <div className="audio-line" onClick={() => setIsMuted((prev) => !prev)}>
          <span className="audio-label">AUDIO:</span>
          <span
            className="audio-value"
            style={{ color: isMuted ? "#ff3e3e" : "#00ff88" }}
          >
            {isMuted ? "MUTED" : "ONLINE"}
          </span>
        </div>

        <div className="audio-line" onClick={nextTrack}>
          <span className="audio-label">TRACK:</span>
          <span className="audio-value">
            {tracks[currentTrack].id} - {tracks[currentTrack].title}
          </span>
        </div>

        <div
          className="audio-line"
          onClick={() => {
            const newState = soundManager.toggle();
            setIsSfxEnabled(newState);
          }}
        >
          <span className="audio-label">SFX:</span>
          <span
            className="audio-value"
            style={{ color: isSfxEnabled ? "#00ff88" : "#ff3e3e" }}
          >
            {isSfxEnabled ? "READY" : "MUTED"}
          </span>
        </div>

        <div className="vol-control-wrapper desktop-only">
          <div
            className="audio-line"
            onClick={() => handleVolumeChange(true)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleVolumeChange(false);
            }}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVolumeChange(e.deltaY < 0, 0.05);
            }}
          >
            <span className="audio-label">VOL:</span>
            <span className="audio-value vol-blocks">{renderVolBlocks()}</span>
          </div>

          <div className="volume-bar-container">
            <div
              ref={barRef}
              className="volume-bar-bg"
              onMouseDown={(e) => {
                setIsDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                setVolume(Math.max(0, Math.min(1, x / rect.width)));
              }}
            >
              <div
                className="volume-bar-fill"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAudio;
