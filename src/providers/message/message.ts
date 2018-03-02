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


/*






    initMsgService(){

        this.connect().subscribe(message => {
            console.log("retrieving groups")
            this.api.get("user/groups").map(response => {
                console.log("joining to groups")
                this.groups = response;
               // this.joinGroups();
                this.socket.emit('groupjoin', response);
            })
        });

    }



    connect(){

        console.log("connecting...")

        this.socket.connect();

        let observable = new Observable(observer => {
            

            this.socket.on('con', (data) => {
                console.log(data);

                observer.next(data);
            });
        })
        return observable;


    }

    getMessages() {
        let observable = new Observable(observer => {
            this.socket.on('newCollection', (data) => {
                observer.next(data);
            });
        })
        return observable;
    }

    getGroups() {
        let observable = new Observable(observer => {
            this.socket.on('groups', (data) => {
                observer.next(data);
            });
        })
        return observable;
    }

*/


}
