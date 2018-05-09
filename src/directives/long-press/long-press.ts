import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, NgZone } from '@angular/core';
import { Gesture } from 'ionic-angular/gestures/gesture';

@Directive({
    selector: '[longPress]'
})
export class LongPressDirective implements OnInit, OnDestroy {

    @Input() interval: number;

    @Output() onPressStart: EventEmitter<any> = new EventEmitter();
    @Output() onPressing: EventEmitter<any> = new EventEmitter();
    @Output() onPressEnd: EventEmitter<any> = new EventEmitter();

    el: HTMLElement;
    pressGesture: Gesture;

    int: number;

    constructor(
        public zone: NgZone,
        el: ElementRef
    ) {
        this.el = el.nativeElement;
    }

    ngOnInit() {
      if (!this.interval) this.interval = 500;
      if (this.interval < 40) {
          throw new Error('A limit of 40ms is imposed so you don\'t destroy device performance. If you need less than a 40ms interval, please file an issue explaining your use case.');
      }

      this.pressGesture = new Gesture(this.el);
      this.pressGesture.listen();
      this.pressGesture.on('press', (e: any) => {
          this.onPressStart.emit(e);
          this.clearInt();
          this.int = setInterval(() => {
              this.onPressing.emit();
          }, this.interval);
      });

      this.pressGesture.on('pressup', (e: any) => {
          this.pressEnd(e);
      });

      this.pressGesture.on('pan', (e: any) => {
          this.pressEnd(e);
      });

      this.pressGesture.on('release', (e: any) => {
          this.pressEnd(e);
      });

      this.el.addEventListener('mouseleave', (e: any) => {
          this.pressEnd(e);
      });

      this.el.addEventListener('mouseout', (e: any) => {
          this.pressEnd(e);
      });
  }

  clearInt() {
      if (this.int !== undefined) {
          clearInterval(this.int);
          this.int = undefined;
      }
  }

  pressEnd(evt? : any) {
      this.clearInt();
      this.onPressEnd.emit(evt);
  }

  ngOnDestroy() {
      this.pressEnd();
      this.pressGesture.destroy();
  }
}