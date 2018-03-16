import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, ViewController } from 'ionic-angular';
import { User, Api, MsgService } from '../../providers/providers';

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

  constructor(
    public viewCtrl: ViewController, 
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService, 
    public api : Api, 
    private msg : MsgService) {

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })
  }

  doSignup() {
    // Attempt to login in through our User service
    this.api.post('auth/register', this.account).subscribe((resp) => {
      this.viewCtrl.dismiss();
      this.msg.alert('Welcome to comfash - glad you are here!')
    }, (err) => {

      //this.navCtrl.push(MainPage);

      // Unable to sign up
      let toast = this.toastCtrl.create({
        message: this.signupErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}
