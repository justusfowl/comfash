import { NgModule } from '@angular/core';
import { 
    LinkCollectionComponent
  } from './link-collection';

import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    LinkCollectionComponent
   ],
   imports : [
    IonicPageModule.forChild(LinkCollectionComponent)
   ],
  exports: [
    LinkCollectionComponent
  ]
})
export class LinkCollectionModule {}