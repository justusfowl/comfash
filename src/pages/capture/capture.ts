import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import { Session } from '../../models/datamodel';
import { CameraPreview, CameraPreviewOptions } from '@ionic-native/camera-preview';
import { Api, ConfigService, LocalSessionsService } from '../../providers/providers';
import { FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer';
import { AuthService } from '../../providers/providers'; 
import { DomSanitizer } from '@angular/platform-browser';

import { Camera } from '@ionic-native/camera';


@IonicPage({
  segment: "capture/:collectionId"
})

@Component({
  selector: 'page-capture',
  templateUrl: 'capture.html'
})
export class CapturePage {

  
  captureIntervalMilSec = 4000;
  countdownMilSecInterval = 1000;
  countdownSec = 3;

  secondsUntilShot : number = 3;
  
  cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: this.cameraPreview.CAMERA_DIRECTION.FRONT,
    //tapPhoto: true,
    tapToFocus: true,
    previewDrag: true,
    toBack: true,
    alpha: 1
  };

  captureCamera: string = 'front';
  collectionId : any;
  newSession : Session;
  srcNav : any;  

  previewPicture : any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    platform: Platform, 
    public viewCtrl: ViewController,
    public api: Api, 
    private cameraPreview: CameraPreview, 
    public camera: Camera,
    private transfer: FileTransfer, 
    public config : ConfigService, 
    private auth: AuthService,
    private localSessions : LocalSessionsService, 
    private sanitizer:DomSanitizer) {

    let userId = this.auth.getUserId();

    this.srcNav = navParams.get('srvNav'); 

    this.collectionId = navParams.get('collectionId');

    platform.ready().then(() => {


    
      this.startLiveCam();
      
    }); 
  }


  testLoadLocalSession(filename){
    let self = this;
    this.localSessions.getLocalSession(filename).then(data => {
          self.previewPicture = self.sanitizer.bypassSecurityTrustResourceUrl(data);
          console.log(data.substr(0,25))
    })
  }


  startLiveCam(){
    this.cameraPreview.startCamera(this.cameraPreviewOpts).then(
      (res) => {
        console.log("STARTING SUCCESS")
        console.log(res)
      },
      (err) => {
        console.log("blubb no camera?!?!?!?")
        console.log(err)
      });

      this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.OFF);

  }

  getCameraPicture(){
    let self = this; 

    if (Camera['installed']()) {
      this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: window.outerWidth,
        targetHeight:window.outerHeight
      }).then((data) => {

        this.previewPicture = 'data:image/png;base64,' + data;

        self.localSessions.storeImage(this.collectionId, data, "image/png");


      }, (err) => {
        alert('Unable to take photo');
      })
    } else {
      console.log("click?"!);
    }
  }

  takePicture(){

    let self = this; 

    let options = this.cameraPreviewOpts; 
    options.width = options.width * 20;
    options.height = options.height * 20;
        // take a picture
    this.cameraPreview.takePicture(options).then((imageData) => {
      this.previewPicture = 'data:image/png;base64,' + imageData;

      self.localSessions.storeImage(this.collectionId, imageData, "image/png");

    }, (err) => {
      console.log(err);
    });

  }

  stopPreviewCam(){
    this.cameraPreview.stopCamera();
  }
  
  upload(fileData) {

  var comp = this;

    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'testfile.mp4', 
      mimeType : 'video/mp4'
    }

    let headers = {
      "x-access-token" : this.auth.getToken()
    }

    options.headers = headers; 

    var fileTransfer = this.transfer.create(); 

    let endpoint = this.config.getAPIBase() + '/' + "imgcollection/" + this.collectionId + "/session";

    let date = new Date(); 

    let newSession = new Session({
      sessionId : date.getTime() * 999999,
      sessionItemPath : fileData, 
      userId : this.auth.getUserId()
    });

    newSession.flagIsTmp = true;

    this.api.addSessionToCollection(this.collectionId, newSession); 

    console.log("SuCCESSSful added") 
    comp.navBack();

    console.log("uploading the video in the background");

    fileTransfer.upload(fileData, endpoint , options, true)
    .then((data) => {

      console.log("successfully uploading the video done");


      let loadCollection : any = this.api.loadCollection(this.collectionId, true);
      let comp = this;

      loadCollection.observable.subscribe(
        (data) => {

          // handlLoad every time sine froced = true

          comp.api.handleLoadCollection(data);
        },
        error => {
          comp.api.handleAPIError(error);
        }
      )

 
    }, (err) => {
      console.log("error in uploading the video");
      console.log(err);
    })
    
  }

  switchCam(){
    this.cameraPreview.switchCamera();

    if (this.captureCamera == 'front'){
      this.captureCamera = 'BACK'; 
    }else{
      this.captureCamera = 'front';
    }
  }

  setUIRecording(isRecording: boolean){

    let onAirIcon = document.getElementById("onAirCapture");
    let footer = document.getElementById("footer");

    if (isRecording){
      onAirIcon.hidden = false;
      footer.hidden = true;
    }else{
      onAirIcon.hidden = true;
      footer.hidden = false;
    }
  }
 
  startCapture(){

    console.log("stopping preview");
    this.stopPreviewCam();
    
    this.setUIRecording(true);

    console.log("starting capturing");

    var comp = this;

    var fileName = new Date().getTime().toString();

    const captureOptions = {
      filename : "comfash_" + fileName, 
      camera : comp.captureCamera, 
      x: 0, 
      y: 0, 
      width: window.screen.width,
      height: window.screen.height,
    };

    (<any>window).cordova.plugins.backgroundvideo.start(captureOptions, null, null);

    setTimeout(function(){

      comp.stopMe();
    
    }, comp.captureIntervalMilSec);

  }

  startCountdown(){

    document.getElementById('countdownOverlay').hidden = false;

    let comp = this;
    let countDown = setInterval(function(){
      comp.secondsUntilShot = comp.secondsUntilShot - 1 ; 

      if (comp.secondsUntilShot < 1){
        clearInterval(countDown);
        comp.secondsUntilShot = comp.countdownSec;
        document.getElementById('countdownOverlay').hidden = true;
        comp.startCapture();
      }

    }, this.countdownMilSecInterval)
  }

  stopMe(){

    console.log("stopping capturing"); 

    var comp = this; 
      
    (<any>window).cordova.plugins.backgroundvideo.stop(function (filePath){
      console.log("successfully capturing file: ")
      console.log(filePath);

      comp.setUIRecording(false);

      setTimeout(function(){
        comp.upload(filePath);
      }, 100);

    }, function (err){
      console.log("error for capturing:")
      console.log(JSON.stringify(err));
      return err;
    })
    

  }

  navBack(){
    console.log("navigating back");
    this.stopPreviewCam();

    this.navCtrl.pop();

   }

}
