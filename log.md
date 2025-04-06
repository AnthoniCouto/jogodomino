
// game.component.html
<div class="hud">
    <h2>{{ turnText }}</h2>
  </div>
  <canvas #gameCanvas></canvas>
// game.component.scss
canvas {
    width: 100%;
    height: 100vh;
    display: block;
    background-color: #228B22;
  }
  
  .hud {
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-size: 24px;
    z-index: 10;
    font-weight: bold;
  }
  
// game.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { Vector2 } from 'three';

interface DominoData {
  left: number;
  right: number;
  owner: number;
}

@Component({
  standalone: true,
  selector: 'app-game',
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private mouse = new Vector2();

  private dominoPieces: THREE.Mesh[] = [];
  private selectedPiece: THREE.Mesh | null = null;
  private currentPlayer: number = 1;
  public winner: number | null = null;
  public turnText = 'Jogador 1';

  private placedDominoes: THREE.Mesh[] = [];

  private boardEnds: [number, number] = [-1, -1];

  ngOnInit(): void {
    this.initScene();
    this.animate();
  }

  initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x228B22);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 20;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    this.createDominoPieces();
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  createDominoPieces(): void {
    const geometry = new THREE.BoxGeometry(1, 2, 0.3);

    const usedPairs = new Set<string>();

    for (let p = 0; p < 14; p++) {
      let left: number;
      let right: number;
      do {
        left = Math.floor(Math.random() * 7);
        right = Math.floor(Math.random() * 7);
      } while (usedPairs.has(`${left}-${right}`) || usedPairs.has(`${right}-${left}`));
      usedPairs.add(`${left}-${right}`);

      const canvas = this.generateDominoTexture(left, right);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({ map: texture });

      const domino = new THREE.Mesh(geometry, material);
      domino.userData = { left, right, owner: p % 2 === 0 ? 1 : 2 };
      domino.position.set((p % 7) * 1.5 - 4.5, p < 7 ? -6 : -8, 0);
      this.scene.add(domino);
      this.dominoPieces.push(domino);
    }
  }

  generateDominoTexture(left: number, right: number): HTMLCanvasElement {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size * 2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size * 2);
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(size, size);
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(left), size / 2, size / 2);
    ctx.fillText(String(right), size / 2, size + size / 2);

    return canvas;
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  onMouseDown(event: MouseEvent): void {
    if (this.winner) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.dominoPieces);

    if (intersects.length > 0) {
      const selected = intersects[0].object as THREE.Mesh;
      if (selected.userData['owner'] === this.currentPlayer) {
        this.selectedPiece = selected;
      }
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.selectedPiece) return;

    const data: DominoData = this.selectedPiece.userData as DominoData;
    const canPlace = this.validateMove(data);
    if (!canPlace) {
      console.log(`Movimento inválido: ${JSON.stringify(data)} não pode ser colocado nos extremos ${JSON.stringify(this.boardEnds)}`);
    }

    if (canPlace) {
      if (this.placedDominoes.length === 0) {
        this.boardEnds = [data.left, data.right];
        this.selectedPiece.position.set(0, 0, 0);
      } else {
        const [leftEnd, rightEnd] = this.boardEnds;

        if (data.left === leftEnd || data.right === leftEnd) {
          this.boardEnds[0] = data.left === leftEnd ? data.right : data.left;
          this.selectedPiece.position.set(this.placedDominoes[0].position.x - 1.5, 0, 0);
          this.placedDominoes.unshift(this.selectedPiece);
        } else {
          this.boardEnds[1] = data.left === rightEnd ? data.right : data.left;
          this.selectedPiece.position.set(this.placedDominoes[this.placedDominoes.length - 1].position.x + 1.5, 0, 0);
          this.placedDominoes.push(this.selectedPiece);
        }
      }

      this.dominoPieces = this.dominoPieces.filter(p => p !== this.selectedPiece);
      this.selectedPiece = null;
      this.checkWinCondition();
      this.switchPlayer();
    } else {
      this.selectedPiece.position.y = this.selectedPiece.position.y < -7 ? -6 : -8;
      this.selectedPiece = null;
    }
  }

  validateMove(data: DominoData): boolean {
    if (this.placedDominoes.length === 0) return true;
    const [leftEnd, rightEnd] = this.boardEnds;
    return data.left === leftEnd || data.right === leftEnd || data.left === rightEnd || data.right === rightEnd;
  }

  switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.turnText = `Jogador ${this.currentPlayer}`;
  }

  checkWinCondition(): void {
    const remaining = this.dominoPieces.filter(p => p.userData['owner'] === this.currentPlayer);
    if (remaining.length === 0) {
      this.winner = this.currentPlayer;
      this.turnText = `Jogador ${this.currentPlayer} venceu!`;
    }
  }
}

