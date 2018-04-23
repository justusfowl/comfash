import { NgModule } from '@angular/core';
import { 
    DynamicSessionItemComponent, 
    SessionItemComponentImage,
    SessionItemComponentUnknown,
    SessionItemComponentVideo 
  } from './session-item.component';

import { LongPressModule } from 'ionic-long-press';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    DynamicSessionItemComponent, 
    SessionItemComponentImage,
    SessionItemComponentUnknown,
    SessionItemComponentVideo 
   ],
   imports : [
    IonicPageModule.forChild(DynamicSessionItemComponent),
    LongPressModule
   ],
  exports: [
    DynamicSessionItemComponent, 
    SessionItemComponentImage,
    SessionItemComponentUnknown,
    SessionItemComponentVideo
  ],
  entryComponents:[
    SessionItemComponentImage,
    SessionItemComponentUnknown,
    SessionItemComponentVideo 
  ]
})
export class DynamicSessionItemModule {}