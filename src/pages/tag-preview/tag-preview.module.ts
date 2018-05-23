import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TagPreviewPage } from './tag-preview';

@NgModule({
  declarations: [
    TagPreviewPage,
  ],
  imports: [
    IonicPageModule.forChild(TagPreviewPage),
  ],
})
export class TagPreviewPageModule {}
