import { Component, Sanitizer } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { DomSanitizer } from "@angular/platform-browser";

import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Collection, Session, Image, Comment } from '../../models/datamodel';

import { Api } from '../../providers/providers';


@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html', 
  providers: [
    ScreenOrientation
  ]
})
export class ContentPage {

  compareItems : Session[] = [];
  footerHangers = [];
  imgNumber = 1; 
  testText = "";
  
  comments = [{
    "y" : 20, 
    "x" : 30, 
    "text" : "Dies ist ein Test"
  }];

  lastPressedX : any; 
  lastPressedY: any; 

  selectedIndex = 0; 
  collection : Collection; 

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    private screenOrientation: ScreenOrientation, 
    public modalCtrl: ModalController, 
    private api : Api, 
    public sanitizer : Sanitizer) {

    this.compareItems.length = 0; 

    // screen orientation not available on ionicDev
    //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    let tmpcollection = navParams.get('collection');

    this.compareItems = tmpcollection.getCompareSessions();

    console.log(this.compareItems)

    this.calculateFooterHangers();

   } 

   active(e){
    this.testText = 'active'; 
    console.log("active")
    //console.log(e);
   }

   pressed(e, session : Session){

    this.testText = 'pressed'; 
    console.log("pressed")
    console.log(e);

    

    let coords = e.center; 
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
     
      /*
      if (item) {
        this.item.items.add(item);
      }

     let tmpItem = {
        "text" : item.name,
        "x" : coords.x, 
        "y" : coords.y
      };
      */

    let tmpItem = new Comment({
      commentText : item.name
    });
      
     let selectedImg = this.getImgFromSession(session);
     
     let viewPort = document.getElementById('row-compare-items');

      tmpItem.calculateRatioFromCoords(coords,viewPort,selectedImg);

      console.log(tmpItem)

      selectedImg.addComment(tmpItem)
    })
    addModal.present();
   }

   getImgFromSession(session: Session){

    let sessionIndex = session.getImgIndexFromPercent(this.imgNumber); 
    return session.images[sessionIndex]
   }

   getImgPath(session: Session){

     try{
      return this.getImgFromSession(session).path;
     }catch(err){
       console.log(err); 
       return "";
     }
    
   }


  getImgComment(session: Session){

    try{
      return this.getImgFromSession(session).getComments();
     }catch(err){
       console.log(err); 
       return "";
     }

  }

  calculateFooterHangers(){

    let tmpArray = []; 

    for (var session of this.compareItems){

      session.images.map(function(element, index){
        if (element.comments.length > 0){

          let prc = Math.round((index/session.images.length) * 100);

          tmpArray.push({
            index: index, 
            orderPrc : prc > 95 ? 95 : prc < 5 ? 5 : prc
          });
        };
      })
    }
    return tmpArray;
  }
   

   released(e){
    this.testText = 'released'; 
     console.log("released");
     //console.log(e);
   }

   navBack(){
      this.navCtrl.pop();
   }

}
