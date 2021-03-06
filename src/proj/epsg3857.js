import { cosh } from '../utils'
import { RADIUS, HALF_SIZE, Units } from './constants';
import Projection from './Projection';

const _options = {
  EXTENT: [
    -HALF_SIZE, -HALF_SIZE,
    HALF_SIZE, HALF_SIZE
  ]
};

class EPSG3857 extends Projection {
  constructor (code) {
    super({
      code: code,
      units: Units.METERS,
      extent: _options.EXTENT,
      fullExtent: _options.EXTENT,
      resolutions: (function () {
        const resolutions = [];
        const d = 2 * 6378137 * Math.PI;
        for (let i = 0; i < 21; i++) {
          resolutions[i] = d / (256 * Math.pow(2, i));
        }
        return resolutions;
      })(),
      getPointResolution: function (resolution, point) {
        return resolution / cosh(point[1] / RADIUS);
      }
    })
  }

  project (input, output, dimension) {
    const length = input.length;
    const _dimension = dimension > 1 ? dimension : 2;
    if (output === undefined) {
      if (dimension > 2) {
        output = input.slice();
      } else {
        output = new Array(length);
      }
    }
    for (let i = 0; i < length; i += _dimension) {
      output[i] = HALF_SIZE * input[i] / 180;
      let y = RADIUS *
        Math.log(Math.tan(Math.PI * (input[i + 1] + 90) / 360));
      if (y > HALF_SIZE) {
        y = HALF_SIZE;
      } else if (y < -HALF_SIZE) {
        y = -HALF_SIZE;
      }
      output[i + 1] = y;
    }
    return output;
  }

  unproject (input, output, dimension) {
    const length = input.length;
    const _dimension = dimension > 1 ? dimension : 2;
    if (output === undefined) {
      if (dimension > 2) {
        output = input.slice();
      } else {
        output = new Array(length);
      }
    }
    for (let i = 0; i < length; i += _dimension) {
      output[i] = 180 * input[i] / HALF_SIZE;
      output[i + 1] = 360 * Math.atan(Math.exp(input[i + 1] / RADIUS)) / Math.PI - 90;
    }
    return output;
  }
}

export {EPSG3857}

export default new EPSG3857('EPSG:3857')
