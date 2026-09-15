import { Component, inject, signal, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Api, Post, Comment, errorMessage } from "./core";
import { PostCard } from "./post-card";
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, PostCard],
  template: `<div class="content-narrow">
    <a routerLink="/" class="small text-decoration-none"
      >← Volver a publicaciones</a
    >
    <h1 class="h2 mt-4 mb-4">La conversación</h1>
    @if (error()) {
      <div class="alert alert-danger" role="alert">
        {{ error() }}
        <button class="btn btn-sm btn-outline-danger" (click)="load()">
          Reintentar
        </button>
      </div>
    }
    @if (loading()) {
      <p role="status">Cargando conversación…</p>
    } @else if (post()) {
      <app-post-card [post]="post()!" />
      <section class="card p-4">
        <h2 class="h5 mb-4">Comentarios · {{ comments().length }}</h2>
        @for (c of comments(); track c.id) {
          <article class="border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between gap-2 flex-wrap">
              <a
                [routerLink]="['/profile', c.author_id]"
                class="fw-bold text-decoration-none"
                >{{ c.author_name }}</a
              ><time class="small muted">{{
                c.created_at | date: "dd/MM/yyyy HH:mm"
              }}</time>
            </div>
            <p class="post-message mb-0">{{ c.message }}</p>
          </article>
        } @empty {
          <p class="muted">Aún no hay comentarios. Añade una perspectiva.</p>
        }
        <form #form="ngForm" (ngSubmit)="save()">
          <label for="comment" class="form-label">Agrega un comentario</label
          ><textarea
            id="comment"
            name="comment"
            class="form-control"
            [(ngModel)]="message"
            rows="4"
            required
            maxlength="2000"
          ></textarea>
          <div class="form-text text-end">{{ message.length }} / 2000</div>
          <button
            class="btn btn-primary mt-3"
            [disabled]="form.invalid || !message.trim() || busy()"
          >
            {{ busy() ? "Guardando…" : "Comentar" }}
          </button>
          @if (success()) {
            <p class="text-success mt-3" role="status">Comentario guardado.</p>
          }
        </form>
      </section>
    }
  </div>`,
})
export class PostDetail implements OnInit {
  api = inject(Api);
  route = inject(ActivatedRoute);
  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  busy = signal(false);
  success = signal(false);
  error = signal("");
  message = "";
  get id() {
    return this.route.snapshot.paramMap.get("id");
  }
  ngOnInit() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set("");
    try {
      const [p, c] = await Promise.all([
        this.api.get<Post>("/posts/" + this.id),
        this.api.get<Comment[]>("/posts/" + this.id + "/comments"),
      ]);
      this.post.set(p);
      this.comments.set(c);
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }
  async save() {
    this.busy.set(true);
    this.success.set(false);
    this.error.set("");
    try {
      await this.api.post("/posts/" + this.id + "/comments", {
        message: this.message,
      });
      this.message = "";
      await this.load();
      this.success.set(true);
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
