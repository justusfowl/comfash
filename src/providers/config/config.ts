

import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  
    private hostURL : string = "192.168.178.142";
    private hostPort : string = "9999"
    private apiVersion : string = "01";
    private API : string = "/api/v" + this.apiVersion;
    private apiProtocol : string = 'http';


    constructor() {
       
    }


    getHostURL (){
        return this.hostURL;
        // return this.userName; 
    }

    getAPIv (){
        return this.apiVersion;
        // return this.userId;
    }

    getHostBase (){
        return this.apiProtocol + "://" + this.hostURL + ":" + this.hostPort;
        // return this.userName; 
    }

    getAPIBase () : string {
        return this.apiProtocol + "://" + this.hostURL + ":" + this.hostPort + this.API;
        // return this.token;
    }


}