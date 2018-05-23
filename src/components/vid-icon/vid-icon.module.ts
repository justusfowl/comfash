import { NgModule } from '@angular/core';
import { 
  VidIconComponent
  } from './vid-icon';


import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    VidIconComponent
   ],
   imports : [
    IonicPageModule.forChild(VidIconComponent)
   ],
  exports: [
    VidIconComponent
  ]
})
export class VidIconModule {}