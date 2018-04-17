import Projection from './Projection';
import { Units, METERS_PER_UNIT } from './constants';
import { modulo } from '../utils';
import { getDistance } from './Sphere';
import { applyTransform } from './extent';
import {get as getTransformFunc, add as addTransformFunc} from './transforms';
import EPSG3857 from './epsg3857'
import EPSG4326 from './epsg4326'

const projections = {
  projections: {},
  add: function (code, projection) {
    this.projections[code] = projection;
  },
  get: function (code) {
    return this.projections[code] || null;
  }
};

/**
 * clone data
 * @param input
 * @param _output
 * @param _dimension
 * @returns {*}
 */
const cloneTransform = (input, _output, _dimension) => {
  let output;
  if (_output !== undefined) {
    for (let i = 0, ii = input.length; i < ii; ++i) {
      _output[i] = input[i];
    }
    output = _output;
  } else {
    output = input.slice();
  }
  return output;
}

/**
 * @param {Array.<number>} input Input coordinate array.
 * @param {Array.<number>=} output Output array of coordinate values.
 * @param {number=} dimension Dimension.
 * @return {Array.<number>} Input coordinate array (same array as input).
 */
const identityTransform = function (input, output, dimension) {
  if (output !== undefined && input !== output) {
    for (let i = 0, ii = input.length; i < ii; ++i) {
      output[i] = input[i];
    }
    input = output;
  }
  return input;
};

/**
 * add projection
 * @param projection
 */
const addProjection = function (projection) {
  projections.add(projection.getCode(), projection);
  addTransformFunc(projection, projection, cloneTransform);
};

/**
 * Fetches a Projection object for the code specified.
 * @param projectionLike
 * @returns {*}
 */
const get = function (projectionLike) {
  let projection = null;
  if (projectionLike instanceof Projection) {
    projection = projectionLike;
  } else if (typeof projectionLike === 'string') {
    const code = projectionLike;
    projection = projections.get(code);
  }
  return projection;
};

/**
 * Get the resolution of the point in degrees or distance units.
 * @param projection
 * @param resolution
 * @param point
 * @param units
 * @returns {*}
 */
const getPointResolution = function (projection, resolution, point, units) {
  projection = get(projection);
  let pointResolution;
  const getter = projection.getPointResolutionFunc();
  if (getter) {
    pointResolution = getter(resolution, point);
  } else {
    const units = projection.getUnits();
    if ((units === Units.DEGREES && !units) || (units === Units.DEGREES)) {
      pointResolution = resolution;
    } else {
      const toEPSG4326 = getTransformFromProjections(projection, get('EPSG:4326'));
      let vertices = [
        point[0] - resolution / 2, point[1],
        point[0] + resolution / 2, point[1],
        point[0], point[1] - resolution / 2,
        point[0], point[1] + resolution / 2
      ];
      vertices = toEPSG4326(vertices, vertices, 2);
      const width = getDistance(vertices.slice(0, 2), vertices.slice(2, 4));
      const height = getDistance(vertices.slice(4, 6), vertices.slice(6, 8));
      pointResolution = (width + height) / 2;
      const metersPerUnit = units ? METERS_PER_UNIT[units] : projection.getMetersPerUnit();
      if (metersPerUnit !== undefined) {
        pointResolution /= metersPerUnit;
      }
    }
  }
  return pointResolution;
};

/**
 * Transforms a coordinate from longitude/latitude to a different projection.
 * @param coordinate
 * @returns {*}
 */
const fromLonLat = function (coordinate) {
  return get('EPSG:3857').project(coordinate);
};

/**
 * Transforms a coordinate to longitude/latitude.
 * @param coordinate
 * @returns {*}
 */
const toLonLat = function (coordinate) {
  const lonLat = get('EPSG:3857').unproject(coordinate);
  const lon = lonLat[0];
  if (lon < -180 || lon > 180) {
    lonLat[0] = modulo(lon + 180, 360) - 180;
  }
  return lonLat;
};

/**
 * Searches in the list of transform functions for the function for converting
 * coordinates from the source projection to the destination projection.
 * @param sourceProjection
 * @param destinationProjection
 * @returns {*}
 */
const getTransformFromProjections = function (sourceProjection, destinationProjection) {
  const sourceCode = sourceProjection.getCode();
  const destinationCode = destinationProjection.getCode();
  let transformFunc = getTransformFunc(sourceCode, destinationCode);
  if (!transformFunc) {
    transformFunc = identityTransform;
  }
  return transformFunc;
};

/**
 * Transform source to destination
 * @param source
 * @param destination
 * @returns {*}
 */
const getTransform = function (source, destination) {
  const sourceProjection = get(source);
  const destinationProjection = get(destination);
  return getTransformFromProjections(sourceProjection, destinationProjection);
};

/**
 * Transforms a coordinate from source projection to destination projection.
 * This returns a new coordinate (and does not modify the original).
 * @param coordinate
 * @param source
 * @param destination
 * @returns {*}
 */
const transform = function (coordinate, source, destination) {
  const transformFunc = getTransform(source, destination);
  return transformFunc(coordinate, undefined, coordinate.length);
}

/**
 * Transforms an extent from source projection to destination projection.  This
 * returns a new extent (and does not modify the original)
 * @param extent
 * @param source
 * @param destination
 * @returns {*}
 */
const transformExtent = function (extent, source, destination) {
  const transformFunc = getTransform(source, destination);
  return applyTransform(extent, transformFunc);
};

addProjection(EPSG3857);
addProjection(EPSG4326);

export {
  get,
  fromLonLat,
  toLonLat,
  transform,
  addProjection,
  transformExtent,
  getPointResolution
}

export {
  Projection
}

export * from './Sphere'
