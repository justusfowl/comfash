import { Directive, ElementRef, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Gesture } from "ionic-angular/gestures/gesture";


/**
 * Generated class for the CommentGridDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[comment-grid]' // Attribute selector
})

  export class CommentGridDirective implements OnInit, OnDestroy {
    el: HTMLElement;
    pressGesture: Gesture;
    @Output('long-press') onPressRelease: EventEmitter<any> = new EventEmitter();

    constructor(el: ElementRef) {
      this.el = el.nativeElement;
    }
  
    public theCallback() {
  
    }
  
    ngOnInit() {
      this.pressGesture = new Gesture(this.el);
      this.pressGesture.listen();
  
      // instead of this..
      this.pressGesture.on('panmove', (event) => {
        this.onPressRelease.emit(event);
      });

      
  
      // i want the callback to come from the template like this:
      // <ion-col (longPress)="showActionSheet(object)">
    }
  
    ngOnDestroy() {
      this.pressGesture.destroy();
    }

  }