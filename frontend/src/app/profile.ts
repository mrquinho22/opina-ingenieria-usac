import { Component, inject, signal, OnInit, OnDestroy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { Api, Auth, User, Catalog, errorMessage } from "./core";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `<div class="page-intro">
      <div class="eyebrow">COMUNIDAD DE ESTUDIANTES</div>
      <h1>{{ own() ? "Mi perfil" : "Perfil del estudiante" }}</h1>
      <p class="muted">Información personal y recorrido académico declarado.</p>
    </div>
    @if (error()) {
      <div class="alert alert-danger" role="alert">
        {{ error() }}
        <button class="btn btn-sm btn-outline-danger" (click)="load()">
          Reintentar
        </button>
      </div>
    }
    @if (success()) {
      <div class="alert alert-success" role="status">{{ success() }}</div>
    }
    @if (loading()) {
      <p role="status">Cargando perfil…</p>
    } @else if (user()) {
      <div class="row g-4">
        <section class="col-lg-5">
          <div class="card p-4">
            <div class="d-flex gap-3 align-items-center mb-4">
              <span class="avatar">{{ user()!.first_name.charAt(0) }}</span>
              <div>
                <h2 class="h5 mb-1">
                  {{ user()!.first_name }} {{ user()!.last_name }}
                </h2>
                <span class="small muted"
                  >Registro {{ user()!.academic_record }}</span
                >
              </div>
            </div>
            @if (own()) {
              <form #form="ngForm" (ngSubmit)="saveProfile()">
                <div class="mb-3">
                  <label for="profileRecord" class="form-label"
                    >Registro académico</label
                  ><input
                    id="profileRecord"
                    class="form-control"
                    [value]="user()!.academic_record"
                    readonly
                  />
                  <div class="form-text">
                    El registro académico no se puede modificar.
                  </div>
                </div>
                <div class="mb-3">
                  <label for="profileFirst" class="form-label">Nombres</label
                  ><input
                    id="profileFirst"
                    name="first"
                    class="form-control"
                    [(ngModel)]="first"
                    required
                    maxlength="80"
                  />
                </div>
                <div class="mb-3">
                  <label for="profileLast" class="form-label">Apellidos</label
                  ><input
                    id="profileLast"
                    name="last"
                    class="form-control"
                    [(ngModel)]="last"
                    required
                    maxlength="80"
                  />
                </div>
                <div class="mb-4">
                  <label for="profileEmail" class="form-label"
                    >Correo electrónico</label
                  ><input
                    id="profileEmail"
                    name="email"
                    type="email"
                    class="form-control"
                    [(ngModel)]="email"
                    required
                    email
                    maxlength="254"
                  />
                </div>
                <button
                  class="btn btn-primary"
                  [disabled]="form.invalid || busy()"
                >
                  Guardar cambios
                </button>
              </form>
            } @else {
              <dl>
                <dt class="small muted">Correo electrónico</dt>
                <dd class="text-break">{{ user()!.email }}</dd>
                <dt class="small muted">Registro académico</dt>
                <dd>{{ user()!.academic_record }}</dd>
              </dl>
              <p class="small muted mb-0">
                Solo el propietario puede editar este perfil.
              </p>
            }
          </div>
        </section>
        <section class="col-lg-7">
          <div
            class="profile-stats d-flex align-items-center justify-content-between mb-4"
          >
            <div>
              <div class="eyebrow mb-1">MI RECORRIDO ACADÉMICO</div>
              <h2 class="h5 mb-0">
                {{ user()!.courses?.length }} cursos aprobados
              </h2>
            </div>
            <div class="text-end">
              <strong>{{ user()!.total_credits }}</strong>
              <div class="small">créditos CLAR</div>
            </div>
          </div>
          <div class="card p-4">
            <h2 class="h5 mb-3">Cursos aprobados</h2>
            <p class="small muted">
              Pénsum CLAR 2025 · Información declarada por el estudiante.
            </p>
            @if (user()!.courses?.length) {
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Curso</th>
                      <th class="text-end">Créditos</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of user()!.courses; track c.id) {
                      <tr>
                        <td class="small">{{ c.code }}</td>
                        <td>{{ c.name }}</td>
                        <td class="text-end">{{ c.credits }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colspan="2">Total</th>
                      <th class="text-end">{{ user()!.total_credits }}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            } @else {
              <p class="muted py-3">
                Todavía no se han registrado cursos aprobados.
              </p>
            }
            @if (own()) {
              <form
                #courseForm="ngForm"
                (ngSubmit)="addCourse()"
                class="border-top pt-4 mt-2"
              >
                <label for="approvedCourse" class="form-label"
                  >Agregar curso aprobado</label
                ><select
                  id="approvedCourse"
                  name="course"
                  [(ngModel)]="courseId"
                  class="form-select mb-3"
                  required
                >
                  <option [ngValue]="null" disabled>
                    Selecciona un curso del pénsum
                  </option>
                  @for (c of available(); track c.id) {
                    <option [ngValue]="c.id">
                      {{ c.code }} · {{ c.name }} ({{ c.credits }} CLAR)
                    </option>
                  }</select
                ><button
                  class="btn btn-outline-primary"
                  [disabled]="courseForm.invalid || busy()"
                >
                  Agregar curso
                </button>
              </form>
            }
          </div>
        </section>
      </div>
    }
    <a routerLink="/" class="btn btn-link mt-4">Volver al inicio</a>`,
})
export class Profile implements OnInit, OnDestroy {
  api = inject(Api);
  auth = inject(Auth);
  route = inject(ActivatedRoute);
  user = signal<User | null>(null);
  catalog = signal<Catalog | null>(null);
  loading = signal(true);
  busy = signal(false);
  error = signal("");
  success = signal("");
  first = "";
  last = "";
  email = "";
  courseId: number | null = null;
  subscription?: Subscription;
  requestId = 0;
  own() {
    return this.user()?.id === this.auth.user()?.id;
  }
  available() {
    return (
      this.catalog()?.courses.filter(
        (c) => !this.user()?.courses?.some((a) => a.id === c.id),
      ) || []
    );
  }
  ngOnInit() {
    this.subscription = this.route.paramMap.subscribe(() => {
      this.success.set("");
      void this.load();
    });
  }
  ngOnDestroy() {
    this.requestId++;
    this.subscription?.unsubscribe();
  }
  async load() {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.error.set("");
    try {
      const [u, c] = await Promise.all([
        this.api.get<User>("/users/" + this.route.snapshot.paramMap.get("id")),
        this.api.get<Catalog>("/catalogs"),
      ]);
      if (requestId !== this.requestId) return;
      this.user.set(u);
      this.catalog.set(c);
      this.first = u.first_name;
      this.last = u.last_name;
      this.email = u.email;
    } catch (e) {
      if (requestId === this.requestId) this.error.set(errorMessage(e));
    } finally {
      if (requestId === this.requestId) this.loading.set(false);
    }
  }
  async saveProfile() {
    this.busy.set(true);
    this.error.set("");
    this.success.set("");
    try {
      const u = await this.api.patch<User>("/users/" + this.user()!.id, {
        first_name: this.first,
        last_name: this.last,
        email: this.email,
      });
      this.auth.user.set(u);
      await this.load();
      this.success.set("Perfil actualizado.");
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
  async addCourse() {
    this.busy.set(true);
    this.error.set("");
    this.success.set("");
    try {
      await this.api.post("/users/" + this.user()!.id + "/approved-courses", {
        course_id: this.courseId,
      });
      this.courseId = null;
      await this.load();
      this.success.set("Curso aprobado agregado. Créditos actualizados.");
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
