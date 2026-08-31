import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

/* SmtpJS.com - v3.0.0 */
var Email = { send: function (a) { return new Promise(function (n, e) { a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send"; var t = JSON.stringify(a); Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) { n(e) }) }) }, ajaxPost: function (e, n, t) { var a = Email.createCORSRequest("POST", e); a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function () { var e = a.responseText; null != t && t(e) }, a.send(n) }, ajax: function (e, n) { var t = Email.createCORSRequest("GET", e); t.onload = function () { var e = t.responseText; null != n && n(e) }, t.send() }, createCORSRequest: function (e, n) { var t = new XMLHttpRequest; return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t } };


@Injectable({
  providedIn: 'root'
})

export class EmailService {
  //private api = 'https://mailthis.to/younessnachar@hotmail.com';

  private host = 'smtp.elasticemail.com';
  private userName = 'younessnachar@hotmail.com';
  private password = 'DA3CEBF294F56836E0FEAF890D11A88873B9';

  constructor(private http:HttpClient) { }

  SendEmail(to:String, subject:string, emailBody:any): any {
    //console.log('to: ' + to);
    //console.log('subject: ' + subject);
    //console.log('emailBody: ' + emailBody);
    return new Promise((resolve, reject) => {
      Email.send({
        Host : this.host,
        Username : this.userName,
        Password : this.password,
        To : to,
        From : this.userName,
        Subject : subject,
        Body : emailBody
      }).then( message => {
        //console.log('message before: ' + message);
        resolve(message); /* f.resetForm();*/
        reject(message); 
      });
    })
  }
  
  /*
  SendEmail2(input: any) {
    return this.http.post(this.api, input, {responseType: 'text'}).pipe(
      map(
        (response) => {
          if(response)
            return response;          
        },
        (error: any) => {
          return error;
        }
      )
    )
  } 
  */ 

}