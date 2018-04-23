import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, MenuController, NavParams } from 'ionic-angular';

import { Collection } from '../../models/datamodel';
import { Api, AuthService, MsgService, ConfigService, UtilService, LocalSessionsService } from '../../providers/providers';



@IonicPage({
  segment: "room/:userId"
})
@Component({
  selector: 'page-my-room',
  templateUrl: 'my-room.html'
})
export class MyRoomPage {
  roomUserName : string = "";
  roomUserId : string = "";
  isMyRoom : boolean;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public api: Api, 
    public modalCtrl: ModalController, 
    public msg : MsgService, 
    public auth: AuthService,
    public menu: MenuController,
    public config: ConfigService, 
    public util : UtilService, 
    private localSessions : LocalSessionsService) {

  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() { 
    
    this.menu.enable(true,'mainmenu');

    let userId = this.navParams.get('userId');

    if (!userId){
      userId = this.auth.getUserId();
    }
    
    this.loadUserBase(userId);

    if (userId == this.auth.getUserId()){
      this.isMyRoom = true;
    }else{
      this.isMyRoom = false;
    }

    this.api.getCollections(userId);
  }

  loadUserBase(userId) {
    this.roomUserId = userId; 
    this.api.getUserProfileBase(userId).subscribe(
      (data : any) => {
        this.roomUserName = data.userName;
      },
      error => {
        this.api.handleAPIError(error);
      }
    );
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('CollectionCreatePage');
    addModal.onDidDismiss(collection => {
      if (collection) {

        this.api.getCollections(this.auth.getUserId());

      }
    })
    
    addModal.present();
  }

  itemSettings(collection : Collection, slidingItem) {
    
    slidingItem.close();

    let addModal = this.modalCtrl.create('CollectionCreatePage', {"collection": collection})  ;
    addModal.onDidDismiss(collection => {
      if (collection) {

        this.api.getCollections(this.auth.getUserId());

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

  takePictureToCollection(){

    let collectionId = this.api.getSelectedCollectionId().selectedId; 

    this.localSessions.captureCameraPicture(collectionId);

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
