import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, PopoverController, Content, LoadingController} from 'ionic-angular';
import { Api, ConfigService, UtilService, AuthService, MsgService, VoteHandlerService } from '../../providers/providers';
import { TranslateService } from '@ngx-translate/core';
import { TrendItem, Vote, Session } from '../../models/datamodel';

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

  loader : any;

  touches = {
		"touchstart": {"x":-1, "y":-1, "target" : ""}, 
		"touchmove" : {"x":-1, "y":-1}, 
		"touchend"  : false,
    "directionX" : "undetermined",
    "directionY" : "undetermined"
  }
  
  constructor(
    private translate: TranslateService, 
    public navCtrl: NavController, 
    public api: Api, 
    public config: ConfigService, 
    public util : UtilService, 
    private popoverCtrl: PopoverController, 
    private auth : AuthService, 
    private voteHdl : VoteHandlerService, 
    public loadingCtrl : LoadingController,
    public msg: MsgService) {

    
    this.getTrendStream(null, true);


  }

  ngAfterViewInit(){


    document.addEventListener('touchstart', this.touchHandler.bind(this), false);	
		document.addEventListener('touchmove', this.touchHandler.bind(this), false);	
    document.addEventListener('touchend', this.touchHandler.bind(this), false);
    



  }

  touchHandler(event : any) {
    var touch;
    var target;
    let self = this;
		if (typeof event !== 'undefined'){	
			//event.preventDefault(); 
			if (typeof event.touches !== 'undefined') {
        touch = event.touches[0];
        


				switch (event.type) {
          case 'touchstart':
            try {
              target = touch.target.getAttribute("class");
            }catch(err){
              target = "";
            }

            self.touches[event.type].target = target;
            self.touches[event.type].x = touch.pageX;
            self.touches[event.type].y = touch.pageY;
            break;
					case 'touchmove':
            self.touches[event.type].x = touch.pageX;
            self.touches[event.type].y = touch.pageY;
						break;
					case 'touchend':
            self.touches[event.type] = true;

            if (self.touches.touchstart.target == "session-tile"){
              if (self.touches.touchstart.x > -1 && self.touches.touchmove.x > -1) {
                self.touches.directionX = self.touches.touchstart.x < self.touches.touchmove.x ? "right" : "left";
                
                // DO STUFF HERE
                console.log(self.touches.directionX);
              }
              
              if (self.touches.touchstart.y > -1 && self.touches.touchmove.y > -1) {
                self.touches.directionY = self.touches.touchstart.y < self.touches.touchmove.y ? "down" : "up";
                
                // DO STUFF HERE
                console.log(self.touches.directionY);
                self.handleScrollEnd(self.touches);
              }

              self.touches.touchstart.target = ""; 
            }

					default:
						break;
				}
			}
		}
  }
  

  getTrendStream (refresher? : any, reloadBeginning = false){

    let comp = this; 
    let loader;

    if (reloadBeginning){
      loader = this.msg.toastLoader();
    }

    this.api.getTrendStream(this.streamOptions).subscribe(
      (trendStream : Array<TrendItem>) => {

          if (reloadBeginning){
            comp.api.streamItems = trendStream.map(element => new TrendItem(element));
            loader.dismiss();

          }else{
            comp.api.streamItems = comp.api.streamItems.concat(trendStream.map(element => new TrendItem(element)));
          }
          
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

  presentLoader(){
    this.loader = this.loadingCtrl.create({
    });
    this.loader.present();
  }

  handleScrollEnd(event){

    console.log("in scrollend")
    console.log(JSON.stringify(event));

    if (!this.programScrolling){

      if (event.directionY == "up"){
      
        if (this.visibleIndex < this.api.streamItems.length){

          if (this.visibleIndex + 4 > this.api.streamItems.length){
            this.infiniteScroll(null)
          }
          this.visibleIndex++;
        }
      
    }else{
      console.log(this.visibleIndex);

        if (this.visibleIndex > 0){
          this.visibleIndex--;
        }else{
          this.getTrendStream(null, true);
        }

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
