import { NgModule } from '@angular/core';
import { 
    DynamicActivityItemComponent, 
    VoteSessionItemComponentActivity,
    CommentSessionItemComponentActivity,
    SessionItemComponentUnknown
  } from './activity-item.component';

import { LongPressModule } from 'ionic-long-press';
import { IonicPageModule } from 'ionic-angular';
import { LinkUsernameModule } from "../link-username/link-username.module";
import { LinkCollectionModule } from '../link-collection/link-collection.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    DynamicActivityItemComponent, 
    VoteSessionItemComponentActivity,
    CommentSessionItemComponentActivity,
    SessionItemComponentUnknown
   ],
   imports : [
    IonicPageModule.forChild(DynamicActivityItemComponent),
    TranslateModule.forChild(),
    LongPressModule, 
    LinkUsernameModule,
    LinkCollectionModule
   ],
  exports: [
    DynamicActivityItemComponent, 
    VoteSessionItemComponentActivity,
    CommentSessionItemComponentActivity,
    SessionItemComponentUnknown
  ],
  entryComponents:[
    VoteSessionItemComponentActivity,
    CommentSessionItemComponentActivity,
    SessionItemComponentUnknown
  ]
})
export class DynamicActivityItemModule {}