import { NgModule } from '@angular/core';
import { CommentGridDirective } from './comment-grid/comment-grid';
import { DragItemDirective } from './drag-item/drag-item';
@NgModule({
	declarations: [CommentGridDirective,
    DragItemDirective],
	imports: [],
	exports: [CommentGridDirective,
    DragItemDirective]
})
export class DirectivesModule {}
