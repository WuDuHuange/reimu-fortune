import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const SakuraEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize petals
    const PETAL_COUNT = 50;
    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 10 + 5,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 1 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      opacity: Math.random() * 0.5 + 0.3,
    });

    petalsRef.current = Array.from({ length: PETAL_COUNT }, createPetal);

    // Draw a single petal
    const drawPetal = (petal: Petal) => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      ctx.globalAlpha = petal.opacity;

      // Draw petal shape
      ctx.beginPath();
      ctx.fillStyle = '#FFB7C5'; // Sakura pink
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        petal.size / 2, -petal.size / 2,
        petal.size, -petal.size / 4,
        petal.size, 0
      );
      ctx.bezierCurveTo(
        petal.size, petal.size / 4,
        petal.size / 2, petal.size / 2,
        0, 0
      );
      ctx.fill();

      // Add a slight gradient/highlight
      ctx.beginPath();
      ctx.fillStyle = '#FFC0CB';
      ctx.globalAlpha = petal.opacity * 0.5;
      ctx.arc(petal.size / 3, 0, petal.size / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal, index) => {
        // Update position
        petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.5;
        petal.y += petal.speedY;
        petal.rotation += petal.rotationSpeed;

        // Reset petal if it falls below screen
        if (petal.y > canvas.height + petal.size) {
          petalsRef.current[index] = {
            ...createPetal(),
            y: -petal.size,
            x: Math.random() * canvas.width,
          };
        }

        // Reset petal if it goes off screen horizontally
        if (petal.x > canvas.width + petal.size) {
          petal.x = -petal.size;
        } else if (petal.x < -petal.size) {
          petal.x = canvas.width + petal.size;
        }

        drawPetal(petal);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};
