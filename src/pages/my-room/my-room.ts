import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, MenuController, NavParams } from 'ionic-angular';

import { Collection } from '../../models/datamodel';
import { Api, AuthService, MsgService, ConfigService } from '../../providers/providers';


@IonicPage({
  segment: "my-room/:userId"
})
@Component({
  selector: 'page-my-room',
  templateUrl: 'my-room.html'
})
export class MyRoomPage {

  roomUserId : string = "";
  isMyRoom : boolean;

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams,
    public api: Api, 
    public modalCtrl: ModalController, 
    public msg : MsgService, 
    public auth: AuthService,
    public menu: MenuController,
    public config: ConfigService) {

    this.menu.enable(true,'mainmenu');

    let userId = navParams.get('userId');

    if (!userId){
      userId = this.auth.getUserId();
    }
    
    this.roomUserId = userId;

    if (userId == this.auth.getUserId()){
      this.isMyRoom = true;
    }else{
      this.isMyRoom = false;
    }

    this.api.getCollections(userId);
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
    let addModal = this.modalCtrl.create('CollectionCreatePage');
    addModal.onDidDismiss(collection => {
      if (collection) {

        let newCollection = new Collection(collection);

        newCollection.sharedWithUsers = collection.sharedWithUsers;

        this.api.addCollection(newCollection).subscribe(
          (data) => {
            this.api.getCollections(this.auth.getUserId());
          },
          error => {
            this.api.handleAPIError(error);
          }
        );

      }
    })
    
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteCollection(collection: Collection, slidingItem) {

    this.api.deleteCollection(collection).subscribe(
      (data) => {
        this.api.getCollections(this.auth.getUserId());
      },
      error => {
        this.api.handleAPIError(error);
      }
    );
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

    this.navCtrl.push('ImgCollectionPage', {
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

  toNotification(){

    this.navCtrl.setRoot('NotificationsPage', {});

  }
  
}
