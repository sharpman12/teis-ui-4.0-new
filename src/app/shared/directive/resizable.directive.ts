import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';

@Directive({
  selector: '[appResizable]',
})
export class ResizableDirective implements OnInit, OnDestroy {
  @Input() resizableGrabWidth = 8;
  @Input() resizableMinWidth = 100;
  dragging = false;

  private mouseMoveListener: () => void;
  private mouseUpListener: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'border-right',
      `${this.resizableGrabWidth}px solid transparent`
    );
  }

  ngOnDestroy() {
    this.removeGlobalEventListeners();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.inDragRegion(event)) {
      this.dragging = true;
      this.preventGlobalMouseEvents();

      // Add mousemove and mouseup listeners
      this.mouseMoveListener = this.renderer.listen(
        'document',
        'mousemove',
        this.onMouseMove.bind(this)
      );
      this.mouseUpListener = this.renderer.listen(
        'document',
        'mouseup',
        this.onMouseUp.bind(this)
      );
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.dragging) {
      this.resize(event);
    } else {
      if (this.inDragRegion(event)) {
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'col-resize');
      } else {
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'default');
      }
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.dragging) {
      this.dragging = false;
      this.restoreGlobalMouseEvents();
      this.removeGlobalEventListeners();
    }
  }

  private resize(event: MouseEvent) {
    const leftSection = this.el.nativeElement.previousElementSibling;
    const rightSection = this.el.nativeElement.nextElementSibling;

    const containerOffsetLeft =
      this.el.nativeElement.parentElement.getBoundingClientRect().left;

    const pointerRelativeXpos = event.clientX - containerOffsetLeft;
    const newLeftWidth = pointerRelativeXpos;

    // Apply the new width to the left section
    if (newLeftWidth > this.resizableMinWidth) {
      this.renderer.setStyle(leftSection, 'flex-basis', `${newLeftWidth}px`);
    }
  }

  private preventGlobalMouseEvents() {
    this.renderer.setStyle(document.body, 'pointer-events', 'none');
  }

  private restoreGlobalMouseEvents() {
    this.renderer.setStyle(document.body, 'pointer-events', 'auto');
  }

  private removeGlobalEventListeners() {
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
      this.mouseMoveListener = null;
    }
    if (this.mouseUpListener) {
      this.mouseUpListener();
      this.mouseUpListener = null;
    }
  }

  private inDragRegion(evt: MouseEvent): boolean {
    const rect = this.el.nativeElement.getBoundingClientRect();
    return (
      evt.clientX >= rect.left &&
      evt.clientX <= rect.right &&
      evt.clientY >= rect.top &&
      evt.clientY <= rect.bottom
    );
  }
}