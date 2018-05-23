import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, ViewController } from 'ionic-angular';
import { User, MsgService, AuthService, LocalSessionsService, ConfigService } from '../../providers/providers';

import { MainPage } from '../pages';


@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { userName: string, userId: string, password: string, userBirthDate: string } = {
    userName : '',
    userId : '',
    password : '', 
    userBirthDate : ''
  };

  // Our translated text strings
  private signupErrorString: string;
  private loginErrorString : string;

  constructor(
    public viewCtrl: ViewController, 
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService, 
    public auth : AuthService, 
    private msg : MsgService, 
    public localSession: LocalSessionsService,
    public config: ConfigService) {

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  doSignup() {

    this.auth.signUp(this.account)
    .then((data : any) => {
      this.viewCtrl.dismiss();
      this.msg.alert("WELCOME_SIGNUP");

      this.auth.login(this.account.userId, this.account.password).then(
        (data) => {
  
          // init messanging service and connect to sockets
          this.msg.initMsgService();
  
          // init local sessions ( creating user directory and loading sessions);
          this.localSession.initLocalSession();
          
  
          let isShown = this.config.tutorialShown;
  
         if (isShown){
          this.navCtrl.setRoot(MainPage, {
            userId : this.auth.getUserId()
          });
        } else{
          this.navCtrl.setRoot("TutorialPage");
        } 
  
        },
        error => {
  
          let toast = this.toastCtrl.create({
            message: this.loginErrorString,
            duration: 1000,
            position: 'top'
          });
          toast.present();
        }
      )


    }).catch(e => this.handleSignupError(e));

  }

  handleSignupError(error){
    
    let code = error.code;

    let msgKey;

    switch(code){
      case "user_exists": 
        msgKey = "ERROR_400_USER_EXISTS";
        break;
      case "invalid_password": 
        msgKey = "ERROR_400_INVALID_PASSWORD";
        break; 
      default: 
        msgKey = "UNIVERSAL_ERROR";
    }

    this.msg.toast(msgKey, 2000)

  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}
