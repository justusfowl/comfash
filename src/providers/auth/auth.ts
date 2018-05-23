
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { ENV } from '@app/env';

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

    private expiresAt : number = 0;

    public isRefreshingToken : boolean = false;

    public unAuthCounter : number = 0;


    

    public auth0Config : any;

    private Auth0 : any;

    constructor(
        private api: Api, 
        public oneSignal : OneSignal,
        private fb: Facebook) {

        this.auth0Config = ENV.auth0Config;

        if (this.getToken()){
            this.isAuth = true;
        }

        this.Auth0 = new auth0.WebAuth({
            clientID: ENV.auth0Config.clientID,
            domain: ENV.auth0Config.domain
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
                        //console.log("FACEBOOK AUTHENTICATED ME");

                        const credentials = {
                            fb_access_token: res.authResponse.accessToken,
                            connection: 'facebook'
                          };
                          

                        self.api.post("auth/f", credentials).subscribe(
                            (authResult : any) => {
                                console.log("  i am here in the auth/f result");
                                //console.log(JSON.stringify(authResult));
                                authResult["accessToken"] = authResult.access_token;

                              resolve(this.handleAuthSuccess(authResult, resolve, reject));
                            },
                            error => {
                              this.api.handleAPIError(error);
                            }
                          );
                        
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
                    //console.log(authResult);
                    self.handleAuthSuccess(authResult, resolve, reject);
                }
            })
        });
      }

    handleAuthSuccess(authResult, resolve, reject){
        
        this.Auth0.client.userInfo(authResult.accessToken, (error, user) => {
            if (error){
                console.log(JSON.stringify(error));
                this.api.handleAPIError(error);
                reject(error);
            }else{
                
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

    setExpiresAt(expiresIn){
        let expiresAt = parseInt(JSON.stringify((expiresIn * 1000) + new Date().getTime()));

        this.expiresAt = expiresAt;

        window.localStorage.setItem('expiresAt', expiresAt.toString());

    }

    handleLoginSuccess(data){

        this.userId = data.userId; 
        
        this.id_token = data.id_token;
        this.accessToken = data.accessToken;

        this.setExpiresAt(data.expiresIn);
        
        window.localStorage.setItem('userId', data.userId);
        
        window.localStorage.setItem('accessToken', data.accessToken);
        window.localStorage.setItem('id_token', data.id_token);
        window.localStorage.setItem('refreshToken', data.refreshToken);

        this.isAuth = true;
        

        try{  

            // Retrieve the OneSignal user id and the device token
            this.oneSignal.getIds().then(data => this.setDeviceToken(data));

        }
        catch(err){
            console.log(JSON.stringify(err))
        }



        return;

        
    }

    signUp(account){

        return new Promise<any>((resolve, reject) => {
        
            this.Auth0.signup({
                client_id: this.auth0Config.clientID,
                username : account.userName,
                email: account.userId,
                password: account.password,
                connection: 'Username-Password-Authentication'
            }, (err, result) => {
                if (err){
                    console.error(err);
                    this.api.handleAPIError(err);
                    reject(err)
                    return;
                }else{
                    console.log("signed up");
                    resolve(result);
                }
            })
        });
    }

    setAvatarBaseStr (avatarBase){
        this.userAvatarPath = avatarBase;
        window.localStorage.setItem('avatar', avatarBase);
    }

    getAuthStatus(){
        let now = new Date().getTime();
        let expiresAt = parseInt(window.localStorage.getItem('expiresAt'));
        
        this.expiresAt = expiresAt;

        if (this.expiresAt > now ){
            this.isAuth = true;
        }else{
            this.isAuth = false;
        }

        return this.isAuth;
    }


    checkRefreshToken(){

        this.unAuthCounter++;

        if (!this.isRefreshingToken){

            let nowWithPuffer = (new Date().getTime()) + 1000 * 60 * 60;
            let expiresAt = parseInt(window.localStorage.getItem('expiresAt'));

            if (expiresAt < nowWithPuffer ){

                this.isRefreshingToken = true;
                this.refreshToken();
                return true;

            }else{
                console.log("already alright");
                return false;
            }

        }else{
            console.log("is refreshing");
            return false;
        }

    }


    refreshToken(){
        let requestBody = {
            "grant_type" : "refresh_token", 
            "client_id" : this.auth0Config.clientId, 
            "refresh_token" : this.getRefreshToken()
        };


        this.api.refreshToken(this.auth0Config.domain, requestBody ).subscribe( (resp : any) => {
            console.log("successfully refreshed token");

            this.setExpiresAt(resp.expires_in);
            window.localStorage.setItem('accessToken', resp.accessToken);
            window.localStorage.setItem('id_token', resp.id_token);

            this.isRefreshingToken = false;

            this.unAuthCounter = 0;
        }, 
        error => {
            this.isRefreshingToken = false;
            this.api.handleAPIError(error);
        })
    }

    validateAuth (navCtrl){
        if (!this.getAuthStatus()){
            navCtrl.setRoot('LoginPage');
        }
        
    }



    getRefreshToken(){
        return window.localStorage.getItem('refreshToken');
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
