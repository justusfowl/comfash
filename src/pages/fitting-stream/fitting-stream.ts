import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController} from 'ionic-angular';
import { Api, ConfigService, UtilService, AuthService } from '../../providers/providers';
import { TranslateService } from '@ngx-translate/core';
import { TrendItem, Vote } from '../../models/datamodel';

@IonicPage()

@Component({
  selector: 'page-fitting-stream',
  templateUrl: 'fitting-stream.html'
})

export class FittingStreamPage {


  streamOptions = {
    limit : 3, 
    skip : 0
  }



  constructor(
    private translate: TranslateService, 
    public navCtrl: NavController, 
    public api: Api, 
    public config: ConfigService, 
    public util : UtilService, 
    private popoverCtrl: PopoverController, 
    private auth : AuthService) {

    this.getTrendStream();

 



  }

  getTrendStream (refresher? : any){

    let comp = this; 

    this.api.getTrendStream(this.streamOptions).subscribe(
      (trendStream : Array<TrendItem>) => {

          comp.api.streamItems = comp.api.streamItems.concat(trendStream.map(element => new TrendItem(element)));

          if (refresher){
            refresher.complete();
          }
          
      },
      error => {
        console.log("error");
        console.log(error)
      }
    );
  }

  infiniteScroll(scroller){

    this.streamOptions.skip += 3;

    this.getTrendStream(scroller);

  } 

  showReactions(ev: any, trendItem : TrendItem){

    let hasVote = false;
    if (trendItem.myVoteType){
      hasVote = true;
    }
 
      let reactions = this.popoverCtrl.create('ReactionsPage', {
        "hasVote" : hasVote
      });

      reactions.onDidDismiss((voteType : number) => {
        if (voteType) {

          let vote = new Vote({
            sessionId : trendItem.getSessionId(), 
            voteType : voteType, 
            userId : this.auth.getUserId()
          });

          trendItem.myVoteType = voteType;

          this.api.upsertVote(trendItem.getCollectionId(), trendItem.getSessionId(), vote)
  
        }else{
          // unvote = voteType = 0
  
          this.api.deleteVote(trendItem.getCollectionId(), trendItem.getSessionId()).subscribe( data => {
            trendItem.myVoteType = null;
          })
  
          // this.api.unvote();
        }
      })

      reactions.present({
          ev: ev
      });

  }

  like(){
      console.log("like");
  }


  openItem(item) {

    this.navCtrl.setRoot('ImgCollectionPage', {
      collectionId : item.collectionId
    });
  }

  checkIfVisible(bounding){
    if ( bounding.top >= 0 && bounding.left >= 0 && bounding.right <= (window.innerWidth || document.documentElement.clientWidth) && 
    bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)){

      return true;
    }else{
      return false;
    }
  }

  checkForViewPort(){

    var videoContainers : any = document.getElementsByClassName('session-tile-content');
    let comp = this; 

    Array.prototype.forEach.call(videoContainers, function (el, i){

      let video = el.getElementsByTagName("video")[0];

      var bounding = el.getBoundingClientRect();

      let isVisible = comp.checkIfVisible(bounding);

      if (isVisible){
        video.play();
      }else{
        video.pause();
      }

    })


  }

  handleScroll($event){

    if (this.config.autoPlayStream){
      this.checkForViewPort();
    }
    
  }

  getTitleMessage(item){

    let msg; 

    switch(item.itemType) {
      case 1:
          msg = this.translate.instant('HAS_VOTED');
          break;
      case 2:
          msg = this.translate.instant('HAS_REACTED_TO');
          break;
      default:
        msg = this.translate.instant('HAS_REACTED_TO');
    }

    return msg;

  }

  goToItemCreator(item: TrendItem){
    this.navCtrl.push('MyRoomPage', {
      userId : item.getItemCreatorId()
    });
  }

  goToColOwner(item: TrendItem){
    this.navCtrl.push('MyRoomPage', {
      userId : item.getItemOwnerId()
    });
  }

  goToImgCollection(item: TrendItem){
    this.navCtrl.push('ImgCollectionPage', {
      collectionId : item.getCollectionId()
    });
  }

  goToSessionCompare(item: TrendItem){
    this.navCtrl.push('ContentPage', {
      collectionId : item.getCollectionId(),
      compareSessionIds: [item.getSessionId()]
    });

  }

}
