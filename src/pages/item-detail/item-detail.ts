import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  selectedItems = {}; 

  constructor(public navCtrl: NavController, navParams: NavParams, public modalCtrl: ModalController) {

    let tmpItems = navParams.get('item');

    this.item = tmpItems;
  }

  selectPhoto(index){
    console.log(index);

    document.getElementById('flag-icon_'+index).classList.toggle("active");
    document.getElementById('flag_'+index).classList.toggle("active");


    if (typeof(this.selectedItems[index]) != 'undefined'){
      delete this.selectedItems[index]
    }else{
      this.selectedItems[index] = this.item.items[index];
    }

    console.log(this.selectedItems);
  }

  addItem() {

    this.navCtrl.push('CapturePage', {
      sessionId: "123123"
    });



    
  }

  compareItems(){
    this.navCtrl.push('ContentPage', {
      compareItems: this.selectedItems
    });
  }

}
