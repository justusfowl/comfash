import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SessionSettingsPage } from './session-settings';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SessionSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SessionSettingsPage),
    TranslateModule.forChild()
  ],
})
export class SessionSettingsPageModule {}
