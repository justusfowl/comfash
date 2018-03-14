import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Api, ConfigService, UtilService } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-cards',
  templateUrl: 'cards.html'
})
export class CardsPage {

  options = {
    limit : 10, 
    skip : 0
  }

  constructor(public navCtrl: NavController, public api: Api, public config: ConfigService, public util : UtilService) {

    this.api.getTrendStream(this.options);

  }



  openItem(item) {

    this.navCtrl.setRoot('ImgCollectionPage', {
      collectionId : item.collectionId
    });
  }

}
