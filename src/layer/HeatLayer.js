import { merge, createCanvas } from '../utils'

const _options = {
  radius: 8,
  blur: 15,
  shadow: 250,
  gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00']
}

class HeatLayer {
  constructor (points, options = {}) {
    this.options = merge({}, _options, options)
    if (points && points.length > 0) {
      this.setData(points)
    }
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
    this._render()
    return this;
  }

  /**
   * set blur
   * @param blur
   */
  setBlur (blur) {
    this.options.blur = blur
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
  }

  /**
   * get radius
   * @returns {number|*}
   */
  getRadius () {
    return this.options.radius
  }

  /**
   * creat heat
   * @returns {string}
   * @private
   */
  createHeat_ () {
    const radius = this.getRadius();
    const blur = this.getBlur();
    const halfSize = radius + blur + 1;
    const size = 2 * halfSize;
    const context = createCanvas(size, size);
    context.shadowOffsetX = context.shadowOffsetY = this.shadow_;
    context.shadowBlur = blur;
    context.shadowColor = '#000';
    context.beginPath();
    const center = halfSize - this.shadow_;
    context.arc(center, center, radius, 0, Math.PI * 2, true);
    context.fill();
    return context.canvas.toDataURL();
  }

  /**
   * handle gradient change
   * @private
   */
  handleGradientChanged_ () {
    this.gradient_ = HeatLayer.createGradient(this.getGradient());
  }

  handleRender_ () {
    const context = this.options.canvas;
    const canvas = context.canvas;
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
   * render
   * @private
   */
  _render () {
    this.setGradient(this.options.gradient)
    this.setBlur(this.options.blur)
    this.setRadius(this.options.radius)
    this.handleRender_()
  }

  static createGradient = function (colors) {
    const width = 1;
    const height = 256;
    const context = createCanvas(width, height);
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
