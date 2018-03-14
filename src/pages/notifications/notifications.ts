import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MsgService, AuthService } from '../../providers/providers';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public msg: MsgService, private auth: AuthService) {

    
  }

  ionViewDidLoad() {
    console.log("notifications page loaded and deleted new messages")
    this.msg.newMessages.length = 0;
  }

  followMessageLink(message ){

    let linkURL = JSON.parse(message.linkUrl);

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

  getAuthorText(message){
    if (message.receiverName != this.auth.getUsername()){
      return 'sent to ' + message.receiverName;
    }else{
      return 'received from ' + message.senderName;
    }
  }

}
