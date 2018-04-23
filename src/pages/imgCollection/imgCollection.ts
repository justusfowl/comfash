import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Session, localSession } from '../../models/datamodel';

import { Api, ConfigService, MsgService, AuthService, UtilService, LocalSessionsService } from '../../providers/providers';

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

  localSessionsArray : Session[];

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    public modalCtrl: ModalController, 
    public api : Api, 
    public config : ConfigService, 
    public msg : MsgService, 
    public auth: AuthService, 
    public util: UtilService, 
    private localSessions : LocalSessionsService) {
    
    let collectionId = navParams.get('collectionId'); 

    this.selectedCollectionId = collectionId; 

    // entweder selectedCollection aus der API gibts (dann nimm) sonst ladt und pack in API

    let loadCollection : any = this.api.loadCollection(collectionId);

    let comp = this;
    loadCollection.observable.subscribe(
      (data) => {

        this.collectionUserId = this.api.selectedCollection.getUserId();

        // only if the query has been made to the API, load data into the api object, otherwise take existing one
        if (loadCollection.isQry){
            comp.api.handleLoadCollection(data);
        }

        this.sortSessionsByVotes();

      },
      error => {
        comp.api.handleAPIError(error);
      }
    )
 
  }

  ngOnInit(){

  }

  selectCompareSession(session: Session){
    this.api.toggleCompareSession(session)
  }

  isCompared(session : Session){

    
    if (this.api.compareSessionIds.indexOf(session.getId()) != -1){
      return true;
    }else{
      return false;
    }
  }

  addItem() {
    
    this.navCtrl.push('CapturePage', {
      collection: this.api.selectedCollection, 
      collectionId : this.api.selectedCollection.getId(),
      srvNav : 'session'
    });

  }

  captureCameraPicture(sourceType){
    let collectionId = this.api.selectedCollection.getId(); 

    this.localSessions.captureCameraPicture(collectionId, sourceType);
  }

  compareItems(){

    this.navCtrl.push('ContentPage', {
      collection: this.api.selectedCollection, 
      collectionId : this.api.selectedCollection.getId(), 
      compareSessionIds: this.api.compareSessionIds
    });
  }

  deleteLocalSession(localSession : localSession){

    this.localSessions.deleteLocalSession(localSession.getFileName())

  }

  deleteSession(session : Session){

    let acceptHandler = function (){
      this.api.deleteSession(this.api.selectedCollection, session);
    }

    this.msg.presentConfirm(acceptHandler.bind(this))

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
