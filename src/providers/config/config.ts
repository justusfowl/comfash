

import { Injectable } from '@angular/core';
import { ENV } from '@app/env';

@Injectable()
export class ConfigService {
  
    private hostURL : string;
    private hostPort : string;
    private apiVersion : string;
    private apiBase : string = "/api/v";
    private apiProtocol : string = 'https';

    public autoPlayStream : boolean = false;

    private environment : string;


    constructor() {

        this.environment = ENV.mode;
        this.hostURL = ENV.hostURL;
        this.hostPort = ENV.hostPort;
        this.apiVersion = ENV.apiVersion;

        console.log("Environment loaded: " + this.environment);

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
