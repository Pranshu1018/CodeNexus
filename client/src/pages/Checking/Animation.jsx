import React, { useState, useEffect } from 'react';
import SplitText from "./SplitText";
import Splineo from './Splineo'; // Uncomment if using Splineo
import HomePage from '../HomePage';

function Animation() {
  const [fadeOut, setFadeOut] = useState(false);
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    // Start fading out after 3 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    // Show HomePage after 5 seconds
    const switchTimer = setTimeout(() => {
      setShowHome(true);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(switchTimer);
    };
  }, []);

  if (showHome) {
    return <HomePage />;
  }

  return (
    <div
      className={`fixed inset-0 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ zIndex: 1000, pointerEvents: 'none' }}
    >
      {/* Optionally include the 3D background */}
      
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      >
        <Splineo />
      </div>
     
      <div className="absolute inset-0 flex items-center justify-center">
        <SplitText
          text="CodeNexus"
          className="text-6xl font-semibold text-center text-white"
          delay={300}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
        />
      </div>
    </div>
  );
}

export default Animation;
