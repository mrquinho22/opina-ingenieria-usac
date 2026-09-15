import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideHttpClient,withInterceptors} from '@angular/common/http';
import {App} from './app/app';
import {routes} from './app/routes';
import {sessionInterceptor} from './app/core';
bootstrapApplication(App,{providers:[provideRouter(routes),provideHttpClient(withInterceptors([sessionInterceptor]))]}).catch(console.error);
