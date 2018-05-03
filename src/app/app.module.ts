import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CameraPreview } from '@ionic-native/camera-preview';
import { Camera } from '@ionic-native/camera';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { File } from '@ionic-native/file';

import { FileTransfer } from '@ionic-native/file-transfer';

import { Network } from '@ionic-native/network';
import { BackgroundFetch } from '@ionic-native/background-fetch';

import { IonicImageViewerModule } from '../components/image-viewer/ionic-image-viewer';

import { 
  ConfigService, 
  User, 
  Api, 
  LocalSessionsService,
  MsgService, 
  WebsocketService,  
  Settings, 
  AuthService, 
  UtilService,
  VoteHandlerService } from '../providers/providers';

import { AuthIntercept } from '../providers/api/authintercept'
import { MyApp } from './app.component';

import { OneSignal } from '@ionic-native/onesignal';

import { Facebook } from '@ionic-native/facebook';


//import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
//const config: SocketIoConfig = { url: 'http://192.168.178.142:9999', options: {} };

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    IonicImageViewerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    OneSignal,
    UtilService,
    MsgService,
    ConfigService,
    Settings,
    AuthService,
    WebsocketService,
    Api,
    LocalSessionsService,
    VoteHandlerService,
    { provide: HTTP_INTERCEPTORS, useClass : AuthIntercept, multi: true},
    User,
    Camera,
    CameraPreview,
    SplashScreen,
    StatusBar,
    Network,
    BackgroundFetch,
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler }, 
    File, 
    FileTransfer, 
    Facebook
  ],
})
export class AppModule { }
