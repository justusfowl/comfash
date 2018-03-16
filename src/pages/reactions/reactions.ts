import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from '../../providers/providers';
import { Vote } from '../../models/datamodel';
 
@IonicPage()
@Component({
  selector: 'page-reactions',
  templateUrl: 'reactions.html',
})
export class ReactionsPage {

    hasVote : boolean = false;
 
    constructor(
      private navCtrl: NavController, 
      private navParams: NavParams, 
      private viewCtrl: ViewController, 
      private api: Api) {


        let hasVote  = navParams.get('hasVote');
        this.hasVote = hasVote;
 
    }
 
    ionViewDidLoad() {
        console.log('ionViewDidLoad ReactionsPage');

    }
 
    share(voteType){

        this.viewCtrl.dismiss(voteType);
    }

    unvote(){

        // unvote = voteType = 0
        this.viewCtrl.dismiss(0);
    }
 
}