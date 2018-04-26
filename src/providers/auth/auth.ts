
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { Api } from '../api/api'
import { OneSignal } from '@ionic-native/onesignal';

import * as auth0 from 'auth0-js';
import { Facebook } from '@ionic-native/facebook';


@Injectable()
export class AuthService {
  
    private userName : string = "";
    private userId : string = "";
    //private userBirthDate : string
    private id_token : string = "";
    private accessToken : string = "";

    private isAuth : boolean = false;

    public userAvatarPath : string = "";

    public testDeviceId : string = "";

    public auth0Config = {
        clientID: 'IEFi9KoFw0QdQbtoXoCcD523MZ3OVULr',
        domain: 'comfash.eu.auth0.com',
        responseType: 'token id_token',
        audience: 'https://comfash.eu.auth0.com/api/v2/',
        redirectUri: 'https://comfash.com/',
        scope: 'openid profile email' 
      }

    private Auth0 : any;

    constructor(
        private api: Api, 
        public oneSignal : OneSignal,
        private fb: Facebook) {

        if (this.getToken()){
            this.isAuth = true;
        }

        this.Auth0 = new auth0.WebAuth({
            clientID: 'IEFi9KoFw0QdQbtoXoCcD523MZ3OVULr',
            domain: 'comfash.eu.auth0.com'
          });


    }
 
    loginOld(userId : string, password : string){

        let data = {
            userId : userId, 
            password : password
        };

        return this.api.post("auth", data).map(response => {
            this.handleLoginSuccess(response);
        })
        
    }

    public facebookLogin(){

        let self = this; 

        return new Promise<any>((resolve, reject) => {
            this.fb.login(['public_profile', 'user_friends', 'email'])
                .then(res => {
                    if(res.status === "connected") {
                        this.isAuth = true;
                        console.log("FACEBOOK AUTHENTICATED ME");

                        const credentials = {
                            client_id: self.auth0Config.clientID,
                            access_token: res.authResponse.accessToken,
                            scope: self.auth0Config.scope,
                            connection: 'facebook'
                          };


                        console.log(JSON.stringify(res.authResponse));
                        self.handleAuthSuccess(res.authResponse, resolve, reject);
                        
                    } else {
                        this.isAuth = false;
                        reject();
                    }
                })
                .catch(e => console.log('Error logging into Facebook', JSON.stringify(e)));
        });

        
    }

    testFB(){

        let self = this; 

        return new Promise<any>((resolve, reject) => {
            this.fb.login(['public_profile', 'user_friends', 'email'])
                .then(res => {
                    if(res.status === "connected") {
                        this.isAuth = true;
                        console.log("FACEBOOK AUTHENTICATED ME");

                        const credentials = {
                            client_id: self.auth0Config.clientID,
                            access_token: res.authResponse.accessToken,
                            scope: self.auth0Config.scope,
                            connection: 'facebook'
                          };


                        console.log(JSON.stringify(res.authResponse));

                        self.Auth0.authorize(credentials, (err, authResult) => {
                            if (err){
                                console.error(JSON.stringify(err));
                                reject(err)
                                return;
                            }else{
                                console.log("authenticated");
                                console.log(JSON.stringify(authResult));
                                resolve(authResult);
                            }
                        })
                        
                    } else {
                        this.isAuth = false;
                        reject();
                    }
                })
                .catch(e => console.log('Error logging into Facebook', JSON.stringify(e)));
        });

    }

    public login(username: string, password: string) {

        let self = this;

        return new Promise<any>((resolve, reject) => {
        
            this.Auth0.client.login({
                client_id: this.auth0Config.clientID,
                username: username,
                email: username,
                password: password,
                audience : this.auth0Config.audience,
                realm: 'Username-Password-Authentication',
                scope: this.auth0Config.scope
            }, (err, authResult) => {
                if (err){
                    console.error(err);
                    this.api.handleAPIError(err);
                    reject(err)
                    return;
                }else{
                    console.log("authenticated");
                    console.log(authResult);
                    self.handleAuthSuccess(authResult, resolve, reject);
                }
            })
        });
      }

    handleAuthSuccess(authResult, resolve, reject){
        
        console.log("THIS IS MY ACCESS TOKEN");
        console.log(authResult.accessToken);

        
        this.Auth0.client.userInfo(authResult.accessToken, (error, user) => {
            if (error){
                console.log(JSON.stringify(error));
                this.api.handleAPIError(error);
                reject(error);
            }else{
                
                console.log(user);
                authResult["id_token"] = authResult.idToken;
                authResult["userId"] = user["https://app.comfash.com/cf_id"];

                this.handleLoginSuccess(authResult)

                this.api.getUserProfileBase(authResult["userId"]).subscribe(
                    (data : any) => {

                      authResult["userName"] = data.userName;
                      authResult["userAvatarPath"] = data.userAvatarPath;

                      resolve(this.handleProfileSuccess(authResult));

                    },
                    error => {
                      this.api.handleAPIError(error);
                    }
                  );
                  

                  resolve(true);
            }
        });


    }


    logout(){
        this.isAuth = false;
        window.localStorage.clear();
        return true; // this.store.clear();
    }

    handleProfileSuccess(data){
        this.userName = data.userName;
        this.userAvatarPath = data.userAvatarPath;

        window.localStorage.setItem('userName', data.userName);
        window.localStorage.setItem('avatar', data.userAvatarPath);

        return;
    }

    handleLoginSuccess(data){

        this.userId = data.userId; 
        
        this.id_token = data.id_token;
        this.accessToken = data.accessToken;
        

        window.localStorage.setItem('userId', data.userId);
        
        window.localStorage.setItem('accessToken', data.accessToken);
        window.localStorage.setItem('id_token', data.id_token);

        this.isAuth = true;

        // Retrieve the OneSignal user id and the device token

        try{  
            this.oneSignal.getIds().then(data => this.setDeviceToken(data));
        }
        catch(err){
            console.log(JSON.stringify(err))
        }

        return;

        
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
        return window.localStorage.getItem('id_token');
        // return this.token;
    }

    getUserAvatarPath () : string {
        return window.localStorage.getItem('avatar') || "";
    }

    setDeviceToken(id){
        this.testDeviceId = id.pushToken;
        this.api.registerDevice(id).subscribe( resp => {
            console.log("device successfully registered with comfash");
        }, 
        error => {
            this.api.handleAPIError(error);
        })
    }



    checkProfile(item : any, profile){

        try{

        
            if (profile == 'owner'){

                if (item.getUserId() == this.getUserId()){
                    return true;
                } else{
                    return false;
                }

            }

        }catch(err){
            console.log(err);
        }

    }




}
