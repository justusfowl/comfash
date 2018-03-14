
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { Api } from '../api/api'


@Injectable()
export class AuthService {
  
    private userName : string = "";
    private userId : string = "";
    //private userBirthDate : string
    private token : string = "";

    private isAuth : boolean = false;

    public userAvatarPath : string = "";

    constructor(private store : Storage, private api: Api) {

        if (this.getToken()){
            this.isAuth = true;
        }


    }
 
    login(userId : string, password : string){

        let data = {
            userId : userId, 
            password : password
        };

        return this.api.post("auth", data).map(response => {
            this.handleLoginSuccess(response);
        })
        
    }


    logout(){
        this.isAuth = false;
        window.localStorage.clear();
        return true; // this.store.clear();
    }

    handleLoginSuccess(data){

        this.userId = data.userId; 
        this.userName = data.userName; 
        this.token = data.token;
        this.userAvatarPath = data.userAvatarPath;

        /*
        this.store.set('userId', data.userId);
        this.store.set('userName', data.userName); 
        this.store.set('jwt', data.token); 
        */

        window.localStorage.setItem('userId', data.userId);
        window.localStorage.setItem('userName', data.userName);
        window.localStorage.setItem('jwt', data.token);
        window.localStorage.setItem('avatar', data.userAvatarPath);

        this.isAuth = true;


        console.log("get Ids in auth service:")

        // Retrieve the OneSignal user id and the device token
        if (window["plugins"]){
            window["plugins"].OneSignal.getIds()
            .then((ids) =>
            {
                console.log('getIds: ' + JSON.stringify(ids));
            });
        }

        
    }

    setAvatarBaseStr (avatarBase){
        this.userAvatarPath = avatarBase;
        window.localStorage.setItem('avatar', avatarBase);
    }

    getAuthStatus(){
        return this.isAuth;
    }

    getUsername (){
        return window.localStorage.getItem('userName');
        // return this.userName; 
    }

    getUserId (){
        return window.localStorage.getItem('userId');
        // return this.userId;
    }

    getToken () : string {
        return window.localStorage.getItem('jwt');
        // return this.token;
    }

    getUserAvatarPath () : string {
        return window.localStorage.getItem('avatar') || "";
    }


}
