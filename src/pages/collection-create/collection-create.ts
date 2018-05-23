import { Component, ViewChild, ElementRef } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, ViewController, NavParams, Content } from 'ionic-angular';

import { Api, AuthService, UtilService } from '../../providers/providers';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Collection, User } from '../../models/datamodel';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-collection-create',
  templateUrl: 'collection-create.html'
})
export class CollectionCreatePage {

  @ViewChild("searchList") searchList : ElementRef;

  @ViewChild(Content) content : Content;

  tmpSearchlist : any;
  searchTerm : string;

  privacyOptions = [

  ]


  sharedWithUsers: any[] = [];

  privSelected : string = "0";

  newCollection : boolean = true;
  reallyDelete : boolean = false;

  collectionForm: FormGroup;

  collectionTemplate  = {
    collectionId : 0,
    collectionTitle : new FormControl('', Validators.required),
    collectionDescription :  new FormControl(''),
    sharedWithUsers : [], 
    privacyStatus : "2"
  };

  isValid : boolean = false;

  invitePlaceholder : string = "";


  constructor(
    params: NavParams,
    public navCtrl: NavController, 
    public viewCtrl: ViewController, 
    private formBuilder: FormBuilder,
    public camera: Camera, 
    public api: Api,
    public util: UtilService,
    public auth: AuthService, 
    private translate : TranslateService
  ) {

      let passedCollection = params.get('collection'); 

      let newTemplate = this.collectionTemplate; 

      this.collectionForm = this.formBuilder.group(newTemplate);

      if (passedCollection){

        this.newCollection = false;

        this.api.getCollectionDetails(passedCollection.collectionId).subscribe(
          (data) => {
            
            try{

              this.isValid = true;
              
              let tmpCollection = new Collection(data);
              this.privSelected = tmpCollection.privacyStatus;

              let newFormGroup = this.formBuilder.group(tmpCollection);


              this.collectionForm = newFormGroup
              console.log(newFormGroup)
              this.sharedWithUsers = data.sharedWithUsers;
    
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

    translate.get(['PRIVACY_1', 'PRIVACY_2', 'PRIVACY_3', 'COLLECTION_INVITE']).subscribe(values => {

      this.privacyOptions.push({
        option: values['PRIVACY_1'], 
        value : 1
      });

      this.privacyOptions.push({
        option: values['PRIVACY_2'], 
        value : 2
      });

      this.privacyOptions.push({
        option: values['PRIVACY_3'], 
        value : 3
      });

      this.invitePlaceholder = values['COLLECTION_INVITE'];

    });


  }


  scrollToList(){
    let pos = this.searchList.nativeElement.getClientRects()[0];

    this.content.scrollTo(0, pos.y);
  }

  ionViewDidLoad() {
    
  }

  validateCollection(val){

    if (val.target.value != ""){
      this.isValid = true;
    }
    else{
      this.isValid = false;
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

    let collection = new Collection(this.collectionForm.value);

    collection.sharedWithUsers = this.sharedWithUsers;

    this.viewCtrl.dismiss(collection);
  }


  privacyChange(value) {
    this.privSelected = value;

    console.log(this.privSelected);
  }

  public searchChanged(event) {

    let userSearch = this.searchTerm;

    if (userSearch.length >= 3){
      this.api.getUser(userSearch).subscribe(
        (data : any) => {



          
          try{

            let outData = data.map(function(item){

              let friend = new User(item);
    
              return friend;
    
            }); 

            console.log(outData);
            this.tmpSearchlist = outData;
            this.scrollToList();
            
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

          console.log("in update collection")
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
