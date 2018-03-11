import { toRadians } from '../utils';
import { DEFAULT_RADIUS } from './constants';

const getDistance = (c1, c2, _radius) => {
  const radius = _radius || DEFAULT_RADIUS;
  const lat1 = toRadians(c1[1]);
  const lat2 = toRadians(c2[1]);
  const deltaLatBy2 = (lat2 - lat1) / 2;
  const deltaLonBy2 = toRadians(c2[0] - c1[0]) / 2;
  const a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
    Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) *
    Math.cos(lat1) * Math.cos(lat2);
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export {
  getDistance
}
