import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import * as io from 'socket.io-client';
import { AuthService } from '../auth/auth';
import { ConfigService } from '../config/config';


@Injectable()
export class WebsocketService {

    private socket: SocketIOClient.Socket;
    public isConnected : boolean = false;
  
    constructor( public auth : AuthService, public config: ConfigService) { 

    }

    connect(){

        console.log("i am here, connecting..");

        this.socket = io(this.config.getHostBase(), {'query' : 'token=' + this.auth.getToken()});

        this.socket.on('connect', function(data) {

            console.log("connected")

            this.isConnected = true;  
        })

        this.socket.on('disconnect', function(){
            console.log("disconnected");
            this.isConnected = false; 
        })
    }
    
    disconnect(){
        this.socket.disconnect();
    }

    joinGroups(groups){
        this.socket.emit('groupjoin', groups)   
    }

    sendMsgtoGroup(msg: string, group: number){
        this.socket.emit('groupjoin', group)  
        
    }

    onNewMessage(){

        return new Observable(observer => {
            this.socket.on('msg', msg => {
                console.log("i am here in the actual box" + msg)
                observer.next(msg);
            })
        });

    }



}