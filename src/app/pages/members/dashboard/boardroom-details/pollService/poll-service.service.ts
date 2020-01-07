import { Injectable } from "@angular/core";
import { Platform, AlertController } from "@ionic/angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";
import { Poll } from "./poll";
import { Observable } from "rxjs";
import { Storage } from "@ionic/storage";
import { JwtHelperService } from "@auth0/angular-jwt";
import { NONE_TYPE } from "@angular/compiler/src/output/output_ast";
import { AuthService } from "../../../../../services/auth.service";
import { fromPromise } from "rxjs/observable/fromPromise";

@Injectable({
  providedIn: "root"
})
export class PollServiceService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private helper: JwtHelperService,
    private auth: AuthService,
    private alertController: AlertController
  ) {}
  public user;
  url = "http://51.89.139.24";
  getPollOnID(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}/api/poll/${id}`);
  }
  addVote(pollID, optionID) {
    this.user = this.auth.getUser();
    console.log(this.user);
    this.http
      .patch(
        `${this.url}/api/poll/add/${this.user.user.username}/${pollID}/${optionID}`,
        {}
      )
      .subscribe(
        res => {
          this.showAlertSuccess(res, "Vote submitted.");
        },
        error => {
          this.showAlertError(error, "You have already voted.");
        }
      );
    console.log("request sent. Waiting for response...");
  }
  async showAlertSuccess(msg, reason) {
    let alert = await this.alertController.create({
      message: reason,
      header: "Success!",
      buttons: [
        {
          text: "OK",
          handler: data => {
            var url = window.location.href;
            if (url.indexOf("?") > -1) {
              url += "&param=1";
            } else {
              url += "?param=1";
            }
            window.location.href = url;
            window.location.reload();
          }
        }
      ]
    });
    await alert.present();
    console.log(msg);
  }

  async showAlertError(msg, reason) {
    let alert = await this.alertController.create({
      message: reason,
      header: "Error",
      buttons: [
        {
          text: "OK"
        }
      ]
    });
    await alert.present();
    console.log(msg);
  }
}
