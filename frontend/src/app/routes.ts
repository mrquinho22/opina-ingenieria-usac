import { Routes } from "@angular/router";
import { guard } from "./core";
import { AuthPage } from "./auth-page";
import { Feed } from "./feed";
import { NewPost } from "./new-post";
import { PostDetail } from "./post-detail";
import { Profile } from "./profile";
export const routes: Routes = [
  { path: "login", component: AuthPage, data: { mode: "login" } },
  { path: "register", component: AuthPage, data: { mode: "register" } },
  { path: "recover", component: AuthPage, data: { mode: "recover" } },
  { path: "", component: Feed, canActivate: [guard] },
  { path: "new", component: NewPost, canActivate: [guard] },
  { path: "posts/:id", component: PostDetail, canActivate: [guard] },
  { path: "profile/:id", component: Profile, canActivate: [guard] },
  { path: "**", redirectTo: "" },
];
