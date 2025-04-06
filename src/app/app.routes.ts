import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./app.component').then(m => m.AppComponent)},
  { path: 'adelson', loadComponent: () => import('./adelson/adelson.component').then(m => m.AdelsonComponent) },
  { path: 'anthoni', loadComponent: () => import('./anthoni/anthoni.component').then(m => m.AnthoniComponent) },
  { path: 'game', loadComponent: () => import('./game/game.component').then(m => m.GameComponent) }
];
