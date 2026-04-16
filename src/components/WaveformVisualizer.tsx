import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformVisualizerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  progressColor?: string;
  waveColor?: string;
  height?: number;
  className?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  audioUrl, 
  isPlaying, 
  onPlayPause,
  progressColor = '#e7ffc4', // tertiary lime
  waveColor = 'rgba(59, 66, 112, 0.4)', // dark indigo
  height = 40,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: waveColor,
      progressColor: progressColor,
      cursorColor: 'transparent',
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      height: height,
      normalize: true,
      interact: true,
      hideScrollbar: true,
    });

    wavesurferRef.current = ws;

    ws.load(audioUrl);

    ws.on('ready', () => {
      setIsReady(true);
    });

    ws.on('play', () => onPlayPause(true));
    ws.on('pause', () => onPlayPause(false));
    ws.on('finish', () => onPlayPause(false));

    // Support seeking
    ws.on('interaction', () => {
      // User clicked to seek
    });

    return () => {
      ws.destroy();
    };
  }, [audioUrl, waveColor, progressColor, height]);

  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      if (isPlaying) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    }
  }, [isPlaying, isReady]);

  return (
    <div className={`relative w-full ${className}`}>
      {!isReady && (
        <div className="absolute inset-0 flex items-center gap-1.5 px-1 py-2">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-surface-variant animate-pulse rounded-full"
              style={{ 
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
};

export default WaveformVisualizer;
