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

export {
  getBBOX,
  getExtent
}
