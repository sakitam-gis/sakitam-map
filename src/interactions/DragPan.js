import Base from './Base';
import { on, off } from '../utils';

class DragPan extends Base {
  constructor (options = {}) {
    super(options);
    this._active = options.hasOwnProperty('active') ? options['active'] : true;

    /**
     * is draging
     * @type {boolean}
     */
    this.draging = false;

    /**
     * start coordinates
     * @type {Array}
     */
    this.startCoordinates = [];
  }

  handleEvent (event) {
    let stopEvent = false;
    this.draging = true;
    this.startCoordinates = this.getMap().getCoordinateFromPixel(this.getMap().getEventPixel(event));
    on(window.document, 'mousemove', this.handleMouseMove, this);
    on(window.document, 'mouseup', this.handleMouseUp, this);
    return !stopEvent;
  }

  handleMouseMove (event) {
    if (event.ctrlKey || event.button !== 0) return;
    if (this.draging) {
      const coordinates = this.getMap().getCoordinateFromPixel(this.getMap().getEventPixel(event));
      let _offset = [
        coordinates[0] - this.startCoordinates[0],
        coordinates[1] - this.startCoordinates[1]
      ];
      const center = this.getMap().getCenter();
      this.startCoordinates = coordinates;
      this.getMap().setCenter([
        center[0] - _offset[0],
        center[1] - _offset[1]
      ]);
    }
  }

  handleMouseUp (event) {
    this.draging = false;
    off(window.document, 'mousemove', this.handleMouseMove, this);
    off(window.document, 'mouseup', this.handleMouseUp, this);
  }
}

export default DragPan
