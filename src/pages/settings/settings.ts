import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ConfigService, LocalSessionsService, AuthService } from '../../providers/providers';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({ 
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public now : any = new Date().getTime();

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public config: ConfigService, 
    public auth : AuthService,
    private localSessions : LocalSessionsService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  deleteLocalUserData(){ 
    this.localSessions.deleteLocalSessions();
  }

}
