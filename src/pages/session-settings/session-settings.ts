import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilService } from '../../providers/providers';

/**
 * Generated class for the SessionSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-session-settings',
  templateUrl: 'session-settings.html',
})
export class SessionSettingsPage {

  public settingsOptions : any;
  public testImg = "/i/3471138263file-1524218239624.jpg";

  public filterOptions = [

    {
      "name" : "Vintage",
      "option" : 1
    },
    {
      "name" : "Sin City",
      "option" : 2
    },
    {
      "name" : "Old Boot",
      "option" : 3
    },
    {
      "name" : "Nostalgia",
      "option" : 4
    },
  ]


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public util: UtilService) {

    let settingsOptions = navParams.get('settingsOptions');
    this.settingsOptions = settingsOptions;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SessionSettingsPage');
  }

}
