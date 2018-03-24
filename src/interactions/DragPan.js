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
    this.startCoordinates = this._map.getCoordinateFromPixel(this._map.getEventPixel(event));
    on(window.document, 'mousemove', this.handleMouseMove, this);
    on(window.document, 'mouseup', this.handleMouseUp, this);
    return !stopEvent;
  }

  handleMouseMove (event) {
    if (event.ctrlKey || event.button !== 0) return;
    if (this.draging) {
      const origin = this._map.getOrigin();
      const resolution = this._map.getResolution();
      const coordinates = this._map.getCoordinateFromPixel(this._map.getEventPixel(event));
      const newOrigin = [
        origin[0] - (coordinates[0] - this.startCoordinates[0]) * resolution,
        origin[1] + (coordinates[1] - this.startCoordinates[1]) * resolution
      ];
      this.startCoordinates = coordinates;
      this._map.renderer.setExtent([
        newOrigin[0],
        newOrigin[1] - resolution * this._map.getSize()[1],
        newOrigin[0] + resolution * this._map.getSize()[0],
        newOrigin[1]
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
