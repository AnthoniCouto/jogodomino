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

  public showMenu: boolean = true;
  public numberOfPlayers: number = 2;
  
  private player1Pieces: THREE.Mesh[] = [];
  private player2Pieces: THREE.Mesh[] = [];

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
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.selectedPiece) return;
  
    if (this.selectedPiece.rotation.z % (Math.PI * 2) === Math.PI / 2) {
      this.selectedPiece.rotation.z += Math.PI / 2;
    } else {
      this.selectedPiece.rotation.z += Math.PI / 2;
    }
    this.selectedPiece.rotation.z %= Math.PI * 2;
  }

  initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFEEAAA);
  
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 20;
  
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    this.createDominoPieces();
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onDoubleClick(event: MouseEvent): void {
    if (!this.selectedPiece) return;
  
    if (this.selectedPiece.rotation.z % (Math.PI * 2) === Math.PI / 2) {
      this.selectedPiece.rotation.z += Math.PI / 2;
    } else {
      this.selectedPiece.rotation.z += Math.PI / 2;
    }
    this.selectedPiece.rotation.z %= Math.PI * 2;
  }

  createDominoPieces(): void {
    const geometry = new THREE.PlaneGeometry(1.5, 3);

    for (let left = 0; left <= 6; left++) {
      for (let right = left; right <= 6; right++) {
        const canvas = this.generateDominoTexture(left, right);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture });
  
        const domino = new THREE.Mesh(geometry, material);
        domino.userData = { left, right, owner: null };
  
        const index = this.dominoPieces.length;
        const row = Math.floor(index / 7);
        const col = index % 7;
        domino.position.set(col * 2 - 6, -row * 4 + 10, 0);
  
        this.scene.add(domino);
        this.dominoPieces.push(domino);
      }
    }

    this.shuffleDominoPieces();

    this.player1Pieces = this.dominoPieces.splice(0, 7);
    this.player2Pieces = this.dominoPieces.splice(0, 7);
  
    this.player1Pieces.forEach((domino, index) => {
      domino.position.set(-15, 10 - index * 3, 0);
      this.scene.add(domino);
    });
  
    this.player2Pieces.forEach((domino, index) => {
      domino.position.set(15, 10 - index * 3, 0);
      this.scene.add(domino);
    });
  
    const backMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.dominoPieces.forEach((domino, index) => {
      domino.material = backMaterial;
      domino.rotation.z = Math.PI;
      const row = Math.floor(index / 7);
      const col = index % 7;
      domino.position.set(col * 2 - 6, -row * 4 + 10, 0);
      this.scene.add(domino);
    });
  }

  shuffleDominoPieces(): void {
    for (let i = this.dominoPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.dominoPieces[i], this.dominoPieces[j]] = [this.dominoPieces[j], this.dominoPieces[i]];
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
    const drawDots = (value: number, offsetY: number) => {
      const positions = [
        [],
        [[0.5, 0.5]],
        [[0.25, 0.25], [0.75, 0.75]],
        [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
        [[0.25, 0.25], [0.25, 0.75], [0.75, 0.25], [0.75, 0.75]],
        [[0.25, 0.25], [0.25, 0.75], [0.5, 0.5], [0.75, 0.25], [0.75, 0.75]],
        [[0.25, 0.25], [0.25, 0.75], [0.5, 0.25], [0.5, 0.75], [0.75, 0.25], [0.75, 0.75]],
      ];
      positions[value].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x * size, y * size + offsetY, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
      });
    };
  
    drawDots(left, 0);
    drawDots(right, size);
  
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
  
    const allPieces = [...this.dominoPieces, ...this.player1Pieces, ...this.player2Pieces];
    const intersects = this.raycaster.intersectObjects(allPieces);
  
    if (intersects.length > 0) {
      const selected = intersects[0].object as THREE.Mesh;
  
      if (this.dominoPieces.includes(selected)) {
        const dominoData = selected.userData as DominoData;
        const canvas = this.generateDominoTexture(dominoData.left, dominoData.right);
        const texture = new THREE.CanvasTexture(canvas);
        selected.material = new THREE.MeshBasicMaterial({ map: texture });
        selected.rotation.z = 0;
      }
  
      this.selectedPiece = selected;
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.selectedPiece) return;
  
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 100 - 50;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 100 + 50;
   
    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera);
    this.selectedPiece.position.set(vector.x, vector.y, 0);
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.selectedPiece) return;
  
    this.selectedPiece = null;
  }

  rotatePiece(piece: THREE.Mesh, flip: boolean): void {
    if (flip) {
      piece.rotation.z = Math.PI;
    } else {
      piece.rotation.z = 0;
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
