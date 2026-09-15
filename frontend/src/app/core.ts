import {inject,Injectable,signal} from '@angular/core';
import {HttpClient,HttpErrorResponse,HttpInterceptorFn} from '@angular/common/http';
import {Router,CanActivateFn} from '@angular/router';
import {firstValueFrom,catchError,throwError} from 'rxjs';
export interface User {id:number;academic_record:string;first_name:string;last_name:string;email:string;courses?:Course[];total_credits?:number;}
export interface Course {id:number;code:string;name:string;credits:number;publication_enabled:number;}
export interface Teacher {id:number;name:string;role:string;}
export interface Catalog {semester:string;courses:Course[];teachers:Teacher[];assignments:{course_id:number;teacher_id:number;section:string;semester:string}[];}
export interface Post {id:number;author_id:number;author_name:string;academic_record:string;course_id:number|null;teacher_id:number|null;course_name:string|null;teacher_name:string|null;teacher_role:string|null;message:string;created_at:string;comment_count:number;}
export interface Comment {id:number;author_id:number;author_name:string;message:string;created_at:string;}
@Injectable({providedIn:'root'})
export class Api {private http=inject(HttpClient);get<T>(path:string){return firstValueFrom(this.http.get<T>('/api'+path));}post<T>(path:string,body:unknown){return firstValueFrom(this.http.post<T>('/api'+path,body));}patch<T>(path:string,body:unknown){return firstValueFrom(this.http.patch<T>('/api'+path,body));}}
@Injectable({providedIn:'root'})
export class Auth {api=inject(Api);user=signal<User|null>(null);async load(){const u=await this.api.get<User>('/auth/me');this.user.set(u);return u;}async login(body:unknown){this.user.set(await this.api.post<User>('/auth/login',body));}async logout(){await this.api.post('/auth/logout',{});this.user.set(null);}}
export const guard:CanActivateFn=async()=>{const auth=inject(Auth),router=inject(Router);try{await auth.load();return true;}catch{return router.createUrlTree(['/login']);}};
export const sessionInterceptor:HttpInterceptorFn=(req,next)=>{const router=inject(Router);return next(req).pipe(catchError((e:HttpErrorResponse)=>{if(e.status===401&&!req.url.includes('/auth/'))void router.navigate(['/login']);return throwError(()=>e);}));};
export function errorMessage(e:unknown){if(e instanceof HttpErrorResponse){if(e.status===0)return 'No se pudo conectar con el servidor. Verifica que esté encendido.';const details=e.error?.errors?.map((x:{field:string;message:string})=>`${x.field}: ${x.message}`).join(' ');return details||e.error?.message||'No se pudo completar la operación.';}return 'No se pudo completar la operación.';}
