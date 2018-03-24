import { preventDefault, checkBrowser } from '../utils';
import Base from './Base';
import { getForViewAndSize } from '../proj/extent'

class WheelZoom extends Base {
  constructor (options = {}) {
    super(options);
    this._active = options.hasOwnProperty('active') ? options['active'] : true;
  }

  handleEvent (event) {
    const type = event.type;
    if (type !== 'wheel' && type !== 'mousewheel') {
      return true;
    }
    preventDefault(event);
    let delta;
    if (type === 'wheel') {
      delta = event.deltaY;
      if (checkBrowser() === 'FF' &&
        event.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
        delta /= (window.devicePixelRatio || 1);
      }
    } else if (type === 'mousewheel') {
      delta = -event.wheelDeltaY;
      if (checkBrowser() === 'Safari') {
        delta /= 3;
      }
    }

    if (delta === 0) {
      return false;
    }
    const origin = this._map.getOrigin();
    const coordinates = this._map.getCoordinateFromPixel([event.clientX, event.clientY]);
    const resolutions = this._map.getResolutions();
    const resolution = this._map.getResolution();
    let newResolution = '';
    // let newResolution = resolution * Math.pow(2, delta / 300);
    // if (newResolution < resolutions[resolutions.length - 1]) {
    //   newResolution = Math.max(newResolution, resolutions[resolutions.length - 1] / 1.5);
    // } else if (newResolution > resolutions[0]) {
    //   newResolution = Math.min(newResolution, resolutions[0] * 1.5);
    // }
    if (event.wheelDelta > 0) {
      for (let i = 0; i < resolutions.length; i++) {
        if (resolution >= resolutions[i]) {
          newResolution = resolutions[i];
          this._map.renderer.setResolution(newResolution);
          const scale = resolution / newResolution;
          this._map.renderer.setOrigin([
            origin[0] + (coordinates[0] - origin[0]) / scale,
            origin[1] + (coordinates[1] - origin[1]) / scale
          ]);
          break;
        }
      }
    } else {
      for (let i = 0; i < resolutions.length; i++) {
        if (resolution >= resolutions[i]) {
          if (i === 0) {
            newResolution = resolutions[0];
          } else {
            newResolution = resolutions[i - 1];
          }
          this._map.renderer.setResolution(newResolution);
          const scale = newResolution / resolution;
          this._map.renderer.setOrigin([
            origin[0] + (coordinates[0] - origin[0]) / (scale - 1),
            origin[1] + (coordinates[1] - origin[1]) / (scale - 1)
          ]);
          break;
        }
      }
    }
    console.log(getForViewAndSize(coordinates, newResolution, 0, this._map.getSize()));
    this._map.renderer.setExtent(getForViewAndSize(coordinates, newResolution, 0, this._map.getSize()));
    // this._map.renderer.setExtent([
    //   this._map.getOrigin()[0],
    //   this._map.getOrigin()[1] - newResolution * this._map.getSize()[1],
    //   this._map.getOrigin()[0] + newResolution * this._map.getSize()[0],
    //   this._map.getOrigin()[1]]);
    return false;
  }
}

export default WheelZoom
