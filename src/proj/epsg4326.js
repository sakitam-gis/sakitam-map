import {RADIUS, Units} from './constants';
import Projection from './Projection';

const METERS_PER_UNIT = Math.PI * RADIUS / 180;

export const EXTENT = [-180, -90, 180, 90]; // left, bottom, right, top

class EPSG4326 extends Projection {
  constructor (code, axisOrientation) {
    super({
      code: code,
      units: Units.DEGREES,
      extent: EXTENT,
      axisOrientation: axisOrientation,
      metersPerUnit: METERS_PER_UNIT,
      fullExtent: EXTENT,
      resolutions: (function () {
        const resolutions = [];
        for (let i = 0; i < 20; i++) {
          resolutions[i] = 180 / (Math.pow(2, i) * 128);
        }
        return resolutions;
      })()
    })
  }
}

export {EPSG4326}

export default new EPSG4326('EPSG:4326')
