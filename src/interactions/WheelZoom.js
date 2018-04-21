import Base from './Base';
import {off, on, preventDefault} from '../utils';

class WheelZoom extends Base {
  constructor (options = {}) {
    super(options);
    this._active = options.hasOwnProperty('active') ? options['active'] : true;

    /**
     * type
     * @type {string}
     * @private
     */
    this._type = 'WheelZoom';
  }

  mounted () {
    const viewport = this.getMap().getViewport();
    on(viewport, 'wheel', this.handleEvent, this);
    on(viewport, 'mousewheel', this.handleEvent, this);
  }

  destroyed () {
    const viewport = this.getMap().getViewport();
    off(viewport, 'wheel', this.handleEvent, this);
    off(viewport, 'mousewheel', this.handleEvent, this);
  }

  /**
   * handle wheel event
   * @param event
   * @returns {boolean}
   */
  handleEvent (event) {
    const type = event.type;
    const _map = this.getMap();
    if (!_map) return false;
    if (type !== 'wheel' && type !== 'mousewheel') {
      return true;
    }
    preventDefault(event);
    let levelValue = (event.wheelDelta ? event.wheelDelta : event.detail) > 0 ? 1 : -1;
    const lastZoom = _map.getZoom()
    let nextZoom = lastZoom + levelValue;
    const size = _map.getSize();
    const center = _map.getCenter();
    const resolution = _map.getResolution();
    const resolutions = _map.getResolutions();
    nextZoom = nextZoom >= (resolutions.length - 1) ? (resolutions.length - 1) : (nextZoom <= 0 ? 0 : nextZoom);
    if (nextZoom === lastZoom) {
      return false;
    }
    const coordinates = _map.getCoordinateFromPixel(_map.getEventPixel(event));
    let newResolution = _map._getNearestResolution(lastZoom, nextZoom, (nextZoom <= lastZoom));
    newResolution = newResolution >= _map.maxResolution ? _map.maxResolution : (newResolution <= _map.minResolution ? _map.minResolution : newResolution);
    const scale = newResolution / resolution;
    let newCenter = [
      coordinates[0] + (center[0] - coordinates[0]) * scale,
      coordinates[1] + (center[1] - coordinates[1]) * scale
    ];
    let _offset = [
      (newCenter[0] - center[0]) / newResolution,
      (newCenter[1] - center[1]) / newResolution
    ];
    _map.animate({
      center: newCenter,
      zoom: nextZoom,
      origin: [size[0] / 2, size[1] / 2],
      offset: _offset
    });
  }
}

export default WheelZoom
