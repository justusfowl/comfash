import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { Api, VoteHandlerService } from '../../providers/providers';
 
@IonicPage()
@Component({
  selector: 'page-reactions',
  templateUrl: 'reactions.html',
})
export class ReactionsPage {

    hasVote : boolean = false;
    myVoteType : number;
 
    constructor(
        private navParams: NavParams, 
        private viewCtrl: ViewController,
        public voteHdl: VoteHandlerService) {


        let hasVote  = navParams.get('hasVote');
        this.hasVote = hasVote;

        let myVoteType  = navParams.get('myVoteType');
        this.myVoteType = myVoteType;
 
    }
 
    ionViewDidLoad() {
        console.log('ionViewDidLoad ReactionsPage');

    }
 
    share(voteType){

        this.viewCtrl.dismiss(voteType);
    }

    unvote(){

        // unvote = voteType = 0
        this.viewCtrl.dismiss(-1);
    }
 
}