import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const BASE = import.meta.env.BASE_URL;

// Max scores 
const MAX_CAREER = 6;
const MAX_ETHICS = 6;

export default function App() {
  // Game States
  const [gameState, setGameState] = useState('main_menu');

  // Warning
  const [showRotateWarning, setShowRotateWarning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRotateWarning(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Player Stats
  const [scores, setScores] = useState({ career: 0, ethics: 0 });
  
  // Media States
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [nextStep, setNextStep] = useState(() => () => {});
  
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
  const playVideo = (src, step) => {
    setCurrentVideo(src);
    setNextStep(() => step);
    setGameState('video');
  };

  const showMenu = (choices) => {
    setCurrentChoices(choices);
    setGameState('choice');
  };

  const handleChoice = (videoPath, nextScene, careerIncr, ethicsIncr) => {
    setScores(prev => {
      const newScores = {
        career: prev.career + careerIncr,
        ethics: prev.ethics + ethicsIncr
      };

      if (nextScene === playEnding) {
        playVideo(videoPath, () => playEnding(newScores));
      } else {
        playVideo(videoPath, nextScene);
      }

      return newScores;
    });
  };

  // --- CHAPTER SCENES ---
  const playIntro = () => playVideo(`${BASE}assets/intro.mp4`, playChapter1);
  const playChapter1 = () => playVideo(`${BASE}assets/chapter1.mp4`, chapter1Menu);
  const playChapter2 = () => playVideo(`${BASE}assets/2okef.mp4`, chapter2Menu);
  const playChapter3 = () => playVideo(`${BASE}assets/3oKef.mp4`, chapter3Menu);
  const playChapter4 = () => playVideo(`${BASE}assets/chapter4.mp4`, chapter4Menu);

  const chapter1Menu = () => showMenu([
    { label: "Do the project as the manager instructs", action: () => handleChoice(`${BASE}assets/office.mp4`, playChapter2, 2, 0) },
    { label: "Totally refuse to work on this project", action: () => handleChoice(`${BASE}assets/extra1.mp4`, playChapter2, 0, 2) },
    { label: "Express your concerns but do what the manager says", action: () => handleChoice(`${BASE}assets/office_1.mp4`, playChapter2, 1, 1) },
  ]);

  const chapter2Menu = () => showMenu([
    { label: "Continue your work it is not your responsibility", action: () => handleChoice(`${BASE}assets/tv.mp4`, playChapter3, 2, 0) },
    { label: "Ask for new data but the project needs more time to complete", action: () => handleChoice(`${BASE}assets/medical3.mp4`, playChapter3, 0, 2) },
    { label: "Try to fix bias manually", action: () => handleChoice(`${BASE}assets/medical2.mp4`, playChapter3, 1, 1) },
  ]);

  const chapter3Menu = () => showMenu([
    { label: "Optimize the algorithm for engagement", action: () => handleChoice(`${BASE}assets/office.mp4`, playChapter4, 2, 0) },
    { label: "Leak the information anonymously", action: () => handleChoice(`${BASE}assets/extra1.mp4`, playChapter4, 0, 2) },
    { label: "Try to make it more “neutral”", action: () => handleChoice(`${BASE}assets/office_1.mp4`, playChapter4, 1, 1) },
  ]);

  const chapter4Menu = () => showMenu([
    { label: "No, I’ll save up and buy it.", action: () => handleChoice(`${BASE}assets/pirate2.mp4`, playEnding, 2, 0) },
    { label: "Pirating is wrong.", action: () => handleChoice(`${BASE}assets/pirate3.mp4`, playEnding, 0, 2) },
    { label: "Everyone pirates sometimes.", action: () => handleChoice(`${BASE}assets/pirate1.mp4`, playEnding, 1, 1) },
  ]);

  // --- ENDING LOGIC ---
  const playEnding = (finalScores) => {
    let endingVideo;

    if (finalScores.career >= MAX_CAREER || finalScores.career > finalScores.ethics) {
      endingVideo = `${BASE}assets/evilcore.mp4`;
    } else if (finalScores.ethics >= MAX_ETHICS || finalScores.career < finalScores.ethics) {
      endingVideo = `${BASE}assets/ethical_end.mp4`;
    } else {
      endingVideo = `${BASE}assets/end3.mp4`;
    }
    playVideo(endingVideo, backToMainMenu);
  };

  const startGame = () => {
    setScores({ career: 0, ethics: 0 });
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    playIntro(); 
  };

  const backToMainMenu = () => {
    setGameState('main_menu');
  };

  // --- VIDEO CONTROLS ---
  const [isFastForward, setIsFastForward] = useState(false);
  
  const toggleFastForward = () => {
    if (!videoRef.current) return;
    const newState = !isFastForward;
    setIsFastForward(newState);
    videoRef.current.playbackRate = newState ? 6.0 : 1.0;
  };

  const handleVideoEnd = () => {
    setIsFastForward(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
    nextStep(); // Call the next part of the game
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'video') {
        if (e.key === ' ' || e.key === 'Escape') {
          if (videoRef.current) {
            videoRef.current.currentTime = videoRef.current.duration;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="app-container">
      {showRotateWarning && (
        <div className="rotate-warning">
           If playing on mobile, rotate your device to play
        </div>
      )}
      
      <audio ref={audioRef} src={`${BASE}assets/dejavu.mp3`} loop />

      {/* --- MAIN MENU --- */}
      {gameState === 'main_menu' && (
        <div className="menu-scene" style={{ backgroundImage: `url(${BASE}assets/bg.jpg)` }}>
          <h1 className="title shadow-text">The Ethical Path</h1>
          <div className="button-container">
            <button className="game-button" onClick={startGame}>Start Game</button>
            <button className="game-button" onClick={() => alert("You can close the tab to quit!")}>Quit</button>
          </div>
          <div className="audio-controls">
            <span>Music Volume</span>
            <input 
              type="range" min="0" max="1" step="0.05" 
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
            onEnded={handleVideoEnd}
          />
          <div className="video-overlay-controls">
            <button className="skip-button" onClick={handleVideoEnd}>
              Skip ▶▶
            </button>
            <button className="ff-button" onClick={toggleFastForward}>
              {isFastForward ? "Normal Speed ⏸" : "FastForward ▶▶"}
            </button>
          </div>
        </div>
      )}

      {/* --- CHOICE SCENE --- */}
      {gameState === 'choice' && (
        <div className="menu-scene" style={{ backgroundImage: `url(${BASE}assets/bg.jpg)` }}>
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
