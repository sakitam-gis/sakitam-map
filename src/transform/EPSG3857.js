import { RADIUS, HALF_SIZE } from './constants';

const _options = {
  EXTENT: [
    -HALF_SIZE, -HALF_SIZE,
    HALF_SIZE, HALF_SIZE
  ],
  WORLD_EXTENT: [-180, -85, 180, 85]
}

const EPSG4326 = function () {
  this.options = Object.assign({}, _options)
}

EPSG4326.fromEPSG4326 = function (input, output, dimension) {
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
};

EPSG4326.toEPSG4326 = function (input, output, dimension) {
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
};

export {
  EPSG4326
}
