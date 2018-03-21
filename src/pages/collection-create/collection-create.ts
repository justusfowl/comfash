import { Component, ViewChild } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, ViewController } from 'ionic-angular';

import { Api, AuthService } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-collection-create',
  templateUrl: 'collection-create.html'
})
export class CollectionCreatePage {
  @ViewChild('fileInput') fileInput;


  userSearchList : any;
  userSearch : any;

  usersSelected : any = [];
  userIdsSelected : any = [];

  newCollectionTitle : string; 
  isPublic : boolean;

  constructor(public navCtrl: NavController, 
    public viewCtrl: ViewController, 
    public camera: Camera, 
    public api: Api, 
    public auth: AuthService) {

      this.newCollectionTitle = ""; 
      this.isPublic = false; 
      this.usersSelected.length = 0; 
      this.userIdsSelected.length = 0;

  }

  ionViewDidLoad() {

  }

  isReadyToSave(){
    if (this.newCollectionTitle.length > 0){
      return true; 
    }else{
      return false;
    }
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {

    let newCollection = {
      collectionTitle : this.newCollectionTitle, 
      sharedWithUsers : this.usersSelected, 
      isPublic : this.isPublic, 
      userId : this.auth.getUserId(),
      userName : this.auth.getUsername()
    }

    this.viewCtrl.dismiss(newCollection);
  }

  getUserSearch(event){

    let userSearch = this.userSearch;
    let comp = this;
    
    if (userSearch.length >= 3){
      this.api.getUser(userSearch).subscribe(users => {
        comp.userSearchList = users;
      }, 
      error => this.api.handleAPIError(error));
    }
  }

  removeUser(userId){
    let userIndex = this.userIdsSelected.indexOf(userId);
    this.usersSelected.splice(userIndex , 1);
      this.userIdsSelected.splice(userIndex , 1);
  }

  toggleUserInvite(user){
    let userIndex = this.userIdsSelected.indexOf(user.userId); 

    if ( userIndex == -1 ){
      this.usersSelected.push(user);
      this.userIdsSelected.push(user.userId);
    }else{
      this.usersSelected.splice(userIndex , 1);
      this.userIdsSelected.splice(userIndex , 1);
    }
  }

  checkIfUserIsSelected(user){
    let userIndex = this.userIdsSelected.indexOf(user.userId); 

    if ( userIndex == -1 ){
      return true;
    }else{
      false;
    }

  }
}
