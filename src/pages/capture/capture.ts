import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, Gesture, LoadingController, MenuController, ModalController } from 'ionic-angular';
import { Session, Collection, PurchaseTag } from '../../models/datamodel';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@ionic-native/camera-preview';
import { Api, ConfigService, LocalSessionsService, AuthService, UtilService } from '../../providers/providers';
import { DomSanitizer } from '@angular/platform-browser';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

declare var window : any;

import * as Hammer from 'hammerjs';


@IonicPage({
  segment: "capture/:collectionId"
})

@Component({
  selector: 'page-capture',
  templateUrl: 'capture.html'
})
export class CapturePage {
  @ViewChild('previewPictureRef') previewPictureRef: ElementRef;
  @ViewChild('liveOverlay') liveOverlay: ElementRef;
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

  previewVideo : any; 
  videoData : any;
  videoLocalPath : any;

  collectionList : any;

  resultCallback : any;

  purchaseTags : any = [];
  tagIndexSelected : number;

  captureTypePic : boolean = true;


  private hammer : any = Hammer;

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
    public loadingCtrl : LoadingController, 
    private transfer: FileTransfer,
    private screenOrientation : ScreenOrientation) {

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
        console.log("image data here")
      }

      platform.ready().then(() => {
        
        if (!this.isPreview){
          this.startLiveCam();
        }
        
        
      });

      this.loadCollections();

  }

  ionViewWillEnter() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

    this.auth.validateAuth(this.navCtrl);
    this.util.tabBarInvisible();
  }


  ionViewWillLeave(){
    //this.util.toggleTabBarVisible();
    this.screenOrientation.unlock();
  }


  public ngAfterViewInit(): void {

    if(!this.isPreview){

      this.pressGesture = new Gesture(this.liveOverlay.nativeElement);
  
      this.pressGesture.listen();
  
      let self = this;
      
      this.pressGesture.on('doubletap', (e:Event) => {
    
        console.log(e.type);
        self.handleDoubleTap();
        
      });


      let previewVideo = document.getElementById("previewVideo");

      const instance = new Hammer(previewVideo);

      instance.get("pan").set({direction: this.hammer.DIRECTION_ALL, threshold : 0})  ;
      
      instance.on("panmove", this.panmove.bind(this));

    }
  
  }

  panmove(ev){

    let video = document.getElementById("previewVideo") as any;

    let prc = ev.center.x / (window.innerWidth * 0.9);

    video.currentTime = prc * video.duration;
    
  }
  
  public ngOnDestroy(): void {
    try{
      this.pressGesture.destroy();
    }catch(err){
      console.log("no gesture to destroy")
    }
    
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

      let img = document.getElementById("previewPicture")

      let imgInfo = this.getImgSizeInfo(img);
      
      let resultingCoords = {
        "x" : event.center.x - (imgInfo.left),
        "y" : event.center.y , 

        "xRatio" : (event.center.x - (imgInfo.left )) / imgInfo.width,
        "yRatio" : (event.center.y) / imgInfo.height
      }

      console.log("event");
      console.log(event);
      console.log("resultingCoords");
      console.log(resultingCoords)

      this.createTag(resultingCoords);
      
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

  editTag(tag : PurchaseTag, index){

    console.log("HAAA")

    let self = this;

    let addModal = this.modalCtrl.create('TagCreatePage', {"tag": tag});

    addModal.onDidDismiss((tagModified) => {

      if (tagModified) {

        if (tagModified.delete){
          self.purchaseTags.splice(index, 1)
        }else{
          let newTag = new PurchaseTag(tagModified);
          self.purchaseTags[index] = newTag
        }

      } 
      self.tagPageIsOpen = false;

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

  smallTagClicked(index){
    if (!this.showTags){
      this.enableTags();
    }
    
    this.tagIndexSelected = index;
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

  getPreviewClasses(isPic){
    let classes = "";
    if (this.isPreview){
      if (isPic && this.captureTypePic){
        classes += "isVisible "
      }

      if (!isPic && !this.captureTypePic){
        classes += "isVisible "
      }
      
    }
    classes += 'filter-' + this.filterSelected

    return classes;
  }

  setCaptureType(isPic){
    this.captureTypePic = isPic;
  }

  capture(){

    if (this.captureTypePic){
      this.takePicture();
    }else{
      this.startCapture();
    }

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


  }

  getRenderedSize(contains, cWidth, cHeight, width, height, pos){
    var oRatio = width / height,
        cRatio = cWidth / cHeight;
    return function() {
      if (contains ? (oRatio > cRatio) : (oRatio < cRatio)) {
        this.width = cWidth;
        this.height = cWidth / oRatio;
      } else {
        this.width = cHeight * oRatio;
        this.height = cHeight;
      }      
      this.left = (cWidth - this.width)*(pos/100);
      this.right = this.width + this.left;
      return this;
    }.call({});
  }
  
  getImgSizeInfo(img) {
    var pos = getComputedStyle(img).getPropertyValue('object-position').split(' ');

    let imgInfo = this.getRenderedSize(true,
      img.width,
      img.height,
      img.naturalWidth,
      img.naturalHeight,
      parseInt(pos[0]));

    return imgInfo ;
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

    if (isRecording){
      onAirIcon.hidden = false;
    }else{
      onAirIcon.hidden = true;
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

      let loading = comp.loadingCtrl.create({
        content: 'Please wait...'
      });
    
      loading.present();


      setTimeout(function(){
        //comp.upload(filePath);
        console.log("here you go, the filepath for uploading:", filePath);

        comp.videoLocalPath = filePath; 
        let filename = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length);

        console.log(filename);

        comp.localSessions.readVidAsData(filename).then(
          data => {
            comp.isPreview = true;

            let video = document.getElementById("previewVideo") as any;
            video.src = data;
            
            video.oncanplay = function (){
              
              video.play();

              loading.dismiss();

            }

          }
        ).catch(error =>{
          console.log("error");
          console.log(JSON.stringify(error));

          loading.dismiss();
          comp.isPreview = false;
          comp.startLiveCam();
        })

      }, 500);

    }, function (err){
      console.log("error for capturing:")
      console.log(JSON.stringify(err));
      comp.isPreview = false;
      comp.startLiveCam();
      return err;
    })
    

  }

    upload() {


      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
    
      loading.present();

      let fileData = this.videoLocalPath;

      var comp = this;
  
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: 'testfile.mp4', 
         mimeType : 'video/mp4'
      }

      let headers = {
        "Authorization" : "Bearer " + this.auth.getToken()
      }
  
      options.headers = headers; 
   
      var fileTransfer = this.transfer.create(); 
  
      let endpoint = this.config.getAPIBase() + '/' + "imgcollection/" + this.collectionId + "/session"
      console.log(endpoint);
  
      fileTransfer.upload(fileData, endpoint , options)
      .then((data) => {
        console.log(data)
        console.log("SUCCESS");

        loading.dismiss();
        comp.navBack();
        
   
      }, (err) => {
       console.log(err)
       loading.dismiss();
       alert("Something went wrong, please try again")
       console.log("ERROR")
      })
      
   
    }


  navBack(){
    this.stopPreviewCam();
    this.util.tabBarVisible();
    this.navCtrl.pop();
   }

  acceptAndStore(){ 

    let self = this;


    this.util.tabBarVisible();


    setTimeout(function(){ 
      self.stopPreviewCam();
      
    }, 1000);

    if (this.captureTypePic){


      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
    
      loading.present();

      
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
    }else{
      this.upload();
    }
    
    
    
    
  }

}
