import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Session } from '../../models/datamodel';

import { Api } from '../../providers/providers';

@IonicPage({
  segment: "item-detail/:collectionId"
})
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage implements OnInit{

  constructor(public navCtrl: NavController, navParams: NavParams, public modalCtrl: ModalController, public api : Api) {
    
    let collectionId = navParams.get('collectionId'); 

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
      
        this.navCtrl.push('CapturePage', {
        collection: this.api.selectedCollection, 
        collectionId : this.api.selectedCollection.getId(),
        sessionId : response.sessionId,
        srvNav : 'session'
      });

    }

    this.api.addSession(this.api.selectedCollection.getId(), navigate.bind(this));

  }

  compareItems(){

    this.navCtrl.push('ContentPage', {
      collection: this.api.selectedCollection, 
      collectionId : this.api.selectedCollection.getId(), 
      compareSessionIds: this.api.compareSessionIds
    });
  }

  navBack(){
    this.navCtrl.setRoot('MyRoomPage');
  }

}
