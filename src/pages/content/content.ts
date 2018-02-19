import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { ScreenOrientation } from '@ionic-native/screen-orientation';

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html', 
  providers: [
    ScreenOrientation
  ]
})
export class ContentPage {

  compareItems = [];
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

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    private screenOrientation: ScreenOrientation, 
    public modalCtrl: ModalController) {

    this.compareItems.length = 0; 

    // screen orientation not available on ionicDev
    //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    let tmpItems = navParams.get('compareItems');

    for (var key in tmpItems){
      this.compareItems.push(tmpItems[key])
    }

    console.log(this.compareItems)

   } 

   active(e){
    this.testText = 'active'; 
    console.log("active")
    //console.log(e);
   }

   pressed(e){
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
      */

      let tmpItem = {
        "text" : item.name,
        "x" : coords.x, 
        "y" : coords.y
      };

      this.comments.push(tmpItem)
    })
    addModal.present();
   }
   getImg(item){
     console.log(JSON.stringify(item));
     try{
      return item.collection[(Math.ceil(item.collection.length * (this.imgNumber / 100)))].profilePic;
     }catch(err){
       console.log(err); 
       return "";
     }
    
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
