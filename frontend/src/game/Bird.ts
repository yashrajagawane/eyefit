export class Bird {
  public y: number;
  public velocity: number;
  
  public readonly x: number = 100;
  public readonly radius: number = 15;
  
  private gravity: number = 0.5;
  private jumpStrength: number = -8;
  private maxVelocity: number = 12;
  
  constructor(startY: number) {
    this.y = startY;
    this.velocity = 0;
  }
  
  public update(canvasHeight: number) {
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
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6'; // Primary color
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Draw eye (since it's an eye-tracking game)
    ctx.beginPath();
    ctx.arc(this.x + 6, this.y - 4, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.x + 8, this.y - 4, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
  }
}
