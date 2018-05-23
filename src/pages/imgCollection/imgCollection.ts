import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Session, Collection } from '../../models/datamodel';

import { Api, ConfigService, MsgService, AuthService, UtilService, LocalSessionsService, VoteHandlerService } from '../../providers/providers';

@IonicPage({
  segment: "imgCollection/:collectionId", 
  defaultHistory : ["MyRoomPage"]
})
@Component({
  selector: 'page-imgCollection',
  templateUrl: 'imgCollection.html'
})
export class ImgCollectionPage implements OnInit{

  selectedCollectionId : number;
  sortDirection : boolean = true;

  collectionUserId : string;

  collection : Collection; 

  collectionUserName : string; 
  collectionTitle : string;

  localSessionsArray : Session[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public api : Api, 
    public config : ConfigService, 
    public msg : MsgService, 
    public auth: AuthService, 
    public util: UtilService, 
    private localSessions : LocalSessionsService, 
    private voteHdl : VoteHandlerService) {
    


 
  }

  ionViewWillEnter() {
    this.auth.validateAuth(this.navCtrl)
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {

    let self = this;

    this.localSessions.onLocalSessionAdded.subscribe(value => {
      self.loadCollection();
    });

    this.localSessions.onLocalSessionUploaded.subscribe(value => {
      let responseBody = JSON.parse(value.response);
      let localSessionId = value.localSessionId;
      self.replaceLocalByUploaded(localSessionId, responseBody);
    
    });

    let collectionId = this.navParams.get('collectionId'); 

    this.selectedCollectionId = collectionId; 

    // entweder selectedCollection aus der API gibts (dann nimm) sonst ladt und pack in API

    this.loadCollection()

  }

  replaceLocalByUploaded(localId : number, uploadResponse: any){

    console.log("I AM HERE IN THE REPLACELOCALFUNC TO UPDATE SESSIONID ??????? ")
    console.log(JSON.stringify(localId));
    console.log("afterrr");

    this.collection.sessions.forEach(session => {

      console.log(JSON.stringify(session.getId()));
      console.log(JSON.stringify(localId));

      if (session.getId() == localId){
        console.log("I AM HERE IN THE REPLACELOCALFUNC TO UPDATE SESSIONID; ", session.getId())
        session.updateWithUploadData(uploadResponse);

      }
      
    });

    console.log("ENDS")

  }

  uploadLocalSession(session : any){
    session.uploadInProgress = true;
    let self = this;
    this.localSessions.upload(session).then((res : any) => {
      self.loadCollection();
    }).catch(e => console.log('Error in upload localsession:', JSON.stringify(e)));
  }

  loadCollection(loader? : any){

    let self = this;

    this.api.loadCollection(this.selectedCollectionId).subscribe(
      (data) => {

        let tmpCollection = new Collection(data[0]);

        tmpCollection.castSessions();

        let localSessionArr;

        this.collectionUserId = tmpCollection.getUserId();
        this.collection = tmpCollection;

        this.collectionUserName = tmpCollection.userName;
        this.collectionTitle = tmpCollection.collectionTitle;
        
        self.localSessions.loadLocalSessionArray([tmpCollection.getId()]).then( (data : any) => {
          localSessionArr = data[tmpCollection.getId()];

          if (localSessionArr){
            localSessionArr.forEach(element => {
              tmpCollection.sessions.unshift(element);
            });
          }

          if (loader){
            loader.complete();
          }
        });

      },
      error => {
        this.api.handleAPIError(error);
      }
    )
  }

  ngOnInit(){

  }

  addItem() {
    
    this.navCtrl.push('CapturePage', {
      collection: this.api.selectedCollection, 
      collectionId : this.api.selectedCollection.getId(),
      srvNav : 'session'
    });

  }

  captureCameraPicture(sourceType, fabButton){
    let collectionId = this.api.selectedCollection.getId(); 
    fabButton.close();

    let resultAction = function (){
      let self = this;
      setTimeout(function(){ self.loadCollection(); }, 500);

      
    };

    this.localSessions.captureCameraPicture(collectionId, this.navCtrl, resultAction.bind(this), sourceType);
  }

  compareItems(){

    this.navCtrl.push('ContentPage', {
      collection: this.api.selectedCollection, 
      collectionId : this.api.selectedCollection.getId(), 
      compareSessionIds: this.api.compareSessionIds
    });
  }

  onDeleteClick(session : Session){
    console.log("delete clicked in imgcollection");
    let acceptHandler;
    let sessionId = session.getId();
    let self = this;

    if (session.flagIsTmp){
      acceptHandler = function (){ 
        this.localSessions.deleteLocalSession(session.getFileName()).then((data) => {
          let index = self.collection.sessions.findIndex(x => x["sessionId"] === sessionId);
          self.collection.sessions.splice(index, 1);
        })
      
      };

    }else{
      acceptHandler = function (){
        this.api.deleteSession(this.api.selectedCollection, session).subscribe(
          (data) => {
            let index = self.collection.sessions.findIndex(x => x["sessionId"] === sessionId);
            self.collection.sessions.splice(index, 1);
          },
          error => {
            this.api.handleAPIError(error);
          }
        )
      }
    }

    this.msg.presentConfirm("ALERT_DELETE_MSG", "ALERT_DELETE_TITLE", acceptHandler.bind(this))

  }

  onVoteClick(voteType: number, session: Session){
      this.voteHdl.handleVoteClicked(voteType, session);
  }

  protected isOdd(num){
    return num % 2;
  }
  protected isThreeDivide(num){
    return !(num % 3);
  }

  getSessionTileStyle(index){
    let totalCnt = this.collection.sessions.length; 
    let viewWidth = window.innerWidth;

    let styleStr = "";

    let rowCnt; 

    if (totalCnt > 1){
      if (viewWidth <= 400){
        rowCnt = 2;
        
        if (index +1 < totalCnt){
          if (!this.isOdd(index)){
            styleStr = this.addBorderToStyleStr(styleStr, "right");
            if (index + 2 < totalCnt){
              styleStr = this.addBorderToStyleStr(styleStr, "bottom");
            }
          }else{
            styleStr = this.addBorderToStyleStr(styleStr, "left");
            if (index + 1 < totalCnt){
              styleStr = this.addBorderToStyleStr(styleStr, "bottom");
            }
          }
        }else{
          if (this.isOdd(totalCnt)){
            styleStr += "width: 100%;"
          }
          
        }


        if (index >= rowCnt){
          styleStr = this.addBorderToStyleStr(styleStr, "top");
        }
  
      }else{
        rowCnt = 3;

        if ((index + 1 < totalCnt || index + 2 < totalCnt)){

          

           // check if image is the left
          if (this.isThreeDivide(index) || index == 0){


            styleStr = this.addBorderToStyleStr(styleStr, "right");

            if (index + 3 < totalCnt){
              styleStr = this.addBorderToStyleStr(styleStr, "bottom");
            }

           // check if the image is the right one
          }else if (this.isThreeDivide(index+1)){

            styleStr = this.addBorderToStyleStr(styleStr, "left");

            if (index + 1 < totalCnt){
              styleStr = this.addBorderToStyleStr(styleStr, "bottom");
            }

             // check if image is the middle one
          }else if (this.isThreeDivide(index+2)){

            styleStr = this.addBorderToStyleStr(styleStr, "left");
            styleStr = this.addBorderToStyleStr(styleStr, "right");

            if (index + 2 < totalCnt){
              styleStr = this.addBorderToStyleStr(styleStr, "bottom");
            }
          }

        }else{
          if (!this.isThreeDivide(totalCnt)){
            if (!this.isOdd(totalCnt)){
              // for last pic if i
              styleStr += "width: 50%;"
            }else{
              // for last pic if i
              styleStr += "width: 100%;"
            }
          }

          
        }

        // add top if it is in row greater than one
        if (index >= rowCnt){
          styleStr = this.addBorderToStyleStr(styleStr, "top");
        }
  
      }
    }


    return this.util.sanitizeStyle(styleStr);



  }

  addBorderToStyleStr(inputStr, location){
    return inputStr += " border-"+ location + ": 1px solid white;";
  }


  sortSessionsByVotes(){

    let factor;

    if (this.sortDirection){
      this.sortDirection = false;
      factor = -1;
    }else{
      this.sortDirection = true;
      factor = 1;
    }
    

    // Sortierung nach Wert
    this.api.selectedCollection.sessions.sort(function (a, b) {
 
      if (a.voteAvg > b.voteAvg) {
        return 1 * factor;
      }
      if (a.voteAvg < b.voteAvg) {
        return -1 * factor;
      }
      // a muss gleich b sein
      return 0;
    });
  }

  navBack(){
    this.navCtrl.setRoot('MyRoomPage');
  }

}
