import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from "@angular/common/http";

import { Observable, throwError, from } from "rxjs";
import { map, catchError, switchMap } from "rxjs/operators";

import { AlertController } from "@ionic/angular";
import { Storage } from "@ionic/storage";

const TOKEN_KEY = "access_token";

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  protected url = "";
  protected debug = true;

  constructor(
    private alertController: AlertController,
    private storage: Storage
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // YOU CAN ALSO DO THIS
    // const token = this.authenticationService.getToke()
    return from(this.storage.get(TOKEN_KEY)).pipe(
      switchMap(token => {
        if (token) {
          request = request.clone({
            headers: request.headers.set("token", token)
          });
        }

        if (!request.headers.has("Content-Type")) {
          request = request.clone({
            headers: request.headers.set("Content-Type", "application/json")
          });
        }

        if (this.debug) {
          request = request.clone({
            url: this.url + request.url + "?XDEBUG_SESSION_START=1"
          });
        }

        return next.handle(request).pipe(
          map((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              // do nothing for now
            }
            return event;
          }),
          catchError((error: HttpErrorResponse) => {
            const status = error.status;
            const reason =
              error && error.error.reason ? error.error.reason : "";

            this.presentAlert(status, reason);
            return throwError(error);
          })
        );
      })
    );
  }

  async presentAlert(status, reason) {
    console.log(status, reason);
  }
}
