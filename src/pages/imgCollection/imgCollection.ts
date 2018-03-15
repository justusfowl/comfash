import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Session } from '../../models/datamodel';

import { Api, ConfigService, MsgService } from '../../providers/providers';

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

  constructor(public navCtrl: NavController, navParams: NavParams, public modalCtrl: ModalController, 
    public api : Api, public config : ConfigService, 
    public msg : MsgService) {
    
    let collectionId = navParams.get('collectionId'); 

    this.selectedCollectionId = collectionId; 

    // entweder selectedCollection aus der API gibts (dann nimm) sonst ladt und pack in API

    this.api.loadCollection(collectionId);

    //this.collection = navParams.get('collection')
 
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
    

    let navigate = function (response){

    }

    
    this.navCtrl.push('CapturePage', {
      collection: this.api.selectedCollection, 
      collectionId : this.api.selectedCollection.getId(),
      srvNav : 'session'
    });

    //this.api.addSession(this.api.selectedCollection.getId(), navigate.bind(this));

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
