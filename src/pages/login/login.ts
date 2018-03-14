import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, ModalController, MenuController } from 'ionic-angular';

import { AuthService, MsgService } from '../../providers/providers';
import { MainPage } from '../pages';

import * as $ from 'jquery';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { userId: string, password: string } = {
    userId: '',
    password: ''
  };

  // Our translated text strings
  private loginErrorString: string;

  constructor(public navCtrl: NavController,
    public auth: AuthService,
    public toastCtrl: ToastController,
    public translateService: TranslateService, public modalCtrl: ModalController, public menu: MenuController, private msg: MsgService) {

    this.menu.enable(false,'mainmenu');

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })

  }
  
  ionViewWillEnter(){

    if (this.auth.getToken()){
      this.msg.initMsgService();
      this.navCtrl.setRoot(MainPage);
    }

  }

  // Attempt to login in through our User service
  doLogin() {
    
    this.auth.login(this.account.userId, this.account.password).subscribe(
      (data) => {
        this.msg.initMsgService();
        this.navCtrl.setRoot(MainPage);
      },
      error => {

      this.addInvalidPasswordStyle();

      let toast = this.toastCtrl.create({
        message: this.loginErrorString,
        duration: 1000,
        position: 'top'
      });
      toast.present();
      }
    )

  }

  addInvalidPasswordStyle(){
    $('.login-form').addClass('invalid');
    $('.login-label').addClass('invalid');
  }


  disableInvalidPasswordStyle(){
    $('.login-form').removeClass('invalid');
    $('.login-label').removeClass('invalid');
  }



  signUp() {

    $('.login-form').addClass('hide');

    let addModal = this.modalCtrl.create('SignupPage');
    addModal.onDidDismiss(user => {

      $('.login-form').removeClass('hide');

    })
    
    addModal.present();
  }


}
