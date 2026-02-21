import { useEffect, useRef } from 'react';

// Petal color palettes
const COLOR_PALETTES = {
  cream: [
    { r: 240, g: 220, b: 200 },  // warm cream
    { r: 235, g: 215, b: 195 },  // soft beige
    { r: 245, g: 225, b: 205 },  // pale apricot
    { r: 230, g: 210, b: 190 },  // muted sand
    { r: 238, g: 218, b: 200 },  // dusty rose cream
  ],
  dark: [
    { r: 200, g: 185, b: 165 },  // warm dark cream
    { r: 195, g: 180, b: 160 },  // muted tan
    { r: 205, g: 190, b: 170 },  // soft khaki
    { r: 190, g: 175, b: 155 },  // dusty sand
    { r: 198, g: 183, b: 163 },  // warm bisque
  ],
};

class Petal {
  constructor(W, H, colors, maxOpacity) {
    this.W = W;
    this.H = H;
    this.colors = colors;
    this.maxOpacity = maxOpacity;
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * this.W;
    this.y = initial ? Math.random() * this.H : -20;

    // Size: 8-15px
    this.size = 8 + Math.random() * 7;

    // Opacity: 0.15 ~ maxOpacity
    this.opacity = 0.15 + Math.random() * (this.maxOpacity - 0.15);

    // Fall speed: slow
    this.speedY = 0.3 + Math.random() * 0.5;

    // Horizontal drift
    this.speedX = (Math.random() - 0.5) * 0.3;

    // Sway parameters
    this.swayAmplitude = 0.3 + Math.random() * 0.5;
    this.swayFrequency = 0.008 + Math.random() * 0.008;
    this.swayOffset = Math.random() * Math.PI * 2;

    // Rotation
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.015;

    // 3D tilt effect
    this.tilt = Math.random() * Math.PI * 2;
    this.tiltSpeed = 0.01 + Math.random() * 0.015;

    // Color
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];

    // Petal shape variation
    this.widthRatio = 0.5 + Math.random() * 0.3;
    this.curvature = 0.2 + Math.random() * 0.3;

    this.time = initial ? Math.random() * 1000 : 0;
  }

  update() {
    this.time++;

    // Gentle sway
    const sway = Math.sin(this.time * this.swayFrequency + this.swayOffset) * this.swayAmplitude;

    this.x += this.speedX + sway;
    this.y += this.speedY;

    // Rotation
    this.rotation += this.rotationSpeed;

    // 3D tilt
    this.tilt += this.tiltSpeed;

    // Reset when out of screen
    if (this.y > this.H + 30 || this.x < -30 || this.x > this.W + 30) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 3D tilt simulation
    const tiltScale = 0.4 + Math.abs(Math.cos(this.tilt)) * 0.6;
    ctx.scale(tiltScale, 1);

    const { r, g, b } = this.color;
    ctx.globalAlpha = this.opacity;

    // Petal shape using bezier curves
    const s = this.size;
    const w = s * this.widthRatio;
    const curve = this.curvature;

    ctx.beginPath();

    // Start at tip
    ctx.moveTo(0, -s * 0.5);

    // Right side curve
    ctx.bezierCurveTo(
      w * 0.8, -s * 0.3,
      w * (1 + curve), s * 0.1,
      w * 0.15, s * 0.5
    );

    // Bottom tip
    ctx.bezierCurveTo(
      w * 0.05, s * 0.55,
      -w * 0.05, s * 0.55,
      -w * 0.15, s * 0.5
    );

    // Left side curve
    ctx.bezierCurveTo(
      -w * (1 + curve), s * 0.1,
      -w * 0.8, -s * 0.3,
      0, -s * 0.5
    );

    ctx.closePath();

    // Radial gradient for depth
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.6);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity * 1.2})`);
    gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.8})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.3})`);

    ctx.fillStyle = gradient;
    ctx.fill();

    // Subtle center vein line
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.4);
    ctx.quadraticCurveTo(w * 0.05, 0, 0, s * 0.4);
    ctx.strokeStyle = `rgba(${Math.min(r + 10, 255)}, ${Math.min(g + 5, 255)}, ${b}, ${this.opacity * 0.3})`;
    ctx.lineWidth = 0.3;
    ctx.stroke();

    ctx.restore();
  }

  resize(W, H) {
    this.W = W;
    this.H = H;
  }
}

export default function PetalEffect({ count = 18, opacity = 0.35, color = 'cream' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const petalsRef = useRef([]);
  const sizeRef = useRef({ W: 0, H: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const colors = COLOR_PALETTES[color] || COLOR_PALETTES.cream;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth;
      const H = window.innerHeight;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = { W, H };

      // Update existing petals with new dimensions
      for (const petal of petalsRef.current) {
        petal.resize(W, H);
      }
    }

    resize();

    // Create petals
    const { W, H } = sizeRef.current;
    petalsRef.current = [];
    for (let i = 0; i < count; i++) {
      petalsRef.current.push(new Petal(W, H, colors, opacity));
    }

    // Animation loop
    function animate() {
      const { W, H } = sizeRef.current;
      ctx.clearRect(0, 0, W, H);

      for (const petal of petalsRef.current) {
        petal.update();
        petal.draw(ctx);
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
      petalsRef.current = [];
    };
  }, [count, opacity, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
}
