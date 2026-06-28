"use client";

import { useState, useEffect } from 'react';

export function useRoverControls() {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': setMovement(m => ({ ...m, forward: true })); break;
        case 's': setMovement(m => ({ ...m, backward: true })); break;
        case 'a': setMovement(m => ({ ...m, left: true })); break;
        case 'd': setMovement(m => ({ ...m, right: true })); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': setMovement(m => ({ ...m, forward: false })); break;
        case 's': setMovement(m => ({ ...m, backward: false })); break;
        case 'a': setMovement(m => ({ ...m, left: false })); break;
        case 'd': setMovement(m => ({ ...m, right: false })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
}
