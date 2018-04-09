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
    const _map = this.getMap();
    if (!_map) return;
    if (type !== 'wheel' && type !== 'mousewheel') {
      return true;
    }
    preventDefault(event);
    const origin = _map.getOrigin();
    const coordinates = _map.getCoordinateFromPixel(_map.getEventPixel(event));
    console.log(coordinates)
    const resolutions = _map.getResolutions();
    const resolution = _map.getResolution();
    let newResolution = '';
    if (event.wheelDelta > 0) {
      for (let i = 0; i < resolutions.length; i++) {
        if (resolution > resolutions[i]) {
          newResolution = resolutions[i];
          const scale = resolution / newResolution;
          _map.setResolution(newResolution);
          _map.setOrigin([
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
          _map.setResolution(newResolution);
          _map.setOrigin([
            origin[0] + (coordinates[0] - origin[0]) / (scale - 1),
            origin[1] + (coordinates[1] - origin[1]) / (scale - 1)
          ]);
          break;
        }
      }
    }
    const newOrigin = _map.getOrigin();
    _map.setExtent([
      newOrigin[0],
      newOrigin[1] - newResolution * _map.getSize()[1],
      newOrigin[0] + newResolution * _map.getSize()[0],
      newOrigin[1]
    ]);
  }
}

export default WheelZoom
