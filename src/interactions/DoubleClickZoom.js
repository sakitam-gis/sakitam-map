import Base from './Base';
import { on, off, preventDefault } from '../utils';

class DoubleClickZoom extends Base {
  constructor (options = {}) {
    super(options);
    this._active = options.hasOwnProperty('active') ? options['active'] : true;

    /**
     * start coordinates
     * @type {Array}
     */
    this.startCoordinates = [];

    /**
     * type
     * @type {string}
     * @private
     */
    this._type = 'DoubleClickZoom';
  }

  mounted () {
    const viewport = this.getMap().getViewport();
    on(viewport, 'dblclick', this.handleEvent, this);
  }

  destroyed () {
    const viewport = this.getMap().getViewport();
    off(viewport, 'dblclick', this.handleEvent, this);
  }

  handleEvent (event) {
    if (!this.getActive()) return false;
    const _map = this.getMap();
    if (!_map) return false;
    preventDefault(event);
    const lastZoom = _map.getZoom()
    let nextZoom = lastZoom + 1;
    const size = _map.getSize();
    const center = _map.getCenter();
    const resolution = _map.getResolution();
    const resolutions = _map.getResolutions();
    nextZoom = nextZoom >= (resolutions.length - 1) ? (resolutions.length - 1) : (nextZoom <= 0 ? 0 : nextZoom);
    if (nextZoom === lastZoom) {
      return false;
    }
    const pixel = _map.getEventPixel(event);
    const coordinates = _map.getCoordinateFromPixel(pixel);
    let newResolution = _map._getNearestResolution(lastZoom, nextZoom, (nextZoom < lastZoom));
    newResolution = newResolution >= _map.maxResolution ? _map.maxResolution : (newResolution <= _map.minResolution ? _map.minResolution : newResolution);
    const scale = newResolution / resolution;
    _map.animate({
      center: [
        coordinates[0] + (center[0] - coordinates[0]) * scale,
        coordinates[1] + (center[1] - coordinates[1]) * scale
      ],
      zoom: nextZoom,
      origin: [size[0] / 2, size[1] / 2]
    });
  }
}

export default DoubleClickZoom
