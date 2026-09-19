export class Bird {
  public y: number;
  public velocity: number;
  public shields: number = 0;
  public invincibilityFrames: number = 0;
  
  public readonly x: number = 100;
  public readonly radius: number = 15;
  
  private gravity: number = 0.5;
  private jumpStrength: number = -8;
  private maxVelocity: number = 12;
  private frames: number = 0;

  constructor(startY: number) {
    this.y = startY;
    this.velocity = 0;
  }

  public addShield(): void {
    this.shields += 1;
  }

  /** Consume one shield and start the invincibility window (60 frames ≈ 1s). */
  public consumeShield(): void {
    if (this.shields > 0) {
      this.shields -= 1;
      this.invincibilityFrames = 90; // ~1.5 seconds at 60fps
    }
  }

  public get isInvincible(): boolean {
    return this.invincibilityFrames > 0;
  }
  
  public update(canvasHeight: number) {
    this.frames++;
    this.velocity += this.gravity;
    
    // Terminal velocity
    if (this.velocity > this.maxVelocity) {
      this.velocity = this.maxVelocity;
    }
    
    this.y += this.velocity;
    
    // Tick down invincibility
    if (this.invincibilityFrames > 0) {
      this.invincibilityFrames--;
    }
    
    // Floor collision (basic logic, engine will handle Game Over state)
    if (this.y + this.radius >= canvasHeight) {
      this.y = canvasHeight - this.radius;
      this.velocity = 0;
    }
    
    // Ceiling collision
    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.velocity = 0;
    }
  }
  
  public jump() {
    this.velocity = this.jumpStrength;
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Calculate tilt angle based on velocity
    let rotation = (this.velocity * 4) * (Math.PI / 180);
    rotation = Math.max(-20 * (Math.PI / 180), Math.min(90 * (Math.PI / 180), rotation));
    ctx.rotate(rotation);

    // Shield aura — drawn beneath the bird
    if (this.shields > 0 || this.isInvincible) {
      // Flash during invincibility (every 6 frames)
      const showAura = this.isInvincible ? (this.invincibilityFrames % 12 < 6) : true;
      if (showAura) {
        const auraRadius = this.radius + 8;
        const gradient = ctx.createRadialGradient(0, 0, this.radius, 0, 0, auraRadius + 4);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.5)');  // cyan-400
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, auraRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Solid shield ring
        ctx.beginPath();
        ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // Draw body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6'; // Primary color
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Draw wing (animated)
    const wingY = Math.sin(this.frames * 0.5) * 4;
    ctx.beginPath();
    ctx.ellipse(-4, wingY, 6, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();
    
    // Draw eye (since it's an eye-tracking game)
    ctx.beginPath();
    ctx.arc(6, -4, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Pupil
    ctx.beginPath();
    ctx.arc(8, -4, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    
    ctx.restore();
  }
}
