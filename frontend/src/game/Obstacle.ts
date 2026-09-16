export class Obstacle {
  public x: number;
  public width: number = 60;
  
  // The y-coordinate of the center of the gap
  public gapCenterY: number;
  public gapSize: number = 180;
  
  private speed: number = 4;
  public passed: boolean = false;
  
  constructor(startX: number, gapCenterY: number, gapSize?: number) {
    this.x = startX;
    this.gapCenterY = gapCenterY;
    if (gapSize) {
      this.gapSize = gapSize;
    }
  }
  
  public update() {
    this.x -= this.speed;
  }
  
  public isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
  
  public draw(ctx: CanvasRenderingContext2D, canvasHeight: number) {
    const topHeight = this.gapCenterY - (this.gapSize / 2);
    const bottomY = this.gapCenterY + (this.gapSize / 2);
    const bottomHeight = canvasHeight - bottomY;
    
    ctx.fillStyle = '#27272a'; // Card border color / dark gray
    
    // Draw top pipe
    ctx.fillRect(this.x, 0, this.width, topHeight);
    
    // Draw bottom pipe
    ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
    
    // Draw pipe borders for neon effect
    ctx.strokeStyle = '#6366f1'; // Accent color
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, 0, this.width, topHeight);
    ctx.strokeRect(this.x, bottomY, this.width, bottomHeight);
  }
  
  // Returns true if AABB collision is detected with the bird
  public collidesWith(birdX: number, birdY: number, birdRadius: number): boolean {
    const topHeight = this.gapCenterY - (this.gapSize / 2);
    const bottomY = this.gapCenterY + (this.gapSize / 2);
    
    // Check bounding box first
    if (birdX + birdRadius > this.x && birdX - birdRadius < this.x + this.width) {
      // Inside horizontal bounds of pipe
      // Check if hitting top pipe or bottom pipe
      if (birdY - birdRadius < topHeight || birdY + birdRadius > bottomY) {
        return true;
      }
    }
    
    return false;
  }
}
