import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers/providers';
import { Collection, Session, Image } from '../../models/datamodel';

import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from 
'@ionic-native/camera-preview';


import { Api } from '../../providers/providers';


@IonicPage()
@Component({
  selector: 'page-capture',
  templateUrl: 'capture.html'
})
export class CapturePage {

  capturedPics : any = [];
  captureInterval : any;
  currentImage : any = 0;
  sequenceLength = 5;

  collection : Collection;
  newSession : Session; 

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    platform: Platform, public viewCtrl: ViewController,  public api: Api, private cameraPreview: CameraPreview) { 
    
    this.collection = navParams.get('collection');

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
 
      
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
          console.log(err)
        });
        

    });
        
  }

  switchCam(){
    this.cameraPreview.switchCamera();
  }

  reload(){
    window['location'].reload();
  }

  startCapture(){

    delete this.newSession;
    this.currentImage = 0;

    this.newSession = new Session({});

    this.captureInterval = setInterval(this.takePic.bind(this), 1000); 

  }

  takePic(){

    //this.cameraPreview.takePicture(this.storePicture.bind(this));

    // for dev purposes 
    this.storePicture("../assets/img/hangersbg.png");
    this.currentImage++;

    if (this.currentImage >= this.sequenceLength){
      clearInterval(this.captureInterval);
    }

  }

  storePicture (base64PicData) {

    let newImg = new Image({
      "path" : base64PicData,
      "height" : window.screen.height,
      "width" : window.screen.width
    });

    this.newSession.images.push(newImg); 
    console.log("stored picture: " + this.currentImage)
  }

  navBack(){
    console.log("nav back")
    this.addToSession();
    this.navCtrl.pop();
   }

  addToSession(){

    if (this.newSession.images.length > 0 ){
      
      let collectionIndex = this.api.collections.indexOf(this.collection);

      if (collectionIndex != -1){

        this.api.collections[collectionIndex].addSession(this.newSession);

      }
    
    }

  }

}
