

import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { AuthService } from '../auth/auth';
import { PopoverController } from 'ionic-angular';
import { Complaint, Session } from '../../models/datamodel';
import { MsgService } from '../message/message';

@Injectable()
export class SettingHandlerService {

    constructor(
        private api: Api, 
        private auth : AuthService,
        private popoverCtrl : PopoverController, 
        private msg: MsgService
    ) {
       
    }

    showSettings(ev : any, item : any, objectType : string, options? : any){

        let self = this;
    
        let settings = this.popoverCtrl.create('SettingsPopoverPage', {
          "item" : item,
          "objectType" : objectType,
          "options": options
        }, {
            cssClass : "settings-popover"
        });

        //responseType = 1, complaint
        settings.onDidDismiss((responseType : number, responseObject: any) => {
           if (responseType == 1){

                let newComplaint = new Complaint(responseObject);
                self.api.reportComplaint(newComplaint).subscribe(
                    (response) => {

                        let u = response; 

                        self.msg.toast("RECEIVE_COMPLAINT", 2000);
                    },
                    error => {
                        self.msg.toastStdError();
                        console.log("error");
                        console.log(error)
                    }
                  )

           }
           else if (responseType == -1){           
            self.deleteComment(responseObject.mySession, responseObject.commentId, responseObject.comments, responseObject.selectedIndex)
            }
           else{
              console.log("response type other than 1")
           }
            
        });

        settings.present({
            ev: ev
        });

    }

    deleteComment(session : Session, commentId : number, commentArray, selectedIndex){

        this.api.deleteComment(session.getCollectionId(), session.getId(), commentId).subscribe(
          (data : any) => 
          {
            commentArray.splice(selectedIndex, 1);
  
          },
          error => {
            this.api.handleAPIError(error);
          }
        );
      }

}
