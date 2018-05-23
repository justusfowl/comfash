import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the TagPreviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tag-preview',
  templateUrl: 'tag-preview.html',
})
export class TagPreviewPage {

  myTag : any;

  constructor(
      private navParams: NavParams, 
      private viewCtrl: ViewController) {

      this.myTag = navParams.get('tag');


  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad ReactionsPage');

  }

  openUrl(){
      window.open(this.myTag.tagUrl, '_system', 'location=yes')
  }

  


}
