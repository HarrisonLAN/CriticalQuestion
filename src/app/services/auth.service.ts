import { Platform, AlertController } from "@ionic/angular";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Storage } from "@ionic/storage";
import { environment } from "../../environments/environment";
import { tap, catchError } from "rxjs/operators";
import { BehaviorSubject, bindCallback } from "rxjs";
import { Router } from "@angular/router";
import { PollDetailsPage } from "../pages/members/dashboard/boardroom-details/poll-details/poll-details.page";
import { Observable } from "rxjs";
const TOKEN_KEY = "access_token";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  url = environment.url;
  user = null;

  authenticationState = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private helper: JwtHelperService,
    private storage: Storage,
    private plt: Platform,
    private alertController: AlertController,
    private router: Router
  ) {
    this.plt.ready().then(() => {
      this.checkToken();
    });
    this.authenticationState.getValue();
  }

  checkToken() {
    this.storage.get(TOKEN_KEY).then(token => {
      console.log(token);
      if (token) {
        let decoded = this.helper.decodeToken(token);
        let isExpired = this.helper.isTokenExpired(token);

        if (!isExpired) {
          this.user = decoded;
          this.authenticationState.next(true);
        } else {
          this.storage.remove(TOKEN_KEY);
        }
      }
    });
  }

  register(credentials) {
    return this.http.post(`${this.url}/api/auth/register`, credentials).pipe(
      tap(res => {
        console.log(res);
        this.showValidAlert("Your account is now pending for verification.");
      }),
      catchError(e => {
        this.showAlert(e.status + " " + e.error.message);
        throw new Error(e.error.messsage);
      })
    );
  }
  createBoardroom(boardroom) {
    return this.http.post(`${this.url}/api/boardroom`, boardroom).pipe(
      tap(res => {
        console.log(res);
        this.showValidAlert("Boardroom Created");
      }),
      catchError(e => {
        this.showAlert(e.status + " " + e.error.message);
        throw new Error(e.error.messsage);
      })
    );
  }

  createPoll(poll) {
    return this.http.post(`${this.url}/api/poll`, poll).pipe(
      tap(res => {
        this.showValidAlert("Poll Created");
        console.log(res["Poll"]["_id"]); //need to create service and add it to it so sendtoboardroom can access it
        console.log(res["Poll"]["boardroomID"]);
      }),
      catchError(e => {
        this.showAlert(e.status + " " + e.error.message);
        throw new Error(e.error.messsage);
      })
    );
  }

  sendtoBoardroom() {
    let body,
      bID,
      pID = "";
    //need to get pID and bID
    //from createPoll()
    return this.http
      .patch(`${this.url}/api/boardroom/${bID}/${pID}`, body)
      .pipe(
        tap(res => {
          console.log(res);
          this.showValidAlert("Poll Created");
        }),
        catchError(e => {
          this.showAlert(e.status + " " + e.error.message);
          throw new Error(e.error.messsage);
        })
      );
  }

  login(credentials) {
    return this.http.post(`${this.url}/api/auth/login`, credentials).pipe(
      tap(res => {
        this.storage.set(TOKEN_KEY, res["token"]);
        this.user = this.helper.decodeToken(res["token"]);
        this.authenticationState.next(true);
      }),
      catchError(e => {
        this.showAlert(e.error.message);
        throw new Error(e);
      })
    );
  }

  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.authenticationState.next(false);
    });
  }

  isAuthenticated() {
    return this.authenticationState.value;
  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: "Error",
      buttons: ["OK"]
    });
    alert.then(alert => alert.present());
  }

  showValidAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: "Success!",
      buttons: [
        {
          text: "OK",
          handler: data => {
            window.location.reload();
          }
        }
      ]
    });
    alert.then(alert => alert.present());
  }
  getUser() {
    return this.user;
  }

  getToken(): any {
    this.storage.get(TOKEN_KEY).then(token => {
      return token;
    });
  }
}
