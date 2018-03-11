import { isEmpty } from '../utils'
const transforms = {};

/**
 * Registers a conversion function to convert coordinates from the source
 * projection to the destination projection.
 * @param source
 * @param destination
 * @param transformFn
 */
function add (source, destination, transformFn) {
  const sourceCode = source.getCode();
  const destinationCode = destination.getCode();
  if (!(sourceCode in transforms)) {
    transforms[sourceCode] = {};
  }
  transforms[sourceCode][destinationCode] = transformFn;
}

/**
 * remove cached projection
 * @param source
 * @param destination
 * @returns {*}
 */
function remove (source, destination) {
  const sourceCode = source.getCode();
  const destinationCode = destination.getCode();
  const transform = transforms[sourceCode][destinationCode];
  delete transforms[sourceCode][destinationCode];
  if (isEmpty(transforms[sourceCode])) {
    delete transforms[sourceCode];
  }
  return transform;
}

/**
 * Get a transform given a source code and a destination code.
 * @param sourceCode
 * @param destinationCode
 * @returns {*}
 */
function get (sourceCode, destinationCode) {
  let transform;
  if (sourceCode in transforms && destinationCode in transforms[sourceCode]) {
    transform = transforms[sourceCode][destinationCode];
  }
  return transform;
}

export {
  add,
  get,
  remove
}
