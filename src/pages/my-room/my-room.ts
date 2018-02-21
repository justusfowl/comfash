import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Collection } from '../../models/datamodel';
import { Api } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-my-room',
  templateUrl: 'my-room.html'
})
export class MyRoomPage {

  constructor(public navCtrl: NavController, public api: Api, public modalCtrl: ModalController) {
    
    this.api.getCollection();
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() { 
    
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(collection => {
      if (collection) {

        let newCollection = new Collection(collection);

        //console.log(newCollection);
        this.api.addCollection(collection);
        //this.items.add(item);
      }
    })
    
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteCollection(collection: Collection, slidingItem) {

    this.api.deleteCollection(collection.getId());
    slidingItem.close();
    //this.items.delete(item);
  }

  quickSelectCapture(collection, slidingItem){
    this.api.setSelectedCollectionId(collection._id)
    slidingItem.close();
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      collection: item
    });
  }
}
