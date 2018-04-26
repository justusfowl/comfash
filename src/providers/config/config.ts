

import { Injectable } from '@angular/core';
import { ENV } from '@app/env';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';


@Injectable()
export class ConfigService {
  
    private hostURL : string;
    private hostPort : string;
    private apiVersion : string;
    private apiBase : string = "/api/v";
    private apiProtocol : string = 'https';

    public autoPlayStream : boolean = false;

    private environment : string;

    public isOnline : boolean;
    public networkType : string;
    public downloadSpeed : string;


    constructor(
        private network : Network,
        platform: Platform
    ) {

        this.environment = ENV.mode;
        this.hostURL = ENV.hostURL;
        this.hostPort = ENV.hostPort;
        this.apiVersion = ENV.apiVersion;

        console.log("Environment loaded: " + this.environment);

        let self = this;

        platform.ready().then(() => {

            self.networkType = network.type;
            self.downloadSpeed = network.downlinkMax;

            // watch network for a disconnect
            this.network.onDisconnect().subscribe(() => {
                self.isOnline = false;
                console.log('network was disconnected :-(');

            });

            // watch network for a connection
            this.network.onConnect().subscribe(() => {
                self.isOnline = true;
                console.log('network connected!');
                // We just got a connection but we need to wait briefly
                // before we determine the connection type. Might need to wait.
                // prior to doing any api requests as well.
                setTimeout(() => {
                    self.networkType = this.network.type;
                }, 3000);

            });

        });



    }

    getEnvironment(){
        return this.environment;
    }

    getHostURL (){
        return this.hostURL;
        // return this.userName; 
    }

    getAPIv (){
        return this.apiVersion;
        // return this.userId;
    }

    getAPI(){
        return this.apiBase + this.apiVersion;
    }

    getHostBase (){
        return this.apiProtocol + "://" + this.hostURL + ":" + this.hostPort;
        // return this.userName; 
    }

    getAPIBase () : string {
        if (this.hostPort != "443"){
            return this.apiProtocol + "://" + this.hostURL + ":" + this.hostPort + this.getAPI();
        }else{
            return this.apiProtocol + "://" + this.hostURL + this.getAPI();
        }
    }


}
