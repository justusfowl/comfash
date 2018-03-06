import 'rxjs/add/operator/toPromise';

import { Injectable, OnInit } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';

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
  
    constructor( private alertCtrl : AlertController, public toastCtrl: ToastController, private api: Api, private ws : WebsocketService) { 
       
    }

    ngOnInit(){

        
    }

    initMsgService(){
        
        this.ws.connect();

        this.ws.onNewMessage().subscribe( msg => {
            console.log(msg);
        })
        
    }

    alert(msg: string){

        let alert = this.alertCtrl.create({
            title: 'Comfash',
            subTitle: msg,
            buttons: ['Dismiss']
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
