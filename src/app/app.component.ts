import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';

import { FirstRunPage, MainPage } from '../pages/pages';
import { Settings, WebsocketService } from '../providers/providers';

import { Camera } from '@ionic-native/camera';

import { AuthService, MsgService, Api, ConfigService } from '../providers/providers';

@Component({
  templateUrl: "app.menu.html"
})
export class MyApp {
  rootPage = '';

  @ViewChild(Nav) nav: Nav;

  /*
  pages: any[] = [
    { title: 'Tutorial', component: 'TutorialPage' },
    { title: 'Welcome', component: 'WelcomePage' },
    { title: 'Tabs', component: 'TabsPage' },
    { title: 'Cards', component: 'CardsPage' },
    { title: 'Content', component: 'ContentPage' },
    { title: 'Login', component: 'LoginPage' },
    { title: 'Signup', component: 'SignupPage' },
    { title: 'Master Detail', component: 'ListMasterPage' },
    { title: 'Menu', component: 'MenuPage' },
    { title: 'Settings', component: 'SettingsPage' },
    { title: 'Search', component: 'SearchPage' }
  ]
  */

  pages : any[] = [
    { title: 'MyRoom', 
      component: 'MyRoomPage', 
      params : {
                  userId : this.auth.getUserId()
                } 
    },
    { title: 'FittingStream', component: 'FittingStreamPage' },
    { title: 'Notifications', component: 'NotificationsPage' },
    { title: 'Settings', component: 'SettingsPage' }
  ]


  constructor(
    private translate: TranslateService, 
    platform: Platform, 
    settings: Settings, 
    private config: Config, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen, 
    private msg : MsgService, 
    private auth: AuthService, 
    private ws : WebsocketService, 
    public camera: Camera, 
    public api: Api, 
    private cfg : ConfigService) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // OneSignal Code start:
    // Enable to debug issues:
    // window["plugins"].OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});


    var callbackForNotifications = function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    };

    
    try{

      window["plugins"].OneSignal

      .startInit("56791b6b-28da-4dde-9ee0-6e4e057313d4")
  
      .handleNotificationOpened(callbackForNotifications)

      .endInit();


    }
    catch(err){
        console.log(JSON.stringify(err))
    }



    });

    if (auth.getToken()){
      this.msg.initMsgService();
      this.rootPage = MainPage;
    }else{
      this.rootPage = FirstRunPage;
    }

    //this.msg.connect();
    
    this.initTranslate();

  }

  /*
  // Define settings for iOS
  var iosSettings = {};
  iosSettings["kOSSettingsKeyAutoPrompt"] = true;
  iosSettings["kOSSettingsKeyInAppLaunchURL"] = false;


  // Initialise plugin with OneSignal service
  this.signal.startInit("56791b6b-28da-4dde-9ee0-6e4e057313d4").iOSSettings(iosSettings);


  // Control how OneSignal notifications will be shown when
  // one is received while your app is in focus
  this.signal.inFocusDisplaying(this.signal.OSInFocusDisplayOption.InAppAlert);


  // Retrieve the OneSignal user id and the device token
  this.signal.getIds()
  .then((ids) =>
  {
    console.log('getIds: ' + JSON.stringify(ids));
  });


  // When a push notification is received handle
  // how the application will respond
  this.signal.handleNotificationReceived()
  .subscribe((msg) =>
  {
    // Log data received from the push notification service
    console.log('Notification received');
    console.dir(msg);
  });


  // When a push notification is opened by the user
  // handle how the application will respond
  this.signal.handleNotificationOpened()
  .subscribe((msg) =>
  {
    // Log data received from the push notification service
    console.log('Notification opened');
    console.dir(msg);
  });


  // End plugin initialisation
  this.signal.endInit();
  */

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();

    if (browserLang) {
      if (browserLang === 'zh') {
        const browserCultureLang = this.translate.getBrowserCultureLang();

        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translate.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translate.use('zh-cmn-Hant');
        }
      } else {
        this.translate.use(this.translate.getBrowserLang());
      }
    } else {
      this.translate.use('en'); // Set your language here
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario

    if (page.params){
      this.nav.setRoot(page.component, page.params);
    }else{
      this.nav.setRoot(page.component);
    }
    
  }

  doLogout(){

    this.ws.disconnect();

    this.auth.logout();

    this.nav.setRoot("LoginPage");
    
  }

  getPicture() {
    if (Camera['installed']()) {
      this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 250,
        targetHeight: 250
      }).then((data) => {

        let picSrc = 'data:image/jpg;base64,' + data;
        let avatarBody = { 'imagePath': picSrc };

        this.api.upsertUserAvatar(avatarBody).subscribe( data => {
          this.auth.setAvatarBaseStr(picSrc);
        });


      }, (err) => {
        alert('Unable to take photo');
      })
    } else {
      console.log("click?"!);
    }
  }

  getAvatarUrl(avatarPath){

    try{
      if (avatarPath.length > 0){
        if (avatarPath.substring(0,4) == 'data'){
          return avatarPath; 
        }else{
          return this.cfg.getHostBase() + avatarPath;
        }
      }else{
        return "";
      }
    }catch(err){
      return "";
    }
  }

  getDevice(){

  }
}
