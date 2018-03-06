import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';

import { Session, Image } from '../../models/datamodel';

import { CameraPreview, CameraPreviewOptions } from '@ionic-native/camera-preview';

import { Api, ConfigService } from '../../providers/providers';

import {LZStringService} from 'ng-lz-string';

import * as $ from 'jquery';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';


declare var cordova : any;

@IonicPage({
  segment: "capture/:collectionId"
})

@Component({
  selector: 'page-capture',
  templateUrl: 'capture.html'
})
export class CapturePage {

  captureIntervalMilSec = 100;
  sequenceLength = 50;


  capturedPics : any = [];
  captureInterval : any;
  currentImage : any = 0;
  

  collectionId : any;
  sessionId : any;

  newSession : Session;

  srcNav : any;  

  myBackgroundVideo : any;
  
  fileTransfer: FileTransferObject = this.transfer.create(); 

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    platform: Platform, public viewCtrl: ViewController,  public api: Api, private cameraPreview: CameraPreview, 
    public lz: LZStringService, private transfer: FileTransfer, private file: File, public config : ConfigService) {
    
    var compressed = this.lz.compress("This is a test string");
    
    console.log(compressed)
    
    this.srcNav = navParams.get('srvNav'); 

    this.collectionId = navParams.get('collectionId');
    this.sessionId = navParams.get('sessionId');

    


    platform.ready().then(() => {
      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      
      /*
      const cameraPreviewOpts: CameraPreviewOptions = {
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
      
      this.cameraPreview.startCamera(cameraPreviewOpts).then(
        (res) => {
          console.log(res)
        },
        (err) => {
          console.log("blubb no camera?!?!?!?")
          console.log(err)
        });

        this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.OFF);
      */
    });

    
        
  }


  // full example
upload(fileDATA) {
  let options: FileUploadOptions = {
     fileKey: 'file',
     fileName: 'testfile.mp4', 
      mimeType : 'video/mp4'
  }

  this.fileTransfer.upload(fileDATA, this.config.getHostBase() + "/upload", options)
   .then((data) => {
     console.log(data)
     console.log("SUCCESS")
   }, (err) => {
    console.log(err)
    console.log("ERROR")
   })
}



  switchCam(){
    this.cameraPreview.switchCamera();
  }

  reload(){
    window['location'].reload();
  }

  startCapture(){

    console.log("START!");
    console.log(cordova.plugins.backgroundvideo);
    (<any>window).cordova.plugins.backgroundvideo.start('myVideo', 'front', true, null, null);
    /*
    delete this.newSession;
    this.currentImage = 0;
    this.newSession = new Session({});

    this.captureInterval = setInterval(this.takePic.bind(this), this.captureIntervalMilSec); 
    */
  }

  testChangeVideo(){
    let videoFile = 'http://techslides.com/demos/sample-videos/small.mp4';
    this.changeVideo(videoFile);
  }

  testlocalVid(){
    let videoFile = "file:///var/mobile/Containers/Data/Application/8918DA2E-A254-4977-A127-B6A15712CE97/Library/NoCloud/myVideo_8.mp4";
    this.changeVideo(videoFile);
    this.upload("/var/mobile/Containers/Data/Application/8918DA2E-A254-4977-A127-B6A15712CE97/Library/NoCloud/myVideo_8.mp4")
  }

  changeVideo(videoFile){ 

    //let videoFile = 'http://techslides.com/demos/sample-videos/small.mp4';
    try{
      var videocontainer = document.getElementById('myVideo');

      var video : any = document.getElementById('myVideo');
      video.src = videoFile;
      //sources[1].src = 'video2.ogv';
      video.load();
      video.play();
    }catch(err){
      console.log(err)
    }

  }

  stopMe(){

    console.log("STOP!");

    var comp = this; 

    (<any>window).cordova.plugins.backgroundvideo.stop(function (filePath){
      console.log("success")

      let file = "file://" + filePath; 
      console.log(file);
      comp.changeVideo(file);

      comp.upload(filePath);
      comp.upload(file);
      return file;
    }, function (err){
      console.log("success")
      console.log(JSON.stringify(err));
      return err;
    })


  }

  takePic(){

    //this.cameraPreview.takePicture({quality: 100}).then(this.storePicture.bind(this));

    // for dev purposes 
    this.storePicture("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");
    
    this.currentImage++;

    if (this.currentImage >= this.sequenceLength){
      clearInterval(this.captureInterval);

      const pics = this.lz.compress(JSON.stringify(this.capturedPics));
      console.log(pics)
      //this.navBack();
    }

  }

  storePicture (base64PicData) {

    let newImg = new Image({
      "imagePath" : "data:image/jpeg;base64, " + base64PicData,
      "height" : window.screen.height,
      "width" : window.screen.width, 
      "order" : this.currentImage + 1
    });

    this.capturedPics.push(newImg)
    //this.api.uploadImgStr(this.collectionId, this.sessionId, newImg, this.sequenceLength)
    //this.newSession.images.push(newImg); 
    console.log("stored picture: " + this.currentImage)
  }

  navBack(){
    console.log("nav back");
    
    if (this.srcNav == 'session' || this.srcNav == undefined){
      this.navCtrl.setRoot('ItemDetailPage', {
        collectionId : this.collectionId
      });
    }else if (this.srcNav == 'myRoom'){
      this.navCtrl.setRoot('MyRoomPage');
    }
   }

}
