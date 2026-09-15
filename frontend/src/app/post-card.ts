import { Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Post } from "./core";
@Component({
  selector: "app-post-card",
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `<article class="card post-card">
    <div class="d-flex gap-3 align-items-center">
      <span class="avatar" aria-hidden="true">{{
        post().author_name.charAt(0)
      }}</span>
      <div>
        <a
          [routerLink]="['/profile', post().author_id]"
          class="fw-bold text-decoration-none"
          >{{ post().author_name }}</a
        >
        <div class="small muted">
          {{ post().created_at | date: "dd/MM/yyyy · HH:mm" }}
        </div>
      </div>
    </div>
    <div class="mt-3">
      <span class="topic"
        >{{
          post().course_id
            ? "CURSO"
            : post().teacher_role === "auxiliar"
              ? "AUXILIAR"
              : "CATEDRÁTICO"
        }}
        · {{ post().course_name || post().teacher_name }}</span
      >
    </div>
    <p class="post-message">{{ post().message }}</p>
    <div class="border-top pt-3">
      <a
        [routerLink]="['/posts', post().id]"
        class="small fw-bold text-decoration-none"
        >{{ post().comment_count }} comentarios
        <span aria-hidden="true">↗</span></a
      >
    </div>
  </article>`,
})
export class PostCard {
  post = input.required<Post>();
}
