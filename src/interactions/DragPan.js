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
     * start pixel
     * @type {Array}
     */
    this.startPixel = [];

    /**
     * type
     * @type {string}
     * @private
     */
    this._type = 'DragPan';
  }

  mounted () {
    const viewport = this.getMap().getViewport();
    on(viewport, 'mousedown', this.handleEvent, this);
  }

  destroyed () {
    const viewport = this.getMap().getViewport();
    off(viewport, 'mousedown', this.handleEvent, this);
  }

  handleEvent (event) {
    if (!this.getActive()) return;
    let stopEvent = false;
    this.draging = true;
    this.startPixel = this.getMap().getEventPixel(event);
    on(window.document, 'mousemove', this.handleMouseMove, this);
    on(window.document, 'mouseup', this.handleMouseUp, this);
    return !stopEvent;
  }

  handleMouseMove (event) {
    if (event.ctrlKey || event.button !== 0) return;
    if (this.draging) {
      const pixel = this.getMap().getEventPixel(event);
      let _offset = [
        pixel[0] - this.startPixel[0],
        pixel[1] - this.startPixel[1]
      ];
      const center = this.getMap().getCenter();
      const centerPixel = this.getMap().getPixelFromCoordinate(center);
      this.startPixel = pixel;
      this.getMap().setCenter(this.getMap().getCoordinateFromPixel([
        centerPixel[0] - _offset[0],
        centerPixel[1] - _offset[1]
      ]));
    }
  }

  handleMouseUp (event) {
    this.draging = false;
    off(window.document, 'mousemove', this.handleMouseMove, this);
    off(window.document, 'mouseup', this.handleMouseUp, this);
  }
}

export default DragPan
