import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, MenuController } from 'ionic-angular';

import { Collection } from '../../models/datamodel';
import { Api, AuthService, MsgService } from '../../providers/providers';


@IonicPage()
@Component({
  selector: 'page-my-room',
  templateUrl: 'my-room.html'
})
export class MyRoomPage {

  constructor(public navCtrl: NavController, public api: Api, public modalCtrl: ModalController, public msg : MsgService, public auth: AuthService,
    public menu: MenuController) {

    this.menu.enable(true,'mainmenu');

    this.api.getCollections();
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() { 
    
  }

  testMsg(){
    
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('CollectionCreatePage');
    addModal.onDidDismiss(collection => {
      if (collection) {

        let newCollection = new Collection(collection);

        console.log("new collection"); 
        console.log(newCollection)

        //console.log(newCollection);
        this.api.addCollection(newCollection);
        //this.items.add(item);
      }
    })
    
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteCollection(collection: Collection, slidingItem) {

    this.api.deleteCollection(collection);
    slidingItem.close();
    //this.items.delete(item);
  }

  quickSelectCapture(collection, slidingItem){
    this.api.setSelectedCollectionId(collection.getId())
    slidingItem.close();
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Collection) {

    this.api.selectedCollection = item;

    this.navCtrl.setRoot('ItemDetailPage', {
      collection: item, 
      collectionId : item.getId()
    });
  }

  captureToCollection(){


    this.navCtrl.push('CapturePage', {
      collectionId : this.api.getSelectedCollectionId().selectedId,
      srvNav : 'myRoom'
    });
  }
  
}
