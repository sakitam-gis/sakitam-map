const RADIUS = 6378137;

const HALF_SIZE = Math.PI * RADIUS;

const RADIANS = Math.PI / 180;

const DEFAULT_RADIUS = 6371008.8;

const Units = {
  DEGREES: 'degrees',
  FEET: 'ft',
  METERS: 'm',
  PIXELS: 'pixels',
  TILE_PIXELS: 'tile-pixels',
  USFEET: 'us-ft'
}

const METERS_PER_UNIT = {};
// use the radius of the Normal sphere
METERS_PER_UNIT[Units.DEGREES] = 2 * Math.PI * 6370997 / 360;
METERS_PER_UNIT[Units.FEET] = 0.3048;
METERS_PER_UNIT[Units.METERS] = 1;
METERS_PER_UNIT[Units.USFEET] = 1200 / 3937

export {
  Units,
  RADIUS,
  RADIANS,
  HALF_SIZE,
  METERS_PER_UNIT,
  DEFAULT_RADIUS
}
