import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MsgService, AuthService, ConfigService, UtilService, Api } from '../../providers/providers';
import { Message } from '../../models/datamodel';

/**
 * Generated class for the NotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public msg: MsgService, 
    private auth: AuthService, 
    public config : ConfigService,
    public util : UtilService, 
    private api: Api) {

    
  }

  ionViewWillEnter() {
    this.auth.validateAuth(this.navCtrl)
  }

  ionViewDidLoad() {
    console.log("notifications page loaded and deleted new messages")
    this.msg.newMessages.length = 0;
    this.msg.updateMessages();
  }

  followMessageLink(message : Message){

    // mark message as read

    message.setReadStatus(0);

    this.api.markMessageRead(message.getId());

    let linkURL = message.getLinkUrl();

    let targetPage = linkURL.targetPage;
    let params = linkURL.params;

    this.navCtrl.push(targetPage, params);

  }

  checkIfMsgIsAux(message){
    if (message.receiverName != this.auth.getUsername()){
      return true;
    }else{
      return false;
    }
  }

}
