import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, Gesture, LoadingController, MenuController } from 'ionic-angular';
import { Session, Collection } from '../../models/datamodel';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@ionic-native/camera-preview';
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
  @ViewChild('previewPictureRef') previewPictureRef: ElementRef;
  private pressGesture: Gesture;

  isPreview : boolean = false;
  isVideoCapture : boolean = false; //feature toggle until 360° are possible

  public filters = [
 
    {
      "name" : "#nofilter",
      "description" : "#nofilter",
      "option" : 0, 
      "data" : null
    },
    {
      "name" : "aden",
      "description" : "Aden",
      "option" : 1, 
      "data" : null
    },
    {
      "name" : "brooklyn",
      "description" : "Brooklyn",
      "option" : 2, 
      "data" : null
    },
    {
      "name" : "inkwell",
      "description" : "Inkwell",
      "option" : 3, 
      "data" : null
    },
    {
      "name" : "maven",
      "description" : "Maven",
      "option" : 4, 
      "data" : null
    },
    {
      "name" : "moon",
      "description" : "Moon",
      "option" : 4, 
      "data" : null
    },
    {
      "name" : "willow",
      "description" : "Willow",
      "option" : 5, 
      "data" : null
    },
  ]

  filterSelected : string = "";
  
  
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
    tapToFocus: true,
    previewDrag: true,
    toBack: true,
    alpha: 1
  };

  // picture options
  pictureOpts: CameraPreviewPictureOptions = {
    width: window.innerWidth * 3,
    height: window.innerHeight * 3,
    quality: 100
  }

  captureCamera: string = 'front';
  collectionId : any = "0";
  newSession : Session;
  srcNav : any;  

  previewPicture : any;
  imageData : any;

  collectionList : any;

  resultCallback : any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    platform: Platform, 
    public viewCtrl: ViewController,
    public api: Api, 
    private cameraPreview: CameraPreview, 
    public camera: Camera,
    public menu: MenuController, 
    private transfer: FileTransfer, 
    public config : ConfigService, 
    private auth: AuthService,
    private localSessions : LocalSessionsService, 
    private sanitizer:DomSanitizer,
    public loadingCtrl : LoadingController) {

      this.menu.enable(false,'mainmenu');

      let userId = this.auth.getUserId();

      this.srcNav = navParams.get('srvNav'); 
      let navCollectionId = navParams.get('collectionId');

      if (navCollectionId && typeof(navCollectionId) != "undefined"){
        this.collectionId = navParams.get('collectionId') ;
      }else{
        this.collectionId = "0";
      }

      let imageData = navParams.get('imageData');

      this.resultCallback = navParams.get('resultCallback');

      platform.ready().then(() => {
      
        this.startLiveCam();

        
      });
      

      if (imageData && imageData != undefined && imageData != null){
        this.imageData = imageData;
        this.previewPicture = 'data:image/jpeg;base64,' + imageData;
        this.isPreview = true;
      }

      this.loadCollections();

  }



  public ngAfterViewInit(): void {

    this.pressGesture = new Gesture(this.previewPictureRef.nativeElement);
  
    this.pressGesture.listen();

    let self = this;
    
    this.pressGesture.on('doubletap', (e:Event) => {
  
      console.log(e.type);
      self.handleDoubleTap();
      
    });
  
  }
  
  public ngOnDestroy(): void {
    this.pressGesture.destroy();
    this.menu.enable(true,'mainmenu');
  }

  loadCollections(){

    let userId = this.auth.getUserId();


       this.api.myCollections().subscribe(
      (data) => {
        
        try{

          let outData = data.map(function(val){
            let tmpCollection = new Collection(val);
            tmpCollection.castSessions();
            return tmpCollection;
          })

        this.collectionList = outData;
        }
        catch(err){
          console.log(err);
          return null;
        } 
      },
      error => {
        this.api.handleAPIError(error);
      }
    )
   
  }



  handleDoubleTap(){

    if (this.isPreview){
      this.isPreview = false;
      this.previewPicture = null
    }else{
      this.switchCam();
    }
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

  setFilter(filterName){
    console.log(filterName, " selected filter")
    this.filterSelected = filterName;
  }

  takePicture(){



    this.cameraPreview.takePicture(this.pictureOpts).then(
      data => {
        this.isPreview = true;
        this.previewPicture = 'data:image/jpeg;base64,' + data;
        if (data.constructor === Array){
          this.imageData = data[0];
        }else{
          this.imageData = data;
        }
        
      }
    ).catch(error =>{
      console.log("error");
      console.log(error);
    });

    //this.localSessions.captureCameraPicture(this.collectionId);

  }

  stopPreviewCam(){
    this.cameraPreview.stopCamera();
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
        //comp.upload(filePath);
        console.log("here you go, the filepath for uploading:", filePath)
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

  acceptAndStore(){ 

    let self = this;

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
  
    loading.present();


    setTimeout(function(){ 
      self.stopPreviewCam();
    }, 1000);
    
    let resultItem = {
      "collectionId" : this.collectionId,
      "filterOption" : this.filterSelected,
      "data" : this.imageData, 
      "mimeType" : "image/jpg"
    };

    this.localSessions.storeImage(resultItem).then(res => {
      this.navCtrl.pop();
      loading.dismiss();
    });
    
    
  }

}
