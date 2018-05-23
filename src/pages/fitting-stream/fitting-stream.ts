import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, Content} from 'ionic-angular';
import { Api, ConfigService, UtilService, MsgService, VoteHandlerService, AuthService } from '../../providers/providers';
import { TranslateService } from '@ngx-translate/core';
import { TrendItem, Session } from '../../models/datamodel';

@IonicPage()

@Component({
  selector: 'page-fitting-stream',
  templateUrl: 'fitting-stream.html'
})


export class FittingStreamPage {

  @ViewChild(Content)
  content : Content;

  streamOptions = {
    limit : 3, 
    skip : 0
  }

  visibleIndex : number = 0;
  programScrolling : boolean = false;

  isLoading : boolean = false;


  touches = {
		"touchstart": {"x":-1, "y":-1, "target" : ""}, 
    "touchmove" : {"x":-1, "y":-1}, 
    "touchend" : {"x":-1, "y":-1, "isEnd" : false}, 
    "directionX" : "undetermined",
    "directionY" : "undetermined"
  }
  
  constructor(
    private translate: TranslateService, 
    public navCtrl: NavController, 
    public api: Api, 
    public config: ConfigService,
    public auth : AuthService,
    public util : UtilService, 
    private voteHdl : VoteHandlerService,
    public msg: MsgService) {

    
  }

  ionViewWillEnter() {
    this.auth.validateAuth(this.navCtrl)
  }



  ngAfterViewInit(){

    this.getTrendStream(null, true);

  }

  swipeUp(events){
    this.handleScrollEnd(true)
  }

  swipeDown(events){
    this.handleScrollEnd(false)
  }



  
  resetStreamOptions(){
    this.streamOptions = {
      limit : 3, 
      skip : 0
    };
  }



  getTrendStream (refresher? : any, reloadBeginning = false){

    let comp = this;  

    console.log("calling the api with the following options:")
    console.log(this.streamOptions);

    if (reloadBeginning){
      this.resetStreamOptions();
    }

    this.api.getTrendStream(this.streamOptions).subscribe(
      (trendStream : Array<TrendItem>) => {

          if (reloadBeginning){

            comp.api.streamItems.length = 0;

            trendStream.map(element => {
              
              let item = new TrendItem(element);
              comp.api.streamItems.push(item)

            });

          }else{
            comp.api.streamItems = comp.api.streamItems.concat(trendStream.map(element => new TrendItem(element)));
          }

          console.log(comp.api.streamItems)
          
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

  setVisibleItem(index){
    this.visibleIndex = index;
  }

  onVoteClick(voteType: number, session: Session){
      this.voteHdl.handleVoteClicked(voteType, session);
  }

  showReactions(ev: any, trendItem : TrendItem){

    this.voteHdl.showReactions(ev, trendItem);

  }

  checkIfVisible(bounding){
    if ( bounding.top >= 0 && bounding.left >= 0 && bounding.right <= (window.innerWidth || document.documentElement.clientWidth) && 
    bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)){

      return true;
    }else{
      return false;
    }
  }

  handleScrollEnd(isUp = true){

      if (isUp){
      
        if (this.visibleIndex < this.api.streamItems.length){

          if (this.visibleIndex + 4 > this.api.streamItems.length){
            this.infiniteScroll(null);
          }

          this.visibleIndex++;
        }
      
      }else{

          if (this.visibleIndex > 0){
            this.visibleIndex--;
          }else{
            this.resetStreamOptions();
            this.getTrendStream(null, true);
          }

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
