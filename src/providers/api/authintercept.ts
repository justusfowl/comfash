import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/empty';
import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { AuthService } from '../auth/auth';
import { App, NavController } from 'ionic-angular';
//import { MsgService } from '../message/message';

@Injectable()
export class AuthIntercept implements HttpInterceptor {

  constructor( protected app: App, private inj: Injector) {
  }
  intercept(
    
    req: HttpRequest<any>, 
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    return next.handle(this.setAuthorizationHeader(req))
      .catch((event) => {
        console.log('event', event);
        if (event instanceof HttpErrorResponse) {
          return this.catch401(event);
        }
      });
  }

  getNavCtrl() : NavController{
    return this.app.getRootNav();
  }
// Request Interceptor to append Authorization Header
  private setAuthorizationHeader(req: HttpRequest<any>): HttpRequest<any> {
    // Make a clone of the request then append the Authorization Header
    // Other way of writing :
    // return req.clone({headers: req.headers.set('Authorization', this.authService.token )});
    const auth = this.inj.get(AuthService);
    
    let token;
    if (typeof(auth.getToken()) != 'string'){
       token = '';
       console.log("API Call without token")
    }else{
       token = auth.getToken();
    }

    return req.clone({ setHeaders: { 'Authorization' : "Bearer " + token } });

  }
  // Response Interceptor
  private catch401(error: HttpErrorResponse): Observable<any> {
    // Check if we had 401 response
    if (error.status === 401) {
      // redirect to Login page for example
      let navCtrl = this.getNavCtrl();

      navCtrl.setRoot("LoginPage");
      return Observable.empty();
    }
    return Observable.throw(error);
  }
}