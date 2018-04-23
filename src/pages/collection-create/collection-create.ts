import { Component, ViewChild } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';

import { Api, AuthService } from '../../providers/providers';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Collection } from '../../models/datamodel';


@IonicPage()
@Component({
  selector: 'page-collection-create',
  templateUrl: 'collection-create.html'
})
export class CollectionCreatePage {

  tmpSearchlist : any;
  searchTerm : string;

  privacyOptions = [
    {
      "option": "Unset",
      "value" : "0"
    },
    {
      "option": "Me",
      "value" : "1"
    },
    {
      "option": "Restricted",
      "value" : "2"
    },
    {
      "option": "Public",
      "value" : "3"
    },

  ]


  sharedWithUsers: any[] = [];

  privSelected : string = "0";

  newCollection : boolean = true;
  reallyDelete : boolean = false;

  collectionForm: FormGroup;

  collectionTemplate  = {
    collectionId : 0,
    collectionTitle : "",
    collectionDescription : "",
    sharedWithUsers : [], 
    privacyStatus : "2"
  };


  constructor(
    params: NavParams,
    public navCtrl: NavController, 
    public viewCtrl: ViewController, 
    private formBuilder: FormBuilder,
    public camera: Camera, 
    public api: Api, 
    public auth: AuthService) {

      let passedCollection = params.get('collection'); 

      let newTemplate = this.collectionTemplate; 

      this.collectionForm = this.formBuilder.group(newTemplate);

      if (passedCollection){

        this.newCollection = false;

        this.api.getCollectionDetails(passedCollection.collectionId).subscribe(
          (data) => {
            
            try{
              
              let tmpCollection = new Collection(data);
              this.privSelected = tmpCollection.privacyStatus;

              let newFormGroup = this.formBuilder.group(tmpCollection);


              this.collectionForm = newFormGroup
              console.log(newFormGroup)
              this.sharedWithUsers = data.sharedWithUsers;

              console.log("data here")
    
            }
            catch(err){
              console.log(err);
            } 
    
          },
          error => {
            this.api.handleAPIError(error);
          }
        )

    }


  }

  ionViewDidLoad() {

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

    let collection = new Collection(this.collectionForm.value);

    collection.sharedWithUsers = this.sharedWithUsers;

    this.viewCtrl.dismiss(collection);
  }


  public searchChanged(event) {

    let userSearch = this.searchTerm;

    if (userSearch.length >= 3){
      this.api.getUser(userSearch).subscribe(
        (data) => {
          
          try{
  
            this.tmpSearchlist = data;
            
          }
          catch(err){
            console.log(err);
            return null;
          } 
  
        },
        error => {
          this.api.handleAPIError(error);
        }
      )
    }

  }

  removeFriend(friend, index){
    this.sharedWithUsers.splice(index, 1);
  }

  addFriend(friend): void {
    this.sharedWithUsers.push(friend);
  }

  getIfCheckedHidden(friend){
    if(this.getIfActive(friend).active) {
      return false
    }else{
      return true;
    }
   
  }

  getIfActive(friend){

    let isActive = false;
    let j = -1;

    for (var i=0; i<this.sharedWithUsers.length; i++){
      if (this.sharedWithUsers[i].userName == friend.userName){
        isActive = true;
        j = i;
      }
    }

    return {
      active: isActive, 
      index: j};
  }

  toggleFriend(friend){
    let isActive = this.getIfActive(friend);

    if (isActive.active){
      this.removeFriend(friend, isActive.index)
    }else{
      this.addFriend(friend);
    }

  }

  saveCollection() {

    let collection = new Collection(this.collectionForm.value);

    collection.sharedWithUsers = this.sharedWithUsers; 

    if (this.newCollection){
      this.createCollection(collection);
    }else{
      this.updateCollection(collection)
    }

   
  }

  createCollection(collection){
    this.api.addCollection(collection).subscribe(
      (data) => {
        
        try{

          console.log("in save collection")
          this.viewCtrl.dismiss(collection);
          
        }
        catch(err){
          console.log(err);
          return null;
        } 

      },
      error => {
        this.api.handleAPIError(error);
      }
    )


  }

  updateCollection(collection){
    this.api.updateCollectionDetails(collection).subscribe(
      (data) => {
        
        try{

          console.log("in save collection")
          this.viewCtrl.dismiss(collection);
          
        }
        catch(err){
          console.log(err);
          return null;
        } 

      },
      error => {
        this.api.handleAPIError(error);
      }
    )
  }

  askDelete(){

    if (this.reallyDelete){
      this.reallyDelete = false;
    }else{
      this.reallyDelete = true;
    }
  }


  delete(){
    let collection = new Collection(this.collectionForm.value);
    
    this.api.deleteCollection(collection).subscribe(
      (data) => {
        
        try{

          console.log("deleted");
          this.viewCtrl.dismiss({"reponse" : true});
          
        }
        catch(err){
          console.log(err);
          return null;
        } 

      },
      error => {
        this.api.handleAPIError(error);
      }
    )
  }


}
