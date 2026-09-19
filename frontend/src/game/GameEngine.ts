import { Bird } from "./Bird";
import { Obstacle } from "./Obstacle";
import { AudioSystem } from "./AudioSystem";

export enum GameState {
  READY,
  PLAYING,
  PAUSED,
  GAME_OVER
}

type EventCallback = (state: GameState, score: number, shields: number) => void;
type EngineReadyCallback = (engine: GameEngine) => void;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audio: AudioSystem;
  
  private bird!: Bird;
  private obstacles: Obstacle[] = [];
  
  public state: GameState = GameState.READY;
  public score: number = 0;
  
  private animationFrameId: number = 0;
  private frames: number = 0;
  private baseSpeed: number = 4;
  private spawnInterval: number = 120;
  private difficultyModifier: number = 1.0;

  // For collision rate calculation
  private obstaclesPassed: number = 0;
  private collisionsTotal: number = 0;
  
  private onStateChange?: EventCallback;
  private onEngineReady?: EngineReadyCallback;
  
  constructor(canvas: HTMLCanvasElement, onStateChange?: EventCallback, onEngineReady?: EngineReadyCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;
    this.onEngineReady = onEngineReady;
    this.audio = new AudioSystem();
    
    this.init();
    // Notify parent that engine is ready for external control
    if (this.onEngineReady) this.onEngineReady(this);
  }
  
  private init() {
    this.bird = new Bird(this.canvas.height / 2);
    this.obstacles = [];
    this.score = 0;
    this.frames = 0;
    this.baseSpeed = 4;
    this.spawnInterval = 120;
    this.obstaclesPassed = 0;
    this.collisionsTotal = 0;
    
    this.setState(GameState.READY);
    this.draw();
  }
  
  private setState(newState: GameState) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.state, this.score, this.bird?.shields ?? 0);
    }
  }
  
  public start() {
    if (this.state === GameState.READY) {
      this.setState(GameState.PLAYING);
      this.bird.jump();
      this.audio.playFlap();
      this.loop();
    } else if (this.state === GameState.GAME_OVER) {
      this.init();
      this.setState(GameState.PLAYING);
      this.bird.jump();
      this.audio.playFlap();
      this.loop();
    }
  }
  
  public togglePause() {
    if (this.state === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
    } else if (this.state === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
      this.loop();
    }
  }
  
  public stop() {
    cancelAnimationFrame(this.animationFrameId);
  }
  
  public input(action: 'FLAP' | 'PAUSE') {
    if (action === 'PAUSE') {
      this.togglePause();
      return;
    }
    
    if (this.state === GameState.READY || this.state === GameState.GAME_OVER) {
      this.start();
    } else if (this.state === GameState.PLAYING && action === 'FLAP') {
      this.bird.jump();
      this.audio.playFlap();
    }
  }

  /** Grant the bird one shield. Called externally when a push-up rep is completed. */
  public addShield(): void {
    if (this.state === GameState.PLAYING) {
      this.bird.addShield();
      // Fire state change so HUD updates shield count
      if (this.onStateChange) {
        this.onStateChange(this.state, this.score, this.bird.shields);
      }
    }
  }
  
  private loop = () => {
    if (this.state !== GameState.PLAYING) return;
    
    this.update();
    this.draw();
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  private spawnObstacle() {
    const margin = 100;
    const minCenterY = margin + 90;
    const maxCenterY = this.canvas.height - margin - 90;
    
    const gapCenterY = Math.floor(Math.random() * (maxCenterY - minCenterY + 1)) + minCenterY;
    
    const obs = new Obstacle(this.canvas.width, gapCenterY);
    obs.setSpeed(this.baseSpeed);
    this.obstacles.push(obs);
  }
  
  /** Returns the ratio of collisions to total obstacles encountered (0–1). */
  public getCollisionRate(): number {
    const total = this.obstaclesPassed + this.collisionsTotal;
    return total === 0 ? 0 : this.collisionsTotal / total;
  }

  /** Called by the external DifficultyEngine to set a modifier on base speed. */
  public setDifficultyModifier(modifier: number): void {
    this.difficultyModifier = Math.max(0.6, Math.min(1.5, modifier));
  }

  private updateDifficulty() {
    // Score-based progression × external difficulty modifier
    const scoreBase = 4 + Math.floor(this.score / 5) * 0.5;
    this.baseSpeed = Math.min(10, scoreBase * this.difficultyModifier);
    this.spawnInterval = Math.max(50, 120 - Math.floor(this.score / 5) * 10);
  }
  
  private update() {
    this.frames++;
    this.bird.update(this.canvas.height);
    
    if (this.frames % this.spawnInterval === 0) {
      this.spawnObstacle();
    }
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.setSpeed(this.baseSpeed); // apply current difficulty speed
      obs.update();
      
      if (obs.collidesWith(this.bird.x, this.bird.y, this.bird.radius)) {
        if (!this.bird.isInvincible) {
          this.collisionsTotal++;
          if (this.bird.shields > 0) {
            this.bird.consumeShield();
            this.audio.playFlap();
            if (this.onStateChange) this.onStateChange(this.state, this.score, this.bird.shields);
          } else {
            this.gameOver();
            return;
          }
        }
      }
      
      if (!obs.passed && this.bird.x > obs.x + obs.width) {
        obs.passed = true;
        this.score++;
        this.obstaclesPassed++;
        this.updateDifficulty();
        this.audio.playScore();
        if (this.onStateChange) this.onStateChange(this.state, this.score, this.bird.shields);
      }
      
      if (obs.isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }
    
    if (this.bird.y + this.bird.radius >= this.canvas.height) {
      this.gameOver();
    }
  }
  
  private gameOver() {
    this.audio.playHit();
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
