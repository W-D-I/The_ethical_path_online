import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Max scores 
const MAX_CAREER = 6;
const MAX_ETHICS = 6;

export default function App() {
  // Game States
  const [gameState, setGameState] = useState('main_menu');
  
  // Player Stats
  const [scores, setScores] = useState({ career: 0, ethics: 0 });
  
  // Media States
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [onVideoEnd, setOnVideoEnd] = useState(() => () => {});
  
  // Audio Settings
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // --- AUDIO MANAGEMENT ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // --- GAME FLOW LOGIC ---
  const playVideo = (src, nextStep) => {
    setCurrentVideo(src);
    setOnVideoEnd(() => nextStep);
    setGameState('video');
  };

  const showMenu = (choices) => {
    setCurrentChoices(choices);
    setGameState('choice');
  };

  const handleChoice = (videoPath, nextScene, careerIncr, ethicsIncr) => {
    setScores(prev => ({
      career: prev.career + careerIncr,
      ethics: prev.ethics + ethicsIncr
    }));
    playVideo(videoPath, nextScene);
  };

  // --- CHAPTER SCENES ---
  const playIntro = () => playVideo('/assets/intro.mp4', playChapter1);
  const playChapter1 = () => playVideo('/assets/chapter1.mp4', chapter1Menu);
  const playChapter2 = () => playVideo('/assets/2okef.mp4', chapter2Menu);
  const playChapter3 = () => playVideo('/assets/3oKef.mp4', chapter3Menu);
  const playChapter4 = () => playVideo('/assets/chapter4.mp4', chapter4Menu);

  const chapter1Menu = () => showMenu([
    { label: "Do the project as the manager instructs", action: () => handleChoice('/assets/office.mp4', playChapter2, 2, 0) },
    { label: "Totally refuse to work on this project", action: () => handleChoice('/assets/extra1.mp4', playChapter2, 0, 2) },
    { label: "Express your concerns but do what the manager says", action: () => handleChoice('/assets/office_1.mp4', playChapter2, 1, 1) },
  ]);

  const chapter2Menu = () => showMenu([
    { label: "Continue your work it is not your responsibility", action: () => handleChoice('/assets/tv.mp4', playChapter3, 2, 0) },
    { label: "Ask for new data but the project needs more time to complete", action: () => handleChoice('/assets/medical3.mp4', playChapter3, 0, 2) },
    { label: "Try to fix bias manually", action: () => handleChoice('/assets/medical2.mp4', playChapter3, 1, 1) },
  ]);

  const chapter3Menu = () => showMenu([
    { label: "Optimize the algorithm for engagement", action: () => handleChoice('/assets/office.mp4', playChapter4, 2, 0) },
    { label: "Leak the information anonymously", action: () => handleChoice('/assets/extra1.mp4', playChapter4, 0, 2) },
    { label: "Try to make it more “neutral”", action: () => handleChoice('/assets/office_1.mp4', playChapter4, 1, 1) },
  ]);

  const chapter4Menu = () => showMenu([
    { label: "No, I’ll save up and buy it. Maybe I can take on extra work.", action: () => handleChoice('/assets/pirate2.mp4', playEnding, 2, 0) },
    { label: "Pirating is wrong. I’ll wait for a sale or just skip it.", action: () => handleChoice('/assets/pirate3.mp4', playEnding, 0, 2) },
    { label: "I mean… everyone pirates sometimes. I probably won’t get caught.", action: () => handleChoice('/assets/pirate1.mp4', playEnding, 1, 1) },
  ]);

  // --- ENDING LOGIC ---
  const playEnding = () => {
    // Current state relies on functional updates to prevent stale closures,
    // so we evaluate scores exactly as they are right now.
    let endingVideo = '/assets/end3.mp4';
    
    if (scores.career >= MAX_CAREER || scores.career > scores.ethics) {
      endingVideo = '/assets/evilcore.mp4';
    } else if (scores.ethics >= MAX_ETHICS || scores.career < scores.ethics) {
      endingVideo = '/assets/ethical_end.mp4';
    }

    playVideo(endingVideo, backToMainMenu);
  };

  const startGame = () => {
    setScores({ career: 0, ethics: 0 });

    if (audioRef.current) {
      audioRef.current.currentTime = 0;

      audioRef.current.play()
        .then(() => {
          // music started
        })
        .catch(() => {
          // ignore autoplay block
        });
    }

    playIntro(); 
  };
  const backToMainMenu = () => {
    setGameState('main_menu');
  };

  // --- VIDEO CONTROLS ---
  const handleFastForward = (isDown) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = isDown ? 6.0 : 1.0;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'video') {
        if (e.key === 'f') handleFastForward(true);
        if (e.key === ' ' || e.key === 'Escape') {
          // Skip video
          if (videoRef.current) {
            videoRef.current.currentTime = videoRef.current.duration;
          }
        }
      }
    };
    const handleKeyUp = (e) => {
      if (gameState === 'video' && e.key === 'f') handleFastForward(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);


  return (
    <div className="app-container">
      {/* Background Music */}
      <audio ref={audioRef} src="/assets/dejavu.mp3" loop />

      {/* --- MAIN MENU --- */}
      {gameState === 'main_menu' && (
        <div className="menu-scene" style={{ backgroundImage: 'url(/assets/bg.jpg)' }}>
          <h1 className="title shadow-text">The Ethical Path</h1>
          
          <div className="button-container">
            <button className="game-button" onClick={startGame}>Start Game</button>
            <button className="game-button" onClick={() => alert("You can close the tab to quit!")}>Quit</button>
          </div>

          <div className="audio-controls">
            <span>Music</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))} 
            />
            <button className="mute-button" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>
      )}

      {/* --- VIDEO SCENE --- */}
      {gameState === 'video' && (
        <div className="video-scene">
          <video 
            ref={videoRef}
            src={currentVideo}
            className="video-player"
            autoPlay
	    muted
            onEnded={onVideoEnd}
          />
          <button className="skip-button" onClick={onVideoEnd}>
            Skip ▶▶
          </button>
          <div className="ff-hint">Press and hold 'F' to Fast Forward</div>
        </div>
      )}

      {/* --- CHOICE SCENE --- */}
      {gameState === 'choice' && (
        <div className="menu-scene" style={{ backgroundImage: 'url(/assets/bg.jpg)' }}>
          <h2 className="title shadow-text">Make Your Choice</h2>
          <div className="button-container">
            {currentChoices.map((choice, idx) => (
              <button key={idx} className="game-button choice-button" onClick={choice.action}>
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
