import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ImgCollectionPage } from './imgCollection';

@NgModule({
  declarations: [
    ImgCollectionPage,
  ],
  imports: [
    IonicPageModule.forChild(ImgCollectionPage),
    TranslateModule.forChild()
  ],
  exports: [
    ImgCollectionPage
  ]
}) 
export class ImgCollectionPageModule { }
