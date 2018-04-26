

import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config';
import { DomSanitizer } from '@angular/platform-browser';
import { Api } from '../api/api';
import { Session, Vote } from '../../models/datamodel';
import { AuthService } from '../auth/auth';
import { PopoverController } from 'ionic-angular';

@Injectable()
export class VoteHandlerService {



    constructor(
        private api: Api, 
        private auth : AuthService,
        private popoverCtrl : PopoverController
    ) {
       
    }
    /**
     * Show Reactions panel
     * @param ev Click event
     * @param session session item, can be both a Session or a TrendItem
     */
    showReactions(ev : any, session : any, cb? : any){

        let hasVote = false;
        let myVoteType; 
        let self = this;
        
        if (session.myVote){
          hasVote = true;
          myVoteType = session.getMyVoteType();
        }
    
        let reactions = this.popoverCtrl.create('ReactionsPage', {
          "hasVote" : hasVote,
          "myVoteType" : myVoteType
        });

        reactions.onDidDismiss((voteType : number) => {
           if (cb){
              cb(voteType);
           }else{
              self.handleVoteClicked(voteType, session);
           }
            
        });

        reactions.present({
            ev: ev
        });


    }

    handleVoteClicked(voteType : number, session : Session){
      let hasMyVote = false;
      let myVoteType;
      let voteDiffers = true;

      // do not do anything if user clicked outside of reaction page
      if (voteType){

        // votetype = 0 -> delete previous vote 
        if (voteType != 0) {

          if (session.myVote){
            hasMyVote = true;
            myVoteType = session.myVote.getVoteType();

            if (voteType == myVoteType){
              voteDiffers = false;
            }
          }
      
          // if there has not been a vote by the user or he changed the vote then proceed and upload
          if (voteDiffers){

              let vote = new Vote({
                sessionId : session.getId(), 
                voteType : voteType, 
                userId : this.auth.getUserId()
              });
        
              if (session.myVote){
                session.myVote.voteType = voteType;
              }else{
                session.setMyVote(vote);
              }
              
              this.api.upsertVote(session.getCollectionId(), session.getId(), vote);
          }
      
        }else{
          // unvote = voteType = 0
    
          this.api.deleteVote(session.getCollectionId(), session.getId()).subscribe( data => {
            session.removeMyVote();
          })
    
          // this.api.unvote();
        }
      }
 
    }

    getVoteIcon(session : Session){

      let iconName;
      let myVoteType = session.getMyVoteType();

      switch(myVoteType) {
        case -50:
            iconName = "thumbs-down";
            break;
        case 0:
            iconName = "sad";
            break;
        case 75:
            iconName = "thumbs-up";
            break;
        case 100:
            iconName = "heart";
            break;
        default:
            iconName = "ios-thumbs-up-outline";
      }

      return iconName;

    }



    


}
