import 'rxjs/add/operator/toPromise';

import { Injectable, OnInit } from '@angular/core';
import { AlertController, ToastController, App } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { Api } from '../api/api';


import * as io from 'socket.io-client';
import * as Rx from 'rxjs/Rx';
import { WebsocketService } from './websocket';


@Injectable()
export class MsgService implements OnInit {

    public groups : any;
    private socket;
    test : any;
    newMessages : any = [];
    myMessages : any = [];
    
  
    constructor( private alertCtrl : AlertController, public toastCtrl: ToastController, private api: Api, private ws : WebsocketService) { 
       
    }

    ngOnInit(){

        
    }

    initMsgService(){
        
        this.ws.connect();

        this.ws.onNewMessage().subscribe( msg => {
            console.log(msg);
            this.toast(msg);

            this.newMessages.push(msg);
            
            this.api.getMessages().subscribe(messages => {
                this.myMessages = messages;
            })
            
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

    toast(msg: any){

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
