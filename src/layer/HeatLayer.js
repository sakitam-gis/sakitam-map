import { createCanvas } from '../utils'

const _options = {
  radius: 25,
  blur: 15,
  shadow: 250,
  minOpacity: 0.05,
  gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00']
};

class HeatLayer {
  constructor (points, options = {}) {
    this.options = Object.assign(_options, options)
    if (points && points.length > 0) {
      this.setData(points)
    }

    /**
     * max value
     * @type {number}
     * @private
     */
    this._maxValue = 18
  }

  /**
   * get data
   * @returns {Array|*}
   */
  getData () {
    return this._points;
  }

  /**
   * set data
   * @param _points
   * @returns {HeatLayer}
   */
  setData (_points = []) {
    this._points = _points;
    this.handleRender_()
    return this;
  }

  /**
   * add point
   * @param point
   * @returns {HeatLayer}
   */
  add (point) {
    this._points.push(point);
    return this;
  }

  /**
   * clear layer data
   * @returns {HeatLayer}
   */
  clear () {
    this._points = [];
    return this;
  }

  /**
   * set blur
   * @param blur
   */
  setBlur (blur) {
    this.options.blur = blur
    this.handleRadiusChanged_()
    this.handleGradientChanged_()
  }

  /**
   * get blur
   * @returns {number}
   */
  getBlur () {
    return this.options.blur
  }

  /**
   * set gradient
   * @param colors
   */
  setGradient (colors) {
    this.options.gradient = colors
    this.handleRadiusChanged_()
    this.handleGradientChanged_()
  }

  /**
   * get gradient
   * @returns {string[]|*}
   */
  getGradient () {
    return this.options.gradient
  }

  /**
   * set radius
   * @param radius
   */
  setRadius (radius) {
    this.options.radius = radius
    this.handleRadiusChanged_()
    this.handleGradientChanged_()
  }

  /**
   * get radius
   * @returns {number|*}
   */
  getRadius () {
    return this.options.radius
  }

  /**
   * handle radius change
   * @private
   */
  handleRadiusChanged_ () {
    const radius = this.getRadius();
    const blur = this.getBlur();
    const halfSize = radius + blur + 1;
    const size = 2 * halfSize;
    const canvas = this._circle = createCanvas(size, size)
    const context = canvas.getContext('2d');
    context.shadowOffsetX = context.shadowOffsetY = size;
    context.shadowBlur = blur;
    context.shadowColor = '#000';
    context.beginPath();
    context.arc(-halfSize, -halfSize, radius, 0, Math.PI * 2, true);
    context.closePath()
    context.fill();
  }

  /**
   * handle gradient change
   * @private
   */
  handleGradientChanged_ () {
    this.gradient_ = HeatLayer.createGradient(this.getGradient());
  }

  /**
   * handle render
   * @private
   */
  handleRender_ () {
    if (!this._circle) this.setRadius(this.options.radius);
    if (!this.gradient_) this.setGradient(this.options.gradient);
    const context = this.options.context;
    const canvas = context.canvas;
    const radius = this.getRadius();
    const blur = this.getBlur();
    const _rb = radius + blur
    for (let i = 0, len = this._points.length, point; i < len; i++) {
      point = this._points[i];
      context.globalAlpha = Math.min(Math.max(point[2] / this._maxValue, this.options.minOpacity), 1);
      context.drawImage(this._circle, point[0] - _rb, point[1] - _rb)
    }
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const _imgData = image.data;
    for (let i = 0, ii = _imgData.length; i < ii; i += 4) {
      const alpha = _imgData[i + 3] * 4;
      if (alpha) {
        _imgData[i] = this.gradient_[alpha];
        _imgData[i + 1] = this.gradient_[alpha + 1];
        _imgData[i + 2] = this.gradient_[alpha + 2];
      }
    }
    context.putImageData(image, 0, 0);
  }

  /**
   * creat gradient color
   * @param colors
   * @returns {Uint8ClampedArray}
   */
  static createGradient = function (colors) {
    const width = 1;
    const height = 256;
    const context = createCanvas(width, height).getContext('2d');
    // 创建线性的渐变对象 from `https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient`
    const gradient = context.createLinearGradient(0, 0, width, height);
    const step = 1 / (colors.length - 1);
    for (let i = 0, ii = colors.length; i < ii; ++i) {
      // 定义一个渐变的颜色带
      gradient.addColorStop(i * step, colors[i]);
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    return context.getImageData(0, 0, width, height).data;
  }
}

export default HeatLayer
