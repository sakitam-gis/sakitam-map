import {RADIUS, Units} from './constants';
import Projection from './Projection';

const METERS_PER_UNIT = Math.PI * RADIUS / 180;

export const EXTENT = [-180, -90, 180, 90]

class EPSG4326 extends Projection {
  constructor (code, axisOrientation) {
    super({
      code: code,
      units: Units.DEGREES,
      extent: EXTENT,
      axisOrientation: axisOrientation,
      global: true,
      metersPerUnit: METERS_PER_UNIT,
      worldExtent: EXTENT
    })
  }
}

export {EPSG4326}

export default new EPSG4326('EPSG:4326')
