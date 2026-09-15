import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Api, Auth, errorMessage } from "./core";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: ` <div class="auth-layout">
    <section class="auth-intro">
      <div class="eyebrow">TU COMUNIDAD ACADÉMICA</div>
      <h1>Una experiencia.<br />Más perspectivas.</h1>
      <p class="lead">
        Comparte lo que aprendiste. Encuentra opiniones sobre cursos y docentes
        de Ciencias y Sistemas.
      </p>
      <div class="intro-line"></div>
      <p class="small">
        Un espacio para conversar con respeto y aprender de la experiencia de
        otros estudiantes.
      </p>
      <span class="semester-tag">SEGUNDO SEMESTRE / 2026</span>
    </section>
    <section class="card auth-card">
      <div class="eyebrow text-primary">FACULTAD DE INGENIERÍA</div>
      <h2>{{ title }}</h2>
      <p class="text-secondary">
        {{
          mode === "login"
            ? "Ingresa con tu cuenta de Opina."
            : mode === "register"
              ? "Crea tu cuenta para participar."
              : "Comprueba tus datos y elige una nueva contraseña."
        }}
      </p>
      @if (success()) {
        <div class="alert alert-success" role="status">{{ success() }}</div>
      }
      @if (error()) {
        <div class="alert alert-danger" role="alert">{{ error() }}</div>
      }
      <form #form="ngForm" (ngSubmit)="submit()">
        <div class="mb-3">
          <label for="record" class="form-label">Registro académico</label
          ><input
            id="record"
            class="form-control"
            name="academic_record"
            [(ngModel)]="record"
            required
            pattern="[0-9]{5,20}"
            maxlength="20"
            inputmode="numeric"
            autocomplete="username"
          />
          <div class="form-text">Entre 5 y 20 dígitos.</div>
        </div>
        @if (mode === "register") {
          <div class="row">
            <div class="col-sm-6 mb-3">
              <label for="first" class="form-label">Nombres</label
              ><input
                id="first"
                name="first"
                class="form-control"
                [(ngModel)]="first"
                required
                maxlength="80"
                autocomplete="given-name"
              />
            </div>
            <div class="col-sm-6 mb-3">
              <label for="last" class="form-label">Apellidos</label
              ><input
                id="last"
                name="last"
                class="form-control"
                [(ngModel)]="last"
                required
                maxlength="80"
                autocomplete="family-name"
              />
            </div>
          </div>
        }
        @if (mode !== "login") {
          <div class="mb-3">
            <label for="email" class="form-label">Correo electrónico</label
            ><input
              id="email"
              name="email"
              type="email"
              class="form-control"
              [(ngModel)]="email"
              required
              email
              maxlength="254"
              autocomplete="email"
            />
          </div>
        }
        <div class="mb-3">
          <label for="password" class="form-label">{{
            mode === "recover" ? "Nueva contraseña" : "Contraseña"
          }}</label
          ><input
            id="password"
            name="password"
            class="form-control"
            type="password"
            [(ngModel)]="password"
            required
            [minlength]="mode === 'login' ? 1 : 8"
            [autocomplete]="
              mode === 'login' ? 'current-password' : 'new-password'
            "
          />
          @if (mode !== "login") {
            <div class="form-text">Mínimo 8 caracteres; máximo 72 bytes.</div>
          }
        </div>
        <button
          class="btn btn-primary w-100 py-2"
          [disabled]="form.invalid || busy()"
        >
          {{ busy() ? "Procesando…" : title }}
        </button>
      </form>
      <div class="auth-links">
        @if (mode === "login") {
          <a routerLink="/recover">¿Olvidaste tu contraseña?</a
          ><span
            >¿Aún no tienes cuenta?
            <a routerLink="/register">Regístrate</a></span
          >
        } @else {
          <a routerLink="/login">Volver al inicio de sesión</a>
        }
      </div>
      @if (mode === "recover") {
        <p class="small text-secondary mt-3 mb-0">
          Flujo académico de prueba. Una aplicación pública requiere
          verificación adicional de identidad.
        </p>
      }
    </section>
  </div>`,
})
export class AuthPage {
  api = inject(Api);
  auth = inject(Auth);
  router = inject(Router);
  route = inject(ActivatedRoute);
  mode = this.route.snapshot.data["mode"] as string;
  record = "";
  first = "";
  last = "";
  email = "";
  password = "";
  error = signal("");
  success = signal(
    this.route.snapshot.queryParamMap.has("registered")
      ? "Cuenta creada. Inicia sesión."
      : "",
  );
  busy = signal(false);
  get title() {
    return this.mode === "login"
      ? "Iniciar sesión"
      : this.mode === "register"
        ? "Crear cuenta"
        : "Restablecer contraseña";
  }
  async submit() {
    this.busy.set(true);
    this.error.set("");
    try {
      const b = { academic_record: this.record, password: this.password };
      if (this.mode === "login") {
        await this.auth.login(b);
        await this.router.navigate(["/"]);
      } else if (this.mode === "register") {
        await this.api.post("/auth/register", {
          ...b,
          first_name: this.first,
          last_name: this.last,
          email: this.email,
        });
        await this.router.navigate(["/login"], {
          queryParams: { registered: 1 },
        });
      } else {
        await this.api.post("/auth/recover", { ...b, email: this.email });
        this.success.set("Contraseña actualizada. Ya puedes iniciar sesión.");
        this.password = "";
      }
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
