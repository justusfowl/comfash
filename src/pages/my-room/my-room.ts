import { Component, ApplicationRef } from '@angular/core';
import { IonicPage, ModalController, NavController, MenuController, NavParams } from 'ionic-angular';

import { Collection, User } from '../../models/datamodel';
import { Api, AuthService, MsgService, ConfigService, UtilService, LocalSessionsService } from '../../providers/providers';



@IonicPage({
  segment: "room/:userId"
})
@Component({
  selector: 'page-my-room',
  templateUrl: 'my-room.html'
})
export class MyRoomPage {
  roomUser : User;
  roomUserName : string = "";
  roomUserId : string = "";
  roomUserAvatarPath : string = "";
  isMyRoom : boolean;

  profileFixed : boolean = false;

  mySlideOptions = {
    pager:true
  };

  collections : any; 

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
    private appRef : ApplicationRef,
    private localSessions : LocalSessionsService) {

  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() { 

    this.localSessions.onLocalSessionAdded.subscribe(value => {
      self.loadRoom();
    });

    
    this.menu.enable(true,'mainmenu');

    let userId = this.navParams.get('userId');
    let self = this;

    if (!userId){
      userId = this.auth.getUserId();
    }
    
    this.loadUserBase(userId);

    if (userId == this.auth.getUserId()){
      this.isMyRoom = true;
    }else{
      this.isMyRoom = false;
    } 

    this.loadRoom();

  }

  loadRoom(refresher? : any){
    let userId = this.roomUserId;
    let self = this;

    this.api.loadRoom(userId).subscribe(
      (data : Collection[]) => {

        let outData = data.map(function(val){

          let tmpCollection = new Collection(val);
          tmpCollection.castSessions();

          return tmpCollection;

        }); 


        this.collections = outData;

        if (refresher){
          refresher.complete();
        }

      },
      error => {
        this.api.handleAPIError(error);
      }
    );

  }


  onContentScroll(evt){

    /*
    let scrollTop = evt.scrollTop;
    let profileArea = document.getElementById("profile-area");
    
    if (scrollTop > (profileArea.clientHeight / 2)){
      this.profileFixed = true;
    }else{
      this.profileFixed = false;
    }
    this.appRef.tick();
  */
  }

  loadUserBase(userId) {
    this.roomUserId = userId; 
    this.api.getUserProfileBase(userId).subscribe(
      (data : User) => {
        let user = new User(data);
        this.roomUser = user;
        this.roomUserName = user.getUserName();
        this.roomUserAvatarPath = user.getUserAvatarPath();
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

        this.loadRoom();

      }
    })
    
    addModal.present();
  }

  itemSettings(collection : Collection) {
    

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
    this.takePictureToCollection();
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

    let resultAction = function (){ this.loadRoom()};

    this.localSessions.captureCameraPicture(collectionId, this.navCtrl, resultAction.bind(this));

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
