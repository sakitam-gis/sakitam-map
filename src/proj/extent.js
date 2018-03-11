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

export {
  getBBOX,
  getExtent,
  applyTransform
}
