import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AuthService } from '../../providers/auth/auth';
import { MsgService } from '../../providers/message/message';
import { Session } from '../../models/datamodel';

/**
 * Generated class for the SettingsPopoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings-popover',
  templateUrl: 'settings-popover.html',
})
export class SettingsPopoverPage {

  myItem : any;
  itemOwner : boolean = false;
  myObjectType : string;

  mySession : Session;
  myComments : any;
  commentIndex : number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private auth : AuthService,
    private viewCtrl: ViewController,
    private msg : MsgService) {

    this.myItem = navParams.get('item');

    let options = navParams.get('options');

    if (options) {
      this.mySession = options.selectedSession;
      this.myComments = options.comments;
      this.commentIndex = options.selectedIndex;
    }

    let userId = this.auth.getUserId();

    if (this.myItem.getUserId() == userId){
      this.itemOwner = true;
    }
    this.myObjectType = navParams.get('objectType');


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPopoverPage');
  }



  reportItem(){

    let responseType = 1;

    let responseObject = {
      objectId : this.myItem.getId(),
      objectType :  this.myObjectType
    }

    let acceptHandler = function (){
      this.viewCtrl.dismiss(responseType, responseObject);
    }

    this.msg.presentConfirm("ALERT_REPORT_ITEM_MSG", "ALERT_REPORT_ITEM_TITLE", acceptHandler.bind(this))

  }

  deleteItem(){

    let responseType = -1;

    let responseObject = {
      mySession : this.mySession,
      comments :  this.myComments,
      selectedIndex : this.commentIndex,
      commentId : this.myItem.getId()
    } as any;


    this.viewCtrl.dismiss(responseType, responseObject);
  }

}
