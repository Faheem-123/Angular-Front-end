import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable ,  Operator } from 'rxjs';
import { AuthService } from './auth-service';

import { debounce,tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
                
        if (req.url.startsWith(environment.APIEndpoint +"/auth/token") ) {

            return next.handle(req);
        }
        else {
           
           // debugger;
            // Get the auth header from the service.
            const authHeader = this.auth.getAuthorizationHeader();

            // Clone the request to add the new header.
            const authReq = req.clone({ headers: req.headers.set('Authorization', authHeader)});
        
            // Pass on the cloned request instead of the original request.
            return next.handle(authReq).pipe(tap(
                (err: any) => {
                  if (err instanceof HttpErrorResponse) {
                    console.log(err);
                    console.log('req url :: ' + req.url);
                    if (err.status === 401) {
                        // redirect to the login route
                        // or show a modal                       
                    }
                  }
                }
              ));
        }  
       
    }
}