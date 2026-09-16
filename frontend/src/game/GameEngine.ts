import { Bird } from "./Bird";
import { Obstacle } from "./Obstacle";

export enum GameState {
  READY,
  PLAYING,
  GAME_OVER
}

type EventCallback = (state: GameState, score: number) => void;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  private bird!: Bird;
  private obstacles: Obstacle[] = [];
  
  public state: GameState = GameState.READY;
  public score: number = 0;
  
  private animationFrameId: number = 0;
  private frames: number = 0;
  
  private onStateChange?: EventCallback;
  
  constructor(canvas: HTMLCanvasElement, onStateChange?: EventCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;
    
    this.init();
  }
  
  private init() {
    this.bird = new Bird(this.canvas.height / 2);
    this.obstacles = [];
    this.score = 0;
    this.frames = 0;
    
    this.setState(GameState.READY);
    this.draw(); // Initial draw without animation
  }
  
  private setState(newState: GameState) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.state, this.score);
    }
  }
  
  public start() {
    if (this.state === GameState.READY) {
      this.setState(GameState.PLAYING);
      this.bird.jump();
      this.loop();
    } else if (this.state === GameState.GAME_OVER) {
      this.init();
      this.setState(GameState.PLAYING);
      this.bird.jump();
      this.loop();
    }
  }
  
  public stop() {
    cancelAnimationFrame(this.animationFrameId);
  }
  
  public input(action: 'FLAP') {
    if (this.state === GameState.READY || this.state === GameState.GAME_OVER) {
      this.start();
    } else if (this.state === GameState.PLAYING && action === 'FLAP') {
      this.bird.jump();
    }
  }
  
  private loop = () => {
    if (this.state !== GameState.PLAYING) return;
    
    this.update();
    this.draw();
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  private spawnObstacle() {
    // Leave safe margins at top and bottom (e.g. 100px)
    const margin = 100;
    const minCenterY = margin + 90; // Half of gap size (180/2)
    const maxCenterY = this.canvas.height - margin - 90;
    
    const gapCenterY = Math.floor(Math.random() * (maxCenterY - minCenterY + 1)) + minCenterY;
    
    // Dynamic difficulty could adjust gapSize here
    this.obstacles.push(new Obstacle(this.canvas.width, gapCenterY));
  }
  
  private update() {
    this.frames++;
    this.bird.update(this.canvas.height);
    
    // Spawn obstacles every 120 frames (approx 2 seconds at 60fps)
    if (this.frames % 120 === 0) {
      this.spawnObstacle();
    }
    
    // Update obstacles and check collisions/score
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update();
      
      // Collision with pipes
      if (obs.collidesWith(this.bird.x, this.bird.y, this.bird.radius)) {
        this.gameOver();
        return;
      }
      
      // Scoring logic
      if (!obs.passed && this.bird.x > obs.x + obs.width) {
        obs.passed = true;
        this.score++;
        if (this.onStateChange) this.onStateChange(this.state, this.score);
      }
      
      // Cleanup off-screen obstacles
      if (obs.isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Floor collision = Game Over
    if (this.bird.y + this.bird.radius >= this.canvas.height) {
      this.gameOver();
    }
  }
  
  private gameOver() {
    this.setState(GameState.GAME_OVER);
  }
  
  private draw() {
    // Clear canvas
    this.ctx.fillStyle = '#09090b'; // background color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw obstacles
    this.obstacles.forEach(obs => obs.draw(this.ctx, this.canvas.height));
    
    // Draw bird
    this.bird.draw(this.ctx);
  }
}
