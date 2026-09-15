import {Routes} from '@angular/router';
import {guard} from './core';
import {AuthPage} from './auth-page';
import {Feed} from './feed';
export const routes:Routes=[
 {path:'login',component:AuthPage,data:{mode:'login'}},
 {path:'register',component:AuthPage,data:{mode:'register'}},
 {path:'recover',component:AuthPage,data:{mode:'recover'}},
 {path:'',component:Feed,canActivate:[guard]},
 {path:'**',redirectTo:''}
];
