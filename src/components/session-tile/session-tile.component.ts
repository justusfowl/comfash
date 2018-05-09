import { Input, Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Session } from '../../models/datamodel';
import { Api, AuthService, UtilService, VoteHandlerService, LocalSessionsService } from '../../providers/providers';

@Component({
  selector: 'session-tile',
  templateUrl: 'session-tile.component.html'
})
export class SessionTileComponent {
  
    @Input()
    session: Session;
    
    @Input()
    index: any;

    @Output()
    onSessionDeleteClick = new EventEmitter<any>();

    constructor(
        public navCtrl: NavController,
        public util : UtilService, 
        public auth : AuthService, 
        public api : Api, 
        public voteHdl : VoteHandlerService, 
        public localSessionSrv : LocalSessionsService
    ) {
    }

    getItemSessionPath(session : Session){
        if (this.session.flagIsTmp){
            try{
                let resource = session.sessionItemPath;
            
                if (resource.substring(0,4) != "data"){
                  resource = "data:*/*;base64," + resource;
                }
              
                return this.util.sanitizeResource(resource);
              }catch(err){
                return null;
              }
        }else{
            return this.util.wrapHostBase(session.sessionItemPath);
        }
        
    }

    selectCompareSession(session: Session){

        if (session.flagIsTmp){
            this.localSessionSrv.toggleCompareSession(session);
        }else{
            this.api.toggleCompareSession(session);
        }
        
    }
    

    isCompared(session : Session){
        let isActive = false;

        if (session.flagIsTmp){
            if (this.localSessionSrv.compareLocalSessionIds.indexOf(session.getId()) != -1){
                isActive = true;
            }
        }else{
            if (this.api.compareSessionIds.indexOf(session.getId()) != -1){
                isActive = true;
            }
        }
        return isActive;
    }

    deleteSession(session: Session){
        console.log("delete clicked in imgcollection")

        this.onSessionDeleteClick.emit(session);
    }

}
