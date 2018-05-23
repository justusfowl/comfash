import { NgModule } from '@angular/core';
import { 
  SessionTileComponent
  } from './session-tile.component';

import { LongPressModule } from 'ionic-long-press';
import { IonicPageModule } from 'ionic-angular';

import { IonicImageViewerModule, ImageViewerComponent } from '../image-viewer/ionic-image-viewer';

import { VidIconModule } from '../vid-icon/vid-icon.module';

@NgModule({
  declarations: [
    SessionTileComponent
   ],
   imports : [
    IonicPageModule.forChild(SessionTileComponent),
    LongPressModule,
    IonicImageViewerModule,
    VidIconModule
   ],
  exports: [
    SessionTileComponent
  ],
  entryComponents:[
    ImageViewerComponent
  ]
})
export class SessionTileModule {}