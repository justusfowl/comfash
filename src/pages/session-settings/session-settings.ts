import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UtilService, MsgService } from '../../providers/providers';

/**
 * Generated class for the SessionSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({ 
  selector: 'page-session-settings',
  templateUrl: 'session-settings.html',
})
export class SessionSettingsPage {

  public settingsOptions : any;

  // image src, both path or base64 data
  public originalImageSrc = "assets/img/2.jpg";

  public mainImgData = "";
  public thumbImgData = "";
  private thumbnailSize = 100;
  public filterIndexSelected : number = 0;
  private isProcessing : boolean = false;

  public filterOptions = [

    {
      "name" : "Original",
      "option" : 0, 
      "data" : null
    },
    {
      "name" : "Vintage",
      "option" : 1, 
      "data" : null
    },
    {
      "name" : "Glowing Sun",
      "option" : 2, 
      "data" : null
    },
    {
      "name" : "Old Boot",
      "option" : 3, 
      "data" : null
    },
    {
      "name" : "Nostalgia",
      "option" : 4, 
      "data" : null
    },
    {
      "name" : "Sin City",
      "option" : 5, 
      "data" : null
    },
  ]


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public util: UtilService, 
    public msg : MsgService,
    public viewCtrl: ViewController) {

    let settingsOptions = navParams.get('settingsOptions');
    let origData = settingsOptions.data;

    if (origData.substring(0,4) == "data"){
      this.originalImageSrc = origData;
    }else{
      this.originalImageSrc = "data:" + settingsOptions.mimeType + ";base64," + origData;
    }

    this.settingsOptions = settingsOptions;

    console.log(settingsOptions.data.substring(0,25));

    // Caman.DEBUG = true;
  }

  ionViewDidLoad() {
    //this.loadFileIntoCanvas(this.testImg);
    //this.resizePreview();
    this.loadImage();
    let self = this;

    Caman.Event.listen("renderFinished", function (data){
      self.isProcessing = false;
    });
  }

  loadImage(){
    var img = new Image();
    let self = this;

    img.onload = resizeImage;
    img.src = this.originalImageSrc;
    
    let targetWidth = window.innerWidth * 1;
    let targetHeight = window.innerHeight * 1;

    function resizeImage() {

        let targetObjLarge = {
          targetWidth : targetWidth, 
          targetHeight : targetHeight
        };

        let resultSizeLarge = self.getSmallestSize(targetObjLarge, img.width, img.height);

        var newDataUri = self.createBase64FromImageAndDownsize(this, resultSizeLarge.targetWidth, resultSizeLarge.targetHeight);

        let targetObjSmall= {
          targetWidth : self.thumbnailSize, 
          targetHeight : self.thumbnailSize
        };

        let resultSize = self.getSmallestSize(targetObjSmall, img.width, img.height);

        var thumbData = self.createBase64FromImageAndDownsize(this, resultSize.targetWidth, resultSize.targetHeight)
        self.mainImgData = newDataUri;
        self.thumbImgData = thumbData;
        self.prepareThumbnails(thumbData);
    }
  }

  createBase64FromImageAndDownsize(img, width, height){

      // create an off-screen canvas
      var canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');
  
      // set its dimension to target size
      canvas.width = width;
      canvas.height = height;
  
      // draw source image into the off-screen canvas:
      ctx.drawImage(img, 0, 0, width, height);
  
      // encode image to data-uri with base64 version of compressed image
      return canvas.toDataURL();

  }

  prepareThumbnails(data){

    this.filterOptions.forEach(element => {
      element.data = data;
    });

    this.filterOptions.forEach(this.addFilterThumb.bind(this));

    // set default filter selected to original

    this.filterIndexSelected = 0;

  }

  addFilterThumb(element, index){
    let id = "#thumb_" + index;
    this.addFilter(id, element.option);
  }



  addFilter(elementId : string, filterOption : number){

    this.isProcessing = true;
    this.filterIndexSelected = filterOption; 

    Caman(elementId, function(){
      this.revert(false);

      switch(filterOption) {
          case 1:
              this.vintage();
              break;
          case 2:
              this.glowingSun();
              break;
          case 3:
              this.oldBoot();
              break;
          case 4:
              this.nostalgia();
              break;
          case 5:
              this.nostalgia();
              break;
          default: 
      }

      if (filterOption != -1){
        this.render();
      }
      
    })
 }

 getSmallestSize(targetObj: any, imgWidth, imgHeight) : any{

  let resultSize = {};
  let scallingRatio; 

  if (imgWidth > imgHeight){

    scallingRatio = targetObj.targetWidth/imgWidth;

  }else{

    scallingRatio = targetObj.targetHeight/imgHeight;

  }

  resultSize["targetWidth"] = imgWidth * scallingRatio;
  resultSize["targetHeight"] = imgHeight * scallingRatio;


  return resultSize;

 }


   /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  acceptAndStore(){
    
    let resultItem = {
      "filterOption" : this.filterOptions[this.filterIndexSelected],
      "originalData" : this.originalImageSrc
    };

    this.viewCtrl.dismiss(resultItem);

  }




}
