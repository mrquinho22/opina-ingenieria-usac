import {Component,inject,signal} from '@angular/core';
import {Router,RouterLink,RouterLinkActive,RouterOutlet} from '@angular/router';
import {Auth,errorMessage} from './core';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],template:`
<header class="site-header"><div class="container d-flex align-items-center justify-content-between flex-wrap gap-3 py-3"><a class="brand" routerLink="/"><span class="brand-mark">O.</span><span>opina<span class="brand-sub">INGENIERÍA · USAC</span></span></a>
@if(auth.user()){<nav aria-label="Navegación principal" class="d-flex gap-2 flex-wrap align-items-center"><a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active" class="nav-item">Inicio</a><a routerLink="/new" routerLinkActive="active" class="nav-item">Crear publicación</a><a [routerLink]="['/profile',auth.user()!.id]" routerLinkActive="active" class="nav-item">Mi perfil</a><button class="btn btn-outline-light btn-sm" (click)="logout()" [disabled]="closing()">Cerrar sesión</button></nav>}
</div></header>
@if(error()){<div class="container alert alert-danger mt-3" role="alert">{{error()}}</div>}
<main class="container py-4 py-lg-5"><router-outlet/></main><footer class="container py-4 small text-secondary border-top d-flex justify-content-between flex-wrap gap-2"><span>Opina Ingeniería · Proyecto académico</span><span>Segundo semestre 2026 · Ciencias y Sistemas</span></footer>`})
export class App {auth=inject(Auth);router=inject(Router);error=signal('');closing=signal(false);async logout(){this.closing.set(true);try{await this.auth.logout();await this.router.navigate(['/login']);}catch(e){this.error.set(errorMessage(e));}finally{this.closing.set(false);}}}
