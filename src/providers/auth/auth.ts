import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';


@Injectable()
export class AuthService {
  
    private username : String;
    private userId : Number; 


    constructor() {

        this.username = "Uli"; 
        this.userId = 21312;

    }

    getUsername (){
        return this.username; 
    }

    getUserId(){
        return this.userId; 
    }


}
