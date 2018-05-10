import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, Gesture, LoadingController, MenuController, ModalController } from 'ionic-angular';
import { Session, Collection, PurchaseTag } from '../../models/datamodel';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@ionic-native/camera-preview';
import { Api, ConfigService, LocalSessionsService, AuthService, UtilService } from '../../providers/providers';
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

  showEffects : boolean = false;
  showTags : boolean = false;

  tagPageIsOpen = false;

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

  purchaseTags : PurchaseTag[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    platform: Platform, 
    public viewCtrl: ViewController,
    public api: Api, 
    public auth: AuthService, 
    private cameraPreview: CameraPreview, 
    public modalCtrl : ModalController,
    public camera: Camera,
    public menu: MenuController, 
    public util : UtilService,
    public config : ConfigService, 
    private localSessions : LocalSessionsService, 
    private sanitizer:DomSanitizer,
    public loadingCtrl : LoadingController) {

      this.menu.enable(false,'mainmenu');

      this.srcNav = navParams.get('srvNav'); 
      let navCollectionId = navParams.get('collectionId');

      if (navCollectionId && typeof(navCollectionId) != "undefined"){
        this.collectionId = navParams.get('collectionId') ;
      }else{
        this.collectionId = "0";
      }

      let imageData = navParams.get('imageData');

      this.resultCallback = navParams.get('resultCallback');

      
      

      if (imageData && imageData != undefined && imageData != null){
        this.imageData = imageData;
        this.previewPicture = 'data:image/jpeg;base64,' + imageData;
        this.isPreview = true;
      }

      platform.ready().then(() => {
        
        if (!this.isPreview){
          this.startLiveCam();
        }
        
        
      });

      this.loadCollections();

  }

  ionViewWillEnter() {
    this.auth.validateAuth(this.navCtrl);
    this.util.tabBarInvisible();
  }


  ionViewWillLeave(){
    //this.util.toggleTabBarVisible();
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

  previewImagePressed(event){


    if (!this.tagPageIsOpen && event && this.showTags){
      this.tagPageIsOpen = true;
      this.createTag(event.center);
      
    }

  }

  createTag(coords){
    let addModal = this.modalCtrl.create('TagCreatePage', {"coords": coords});

    addModal.onDidDismiss((tag : PurchaseTag) => {
      if (tag) {
        this.purchaseTags.push(tag)
      }
      this.tagPageIsOpen = false;
    });
    
    addModal.present();
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

  toggleEffects(){
    this.showTags = false;

    if (this.showEffects){
      this.showEffects = false;
      
    }else{
      this.showEffects = true;
    }
  }

  enableTags (){
    this.showEffects = false;
    
    if (this.showTags){
      this.showTags = false;
      
    }else{
      this.showTags = true;
    }
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
    this.util.tabBarVisible();

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
      this.util.tabBarVisible();
    }, 1000);
    
    let resultItem = {
      "collectionId" : this.collectionId,
      "filterOption" : this.filterSelected,
      "newTags" : this.purchaseTags,
      "data" : this.imageData, 
      "mimeType" : "image/jpg"
    };

    this.localSessions.storeImage(resultItem).then(res => {
      this.navCtrl.pop();
      loading.dismiss();
    });
    
    
  }

}
