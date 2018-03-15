import 'rxjs/add/operator/toPromise';

import { Injectable, OnInit } from '@angular/core';
import { AlertController, ToastController, App } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';

import { Observable } from 'rxjs/Observable';
import { Api } from '../api/api';


import * as io from 'socket.io-client';
import * as Rx from 'rxjs/Rx';
import { WebsocketService } from './websocket';
import { Message } from '../../models/datamodel';


@Injectable()
export class MsgService implements OnInit {

    public groups : any;
    private socket;
    test : any;
    newMessages : any = [];
    myMessages : Message[];
    
  
    constructor( 
        private alertCtrl : AlertController, 
        public toastCtrl: ToastController, 
        private api: Api, 
        private ws : WebsocketService, 
        public translate: TranslateService) { 
       
    }

    ngOnInit(){

        
    }

    initMsgService(){

        if (!this.ws.isConnected){

            this.ws.connect();

            this.ws.onNewMessage().subscribe( (msg : Message) => {
                
                console.log(msg);
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

    alert(msg: any){


        let alert = this.alertCtrl.create({
            title: 'Comfash',
            subTitle: msg,
            buttons: ['Dismiss']
          });
          alert.present();

    }

    presentConfirm(cbAccept) {

        let title = this.translate.instant("ALERT_DELETE_TITLE");
        let msg = this.translate.instant("ALERT_DELETE_MSG");

        let cancelTxt = this.translate.instant("CANCEL");

        let acceptTxt = this.translate.instant("ACCEPT");

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

    toast(msg: string){

        let toast = this.toastCtrl.create({
            message: msg,
            duration: 1000,
            position: 'top'
          });
          toast.present();

    }

    sendMsg(msg: string){
       // this.ws.se
    }


}
