import React, { useEffect, useRef, useState } from 'react';

const ConfettiEffect = ({ active, duration = 2000 }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const gravity = 0.2;
    const pieces = [];
    const numberOfPieces = 100;
    
    // Create initial confetti pieces
    for (let i = 0; i < numberOfPieces; i++) {
      pieces.push({
        x: Math.random() * width, // random x position
        y: -5 + Math.random() * 10, // start at or just above the viewport top
        vx: (Math.random() - 0.5) * 10, // horizontal velocity
        vy: Math.random() * 3, // vertical velocity
        size: Math.random() * 6 + 2, // size between 2-8px
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5
      });
    }
    
    let animationFrame;
    const startTime = Date.now();
    
    const draw = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw confetti pieces
      for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        
        // Apply physics
        piece.vy += gravity;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;
        
        // Draw the piece
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        
        ctx.restore();
        
        // Remove pieces that are off-screen
        if (piece.y > height) {
          pieces.splice(i, 1);
          i--;
        }
      }
      
      // Stop animation after duration or when all pieces are gone
      if (elapsed < duration && pieces.length > 0) {
        animationFrame = requestAnimationFrame(draw);
      }
    };
    
    // Start animation
    draw();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active, duration]);
  
  if (!active) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      width={dimensions.width}
      height={dimensions.height}
    />
  );
};

export default ConfettiEffect;