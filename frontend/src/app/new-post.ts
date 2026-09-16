import { Component, inject, signal, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Api, Catalog, Post, errorMessage } from "./core";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `<div class="content-narrow">
    <div class="page-intro">
      <div class="eyebrow">APORTA A LA CONVERSACIÓN</div>
      <h1>Comparte tu experiencia.</h1>
      <p class="muted">
        Una opinión útil empieza con respeto y detalles concretos.
      </p>
    </div>
    @if (error()) {
      <div class="alert alert-danger" role="alert">
        {{ error() }}
        @if (!catalog()) {
          <button class="btn btn-sm btn-outline-danger" (click)="load()">
            Reintentar
          </button>
        }
      </div>
    }
    @if (loading()) {
      <p role="status">Cargando catálogo…</p>
    } @else if (catalog()) {
      <section class="card p-4 p-md-5">
        <form #form="ngForm" (ngSubmit)="save()">
          <div class="mb-4">
            <label for="targetType" class="form-label"
              >¿Sobre qué quieres publicar?</label
            ><select
              id="targetType"
              name="type"
              class="form-select"
              [(ngModel)]="type"
              (ngModelChange)="targetId = null"
            >
              <option value="course">Un curso</option>
              <option value="teacher">Un catedrático o auxiliar</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="target" class="form-label">{{
              type === "course"
                ? "Selecciona el curso"
                : "Selecciona el docente"
            }}</label
            ><select
              id="target"
              name="target"
              class="form-select"
              [(ngModel)]="targetId"
              required
            >
              <option [ngValue]="null" disabled>Selecciona una opción</option>
              @if (type === "course") {
                @for (c of catalog()!.courses; track c.id) {
                  @if (c.publication_enabled) {
                    <option [ngValue]="c.id">
                      {{ c.name }}
                    </option>
                  }
                }
              } @else {
                @for (t of catalog()!.teachers; track t.id) {
                  <option [ngValue]="t.id">{{ t.name }} ({{ t.role }})</option>
                }
              }
            </select>
            <div class="form-text">
              Catálogo DTT · semestre
              {{ catalog()!.semester }}.
            </div>
          </div>
          <div class="mb-4">
            <label for="message" class="form-label">Tu opinión</label
            ><textarea
              id="message"
              name="message"
              [(ngModel)]="message"
              class="form-control"
              rows="7"
              required
              maxlength="3000"
              placeholder="¿Qué recomendarías a alguien que llevará este curso?"
            ></textarea>
            <div class="form-text text-end">{{ message.length }} / 3000</div>
          </div>
          <div class="d-flex gap-3 align-items-center">
            <button
              class="btn btn-primary"
              [disabled]="form.invalid || !message.trim() || busy()"
            >
              {{ busy() ? "Guardando…" : "Publicar opinión" }}</button
            ><a routerLink="/" class="btn btn-link">Cancelar</a>
          </div>
        </form>
      </section>
    }
  </div>`,
})
export class NewPost implements OnInit {
  api = inject(Api);
  router = inject(Router);
  catalog = signal<Catalog | null>(null);
  loading = signal(true);
  busy = signal(false);
  error = signal("");
  type = "course";
  targetId: number | null = null;
  message = "";
  ngOnInit() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set("");
    try {
      this.catalog.set(await this.api.get<Catalog>("/catalogs"));
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }
  async save() {
    this.busy.set(true);
    this.error.set("");
    try {
      await this.api.post<Post>("/posts", {
        message: this.message,
        [this.type === "course" ? "course_id" : "teacher_id"]: this.targetId,
      });
      await this.router.navigate(["/"]);
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
