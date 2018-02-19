import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { MyRoomPage } from './my-room';

@NgModule({
  declarations: [
    MyRoomPage,
  ],
  imports: [
    IonicPageModule.forChild(MyRoomPage),
    TranslateModule.forChild()
  ],
  exports: [
    MyRoomPage
  ]
})
export class MyRoomPageModule { }
