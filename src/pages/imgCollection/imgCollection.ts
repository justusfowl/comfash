import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Session } from '../../models/datamodel';

import { Api, ConfigService, MsgService, AuthService } from '../../providers/providers';

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

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    public modalCtrl: ModalController, 
    public api : Api, 
    public config : ConfigService, 
    public msg : MsgService, 
    public auth: AuthService) {
    
    let collectionId = navParams.get('collectionId'); 

    this.selectedCollectionId = collectionId; 

    // entweder selectedCollection aus der API gibts (dann nimm) sonst ladt und pack in API

    let loadCollection : any = this.api.loadCollection(collectionId);
    let comp = this;
    loadCollection.observable.subscribe(
      (data) => {

        // only if the query has been made to the API, load data into the api object, otherwise take existing one
        if (loadCollection.isQry){
            comp.api.handleLoadCollection(data);
        }

      },
      error => {
        comp.api.handleAPIError(error);
      }
    )
 
  }

  ngOnInit(){

  }

  checkIsMyCollection(){

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

  compareItems(){

    this.navCtrl.push('ContentPage', {
      collection: this.api.selectedCollection, 
      collectionId : this.api.selectedCollection.getId(), 
      compareSessionIds: this.api.compareSessionIds
    });
  }

  deleteSession(session : Session){

    let acceptHandler = function (){
      this.api.deleteSession(this.api.selectedCollection, session);
    }

    this.msg.presentConfirm(acceptHandler.bind(this))

  }

  navBack(){
    this.navCtrl.setRoot('MyRoomPage');
  }

}
