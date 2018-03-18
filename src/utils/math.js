const cosh = (function () {
  let cosh;
  if ('cosh' in Math) {
    cosh = Math.cosh;
  } else {
    // … else, use the reference implementation of MDN:
    cosh = function (x) {
      const y = Math.exp(x);
      return (y + 1 / y) / 2;
    };
  }
  return cosh;
}());

const modulo = (a, b) => {
  const r = a % b;
  return r * b < 0 ? r + b : r;
};

const toRadians = (angleInRadians) => {
  return angleInRadians * 180 / Math.PI;
};

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export {
  cosh,
  clamp,
  modulo,
  toRadians
}
