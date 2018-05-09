import 'rxjs/add/operator/toPromise';

import { Injectable, OnInit } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';

import { Api } from '../api/api';

import { WebsocketService } from './websocket';
import { Message } from '../../models/datamodel';
import { Badge } from '@ionic-native/badge';


@Injectable()
export class MsgService implements OnInit {

    public groups : any;
    test : any;
    newMessages : any = [];
    myMessages : Message[];
    
  
    constructor( 
        private alertCtrl : AlertController, 
        public toastCtrl: ToastController, 
        private api: Api, 
        private ws : WebsocketService, 
        public translate: TranslateService, 
        private badge : Badge) { 
       
    }

    ngOnInit(){

        
    }

    initMsgService(){

        //this.badge.set(99);

        if (!this.ws.isConnected){

            this.ws.connect();

            this.ws.onNewMessage().subscribe( (msg : Message) => {
                
                this.toast(msg.getMessage());

                this.newMessages.push(msg);
            })

        }
        
    }
 
    updateMessages(){
        this.api.getMessages().subscribe((messages : Array<Message>)=> {
            
            let castMsg = messages.map(element => new Message(element));

            this.myMessages = castMsg;
        })
    }

    isNotificationDisabled(){
        if (this.newMessages.length == 0){
            return true;
        }else{
            return false;
        }
    }

    alert(msgKey: any){

        let msg = this.translate.instant(msgKey);

        let alert = this.alertCtrl.create({
            title: 'Comfash',
            subTitle: msg,
            buttons: [this.translate.instant("ACCEPT_BUTTON")]
          });
          alert.present();

    }

    presentConfirm(msgKey, msgTitleKey, cbAccept) {

        let title = this.translate.instant(msgTitleKey);
        let msg = this.translate.instant(msgKey);

        let cancelTxt = this.translate.instant("CANCEL_BUTTON");

        let acceptTxt = this.translate.instant("ACCEPT_BUTTON");

        let alert = this.alertCtrl.create({
          title: title,
          message: msg,
          buttons: [
            {
              text: cancelTxt,
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: acceptTxt,
              handler: cbAccept
            }
          ]
        });
        alert.present();
      }

    toast(msgKey: string, duration = 1000){

        let msg = this.translate.instant(msgKey);
        
        let toast = this.toastCtrl.create({
            message: msg,
            duration: duration,
            position: 'top'
          });
          toast.present();

    }

    toastStdError(){
        this.toast("UNIVERSAL_ERROR");
    }
    
    /**
     * Method that both returns and presents the toaster at the same time, dismiss => .dismiss();
     */
    toastLoader(){

        let msg = this.translate.instant("PLEASE_WAIT");

        let toast = this.toastCtrl.create({
            message: msg,
            cssClass : "toast-loader",
            position: 'top'
          });

        toast.present();
        return toast;

    }

    sendMsg(msg: string){
       // this.ws.se
    }


}
