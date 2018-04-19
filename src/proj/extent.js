const createOrUpdate = (minX, minY, maxX, maxY, extent) => {
  if (extent) {
    extent[0] = minX;
    extent[1] = minY;
    extent[2] = maxX;
    extent[3] = maxY;
    return extent;
  } else {
    return [minX, minY, maxX, maxY];
  }
};

const _boundingExtentXYs = (xs, ys, extent) => {
  const minX = Math.min.apply(null, xs);
  const minY = Math.min.apply(null, ys);
  const maxX = Math.max.apply(null, xs);
  const maxY = Math.max.apply(null, ys);
  return createOrUpdate(minX, minY, maxX, maxY, extent);
}

const getExtent = (extents) => {
  const bbox = [ Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
  return extents.reduce(function (prev, coord) {
    return [
      Math.min(coord[0], prev[0]),
      Math.min(coord[1], prev[1]),
      Math.max(coord[2], prev[2]),
      Math.max(coord[3], prev[3])
    ]
  }, bbox)
}

const getBBOX = (extents) => {
  const bbox = [ Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
  return extents.reduce(function (prev, coord) {
    return [
      Math.min(coord[0], prev[0]),
      Math.min(coord[1], prev[1]),
      Math.max(coord[0], prev[2]),
      Math.max(coord[1], prev[3])
    ]
  }, bbox)
}

const applyTransform = (extent, transformFn, _extent) => {
  const coordinates = [
    extent[0], extent[1],
    extent[0], extent[3],
    extent[2], extent[1],
    extent[2], extent[3]
  ];
  transformFn(coordinates, coordinates, 2);
  const xs = [coordinates[0], coordinates[2], coordinates[4], coordinates[6]];
  const ys = [coordinates[1], coordinates[3], coordinates[5], coordinates[7]];
  return _boundingExtentXYs(xs, ys, _extent);
};

const getForViewAndSize = (center, resolution, rotation, size, extent) => {
  const dx = resolution * size[0] / 2;
  const dy = resolution * size[1] / 2;
  const cosRotation = Math.cos(rotation);
  const sinRotation = Math.sin(rotation);
  const xCos = dx * cosRotation;
  const xSin = dx * sinRotation;
  const yCos = dy * cosRotation;
  const ySin = dy * sinRotation;
  const x = center[0];
  const y = center[1];
  const x0 = x - xCos + ySin;
  const x1 = x - xCos - ySin;
  const x2 = x + xCos - ySin;
  const x3 = x + xCos + ySin;
  const y0 = y - xSin - yCos;
  const y1 = y - xSin + yCos;
  const y2 = y + xSin + yCos;
  const y3 = y + xSin - yCos;
  return createOrUpdate(
    Math.min(x0, x1, x2, x3), Math.min(y0, y1, y2, y3),
    Math.max(x0, x1, x2, x3), Math.max(y0, y1, y2, y3),
    extent);
};

/**
 * check is intersect
 * @param extent
 * @param extent_
 * @returns {*}
 */
const intersect = (extent, extent_) => {
  if (!extent && !extent_) {
    return;
  }
  if (extent && extent_) {
    let xmin = Math.max(extent[0], extent_[0]);
    let ymin = Math.max(extent[1], extent_[1]);
    let xmax = Math.min(extent[2], extent_[2]);
    let ymax = Math.min(extent[3], extent_[3]);
    if (!(xmin >= xmax || ymin >= ymax)) {
      return [xmin, ymin, xmax, ymax];
    }
  } else {
    return extent || extent_;
  }
};

/**
 * check is overlaps
 * @param extent
 * @param extent_
 * @param tolerance
 * @returns {boolean}
 */
const overlaps = (extent, extent_, tolerance = 0) => {
  if (!extent && !extent_) {
    return false;
  }
  return !(extent[0] > extent_[2] + tolerance ||
    extent[2] < extent_[0] - tolerance ||
    extent[1] > extent_[3] + tolerance ||
    extent[3] < extent_[1] - tolerance);
};

/**
 * check extent is contains point
 * @param extent
 * @param point
 * @param tolerance
 * @returns {boolean}
 */
const contains = (extent, point, tolerance = 0) => {
  if (!extent && !point) {
    return false;
  }
  return !(point[0] - extent[2] > tolerance ||
    extent[0] - point[0] > tolerance ||
    point[1] - extent[3] > tolerance ||
    extent[1] - point[1] > tolerance);
};

export {
  contains,
  overlaps,
  intersect,
  getBBOX,
  getExtent,
  applyTransform,
  getForViewAndSize
}
