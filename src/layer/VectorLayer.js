import Base from './Base';
import { createCanvas, isEmpty } from '../utils';
import ajax from '../utils/ajax';
import { fromLonLat } from '../proj';

const STYLE_BASE = {
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  strokeStyle: '#404a59',
  fillStyle: '#323c48',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic'
};

class VectorLayer extends Base {
  constructor (options = {}) {
    super(options);

    /**
     * layer service url
     * @type {*|string}
     */
    this.url = options['url'] || '';

    /**
     * json data
     * @type {*|{}}
     * @private
     */
    this._data = options['data'] || {};

    /**
     * set style
     */
    this.setStyle(options['style'] || {}, false);
  }

  /**
   * load layer
   * @returns {VectorLayer}
   */
  load () {
    if (!this.getMap()) {
      return this;
    }

    /**
     * map size
     * @type {*|string}
     */
    const size = this.getMap().getSize();
    if (!this.canvas_) {
      this.canvas_ = createCanvas(size[0], size[1]);
    } else {
      this.canvas_.width = size[0];
      this.canvas_.height = size[1];
    }
    if (this.url && isEmpty(this._data)) {
      ajax.getJSON(this.url).then(res => {
        if (res.data && res.data.features) {
          this._data = res.data.features;
          this.render();
        }
      })
    } else {
      this.render();
    }
    return this;
  }

  /**
   * set style
   * @param style
   * @param render
   */
  setStyle (style = {}, render = true) {
    this._style = Object.assign({}, STYLE_BASE, style);
    this._style.globalAlpha = this.getOpacity();
    if (render) this.render();
  }

  /**
   * re render
   */
  render () {
    const data = this._data;
    const map = this.getMap();
    const size = map.getSize();
    const context = this.getContext() || map.getContext();
    context.save();
    for (let key in this._style) {
      context[key] = this._style[key];
    }
    if (this.getRenderType() === 'webgl') {
      context.save();
      context.beginPath();
      let item;
      for (let i = 0, len = data.length; i < len; i++) {
        item = data[i];
        this._drawInternal(context, item);
      }
      let type = item.geometry.type;
      if (type === 'Point' || type === 'Polygon' || type === 'MultiPolygon') {
        context.fill();
        context.stroke();
      } else if (type === 'LineString') {
        context.stroke();
      }
      context.restore();
    } else {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        context.save();
        if (item.fillStyle) {
          context.fillStyle = item.fillStyle;
        }
        if (item.strokeStyle) {
          context.strokeStyle = item.strokeStyle;
        }
        let type = item.geometry.type;
        context.beginPath();
        this._drawInternal(context, item);
        if (type === 'Point' || type === 'Polygon' || type === 'MultiPolygon') {
          context.fill();
          context.stroke();
        } else if (type === 'LineString') {
          if (item.lineWidth) {
            context.lineWidth = item.lineWidth;
          }
          context.stroke();
        }
        context.restore();
      }
    }
    context.restore();
    if (this.getContext()) {
      map.getContext().drawImage(this.canvas_, 0, 0, size[0], size[1])
    }
  }

  /**
   * draw vector shape
   * @param context
   * @param data
   * @private
   */
  _drawInternal (context, data) {
    const _map = this.getMap();
    let type = data.geometry.type;
    let coordinates = data.geometry.coordinates;
    let pixel = [];
    switch (type) {
      case 'Point':
        let size = data._size || data.size || 5;
        pixel = _map.getPixelFromCoordinate(fromLonLat(coordinates));
        context.moveTo(pixel[0], pixel[1]);
        context.arc(pixel[0], pixel[1], size, 0, Math.PI * 2);
        break;
      case 'LineString':
        for (let j = 0; j < coordinates.length; j++) {
          pixel = _map.getPixelFromCoordinate(fromLonLat(coordinates[j]));
          if (j === 0) {
            context.moveTo(pixel[0], pixel[1]);
          } else {
            context.lineTo(pixel[0], pixel[1]);
          }
        }
        break;
      case 'Polygon':
        this._drawPolygon(context, coordinates, _map);
        break;
      case 'MultiPolygon':
        for (let i = 0; i < coordinates.length; i++) {
          let polygon = coordinates[i];
          this._drawPolygon(context, polygon, _map);
        }
        context.closePath();
        break;
      default:
        console.log('type' + type + 'is not support now!');
        break;
    }
  }

  /**
   * draw polygon
   * @param context
   * @param coordinates
   * @param map
   * @private
   */
  _drawPolygon (context, coordinates, map) {
    let [pixel, pixel_] = [];
    for (let i = 0; i < coordinates.length; i++) {
      let coordinate = coordinates[i];
      pixel = map.getPixelFromCoordinate(fromLonLat(coordinate[0]));
      context.moveTo(pixel[0], pixel[1]);
      for (let j = 1; j < coordinate.length; j++) {
        pixel_ = map.getPixelFromCoordinate(fromLonLat(coordinate[j]));
        context.lineTo(pixel_[0], pixel_[1]);
      }
      context.lineTo(pixel[0], pixel[1]);
    }
  }
}

export default VectorLayer
