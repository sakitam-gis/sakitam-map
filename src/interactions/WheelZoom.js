import Base from './Base';
import { preventDefault } from '../utils';

class WheelZoom extends Base {
  constructor (options = {}) {
    super(options);
    this._active = options.hasOwnProperty('active') ? options['active'] : true;
  }

  /**
   * handle wheel event
   * @param event
   * @returns {boolean}
   */
  handleEvent (event) {
    const type = event.type;
    if (type !== 'wheel' && type !== 'mousewheel') {
      return true;
    }
    preventDefault(event);
    const origin = this._map.getOrigin();
    const coordinates = this._map.getCoordinateFromPixel(this._map.getEventPixel(event));
    console.log(coordinates)
    const resolutions = this._map.getResolutions();
    const resolution = this._map.getResolution();
    let newResolution = '';
    if (event.wheelDelta > 0) {
      for (let i = 0; i < resolutions.length; i++) {
        if (resolution > resolutions[i]) {
          newResolution = resolutions[i];
          const scale = resolution / newResolution;
          this._map.setResolution(newResolution);
          this._map.setOrigin([
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
          const scale = newResolution / resolution;
          this._map.setResolution(newResolution);
          this._map.setOrigin([
            origin[0] + (coordinates[0] - origin[0]) / (scale - 1),
            origin[1] + (coordinates[1] - origin[1]) / (scale - 1)
          ]);
          break;
        }
      }
    }
    const newOrigin = this._map.getOrigin();
    this._map.setExtent([
      newOrigin[0],
      newOrigin[1] - newResolution * this._map.getSize()[1],
      newOrigin[0] + newResolution * this._map.getSize()[0],
      newOrigin[1]
    ]);
  }
}

export default WheelZoom
