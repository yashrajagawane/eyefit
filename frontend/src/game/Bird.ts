export class Bird {
  public y: number;
  public velocity: number;
  
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
  
  public update(canvasHeight: number) {
    this.frames++;
    this.velocity += this.gravity;
    
    // Terminal velocity
    if (this.velocity > this.maxVelocity) {
      this.velocity = this.maxVelocity;
    }
    
    this.y += this.velocity;
    
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
    // When velocity is negative (going up), tilt up. When positive (going down), tilt down.
    let rotation = (this.velocity * 4) * (Math.PI / 180);
    // Cap rotation between -20 and 90 degrees
    rotation = Math.max(-20 * (Math.PI / 180), Math.min(90 * (Math.PI / 180), rotation));
    ctx.rotate(rotation);
    
    // Draw body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6'; // Primary color
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Draw wing (animated)
    const wingY = Math.sin(this.frames * 0.5) * 4; // Flapping motion
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
