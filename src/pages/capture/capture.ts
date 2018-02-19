import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers/providers';

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
  sequenceLength = 5; 

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    platform: Platform, public viewCtrl: ViewController,  public api: Api, private cameraPreview: CameraPreview) { 


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
 
      
      const cameraPreviewOpts: CameraPreviewOptions = {
        x: 0,
        y: 0,
        width: window.screen.width,
        height: window.screen.height,
        camera: this.cameraPreview.CAMERA_DIRECTION.FRONT,
        tapPhoto: true,
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

  reload(){
    window['location'].reload();
  }

  startCapture(){

    this.captureInterval = setInterval(this.takePic.bind(this), 1000); 

  }

  takePic(){

    this.cameraPreview.takePicture(this.storePicture.bind(this));
    
    if (this.capturedPics.length >= this.sequenceLength){
      clearInterval(this.captureInterval);
    }

  }

  storePicture (base64PicData) {
    this.capturedPics.push(base64PicData); 
  }

  navBack(){
    console.log("nav back")
    this.addToSession();
    this.navCtrl.pop();
   }

  addToSession(){

    let pictures = this.capturedPics; 

    var firstPic = {
      "name": "Donald Duck",
      "profilePic": "data:image/jpg;base64," + pictures[0],
      "about": "Donald is a Duck.",
      "collection" : []
    };

    for (let item of pictures) {

      var tmpPic = {
        "name": "Donald Duck",
        "profilePic": "data:image/jpg;base64," + item,
        "about": "Donald is a Duck."
      };

      firstPic.collection.push(tmpPic)
      
    }

    this.api.collections[0].items.push(firstPic);

  }



}
