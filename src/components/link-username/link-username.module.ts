import { NgModule } from '@angular/core';
import { 
    LinkUsernameComponent
  } from './link-username.component';

import { LongPressModule } from 'ionic-long-press';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    LinkUsernameComponent
   ],
   imports : [
    IonicPageModule.forChild(LinkUsernameComponent)
   ],
  exports: [
    LinkUsernameComponent
  ]
})
export class LinkUsernameModule {}