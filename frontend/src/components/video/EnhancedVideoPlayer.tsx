import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture, SkipBack, SkipForward } from 'lucide-react';
import { userService } from '../../services/user.service';

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  videoId: string;
  chapters?: Array<{ title: string; timestamp: number; description?: string }>;
  onTimeUpdate?: (currentTime: number) => void;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  videoId,
  chapters = [],
  onTimeUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const savePositionIntervalRef = useRef<NodeJS.Timeout>();

  // Load saved watch position
  useEffect(() => {
    const loadWatchPosition = async () => {
      try {
        const response = await userService.getWatchPosition(videoId);
        if (response.success && response.data.position > 0 && videoRef.current) {
          videoRef.current.currentTime = response.data.position;
        }
      } catch (error) {
        console.error('Error loading watch position:', error);
      }
    };

    loadWatchPosition();
  }, [videoId]);

  // Save watch position periodically
  useEffect(() => {
    savePositionIntervalRef.current = setInterval(() => {
      if (videoRef.current && currentTime > 0) {
        userService.updateWatchPosition(videoId, currentTime).catch(console.error);
      }
    }, 10000); // Save every 10 seconds

    return () => {
      if (savePositionIntervalRef.current) {
        clearInterval(savePositionIntervalRef.current);
      }
    };
  }, [videoId, currentTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          videoRef.current.currentTime = duration * percent;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, volume, isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const adjustVolume = (delta: number) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate?.(time);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const jumpToChapter = (timestamp: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timestamp;
  };

  return (
    <div 
      className="relative bg-black group aspect-video"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={thumbnailUrl}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Chapters Overlay */}
      {chapters.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 max-h-48 overflow-y-auto">
          <div className="text-xs font-semibold text-white mb-2">Chapters</div>
          {chapters.map((chapter, idx) => (
            <button
              key={idx}
              onClick={() => jumpToChapter(chapter.timestamp)}
              className={`block w-full text-left text-xs text-white/80 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors ${
                currentTime >= chapter.timestamp && (idx === chapters.length - 1 || currentTime < chapters[idx + 1].timestamp)
                  ? 'bg-purple-600/50 text-white'
                  : ''
              }`}
            >
              <div className="font-medium">{formatTime(chapter.timestamp)}</div>
              <div className="truncate">{chapter.title}</div>
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              setCurrentTime(time);
              if (videoRef.current) videoRef.current.currentTime = time;
            }}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button onClick={() => skip(-10)} className="text-white hover:text-purple-400 transition-colors">
              <SkipBack size={20} />
            </button>
            
            <button onClick={() => skip(10)} className="text-white hover:text-purple-400 transition-colors">
              <SkipForward size={20} />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setVolume(vol);
                  if (videoRef.current) videoRef.current.volume = vol;
                  setIsMuted(vol === 0);
                }}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                if (videoRef.current) videoRef.current.playbackRate = rate;
              }}
              className="bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer"
              style={{ backgroundColor: '#374151' }}
            >
              <option value="0.5" style={{ backgroundColor: '#1f2937' }}>0.5x</option>
              <option value="0.75" style={{ backgroundColor: '#1f2937' }}>0.75x</option>
              <option value="1" style={{ backgroundColor: '#1f2937' }}>1x</option>
              <option value="1.25" style={{ backgroundColor: '#1f2937' }}>1.25x</option>
              <option value="1.5" style={{ backgroundColor: '#1f2937' }}>1.5x</option>
              <option value="1.75" style={{ backgroundColor: '#1f2937' }}>1.75x</option>
              <option value="2" style={{ backgroundColor: '#1f2937' }}>2x</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={togglePictureInPicture} className="text-white hover:text-purple-400 transition-colors">
              <PictureInPicture size={20} />
            </button>
            
            <button onClick={toggleFullscreen} className="text-white hover:text-purple-400 transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 bg-purple-600/80 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
            <Play size={40} className="text-white ml-2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoPlayer;
