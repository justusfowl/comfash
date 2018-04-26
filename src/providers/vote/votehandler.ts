

import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config';
import { DomSanitizer } from '@angular/platform-browser';
import { Api } from '../api/api';
import { Session, Vote } from '../../models/datamodel';
import { AuthService } from '../auth/auth';

@Injectable()
export class VoteHandlerService {



    constructor(
        private api: Api, 
        private auth : AuthService
    ) {
       
    }

    handleVoteClicked(voteType : number, session : Session){
      let hasMyVote = false;
      let myVoteType;
      let voteDiffers = true;

        if (voteType && voteType != 0) {

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
