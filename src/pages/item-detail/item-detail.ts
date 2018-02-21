import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers/providers';
import { Collection, Session } from '../../models/datamodel';

import { Api } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  collection: Collection;
  selectedItems = {}; 

  constructor(public navCtrl: NavController, navParams: NavParams, public modalCtrl: ModalController, private api : Api) {

    this.collection = navParams.get('collection');
  }

  selectCompareSession(session: Session){
    session.toggleCompareSession();
  } 

  addItem() {

    this.navCtrl.push('CapturePage', {
      collection: this.collection
    });

  }

  compareItems(){
    this.navCtrl.push('ContentPage', {
      collection: this.collection
    });
  }

}
