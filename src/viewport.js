import {Rect} from '../../2dGameUtils';

import {SceneryParallaxLayer, ParallaxLayer} from './layer';
import {RenderObject} from './renderObject';

export class ViewPort extends Rect {
    constructor(renderer, x1, y1, x2, y2) {
        super(x1, y1, x2, y2);
        this.renderer = renderer;
        this.renderer.addObserver('boundsChanged', this._updateRendererBounds.bind(this));
        this.zoom = 1;
        this.maxZoom = 8;
        this.layers = [];

        this.debugLayer = this.createLayer();
        this.debugMarkers = {
            Center: new RenderObject('MarkerCenter', this.debugLayer),
            UL:     new RenderObject('MarkerUL', this.debugLayer),
            UR:     new RenderObject('MarkerUR', this.debugLayer),
            LL:     new RenderObject('MarkerLL', this.debugLayer),
            LR:     new RenderObject('MarkerLR', this.debugLayer)
        };
    }

    _updateRendererBounds(bounds) {
        for (let layer of this.layers) {
            layer.updateViewPortExtents(this, bounds);
        }
    }

    _clamp() {
        if (this.x1 < 0) {
            const width = this.width;
            this.x1 = 0;
            this.x2 = width;
        } else if (this.x2 >= this.renderer.bounds.x) {
            const width = this.width;
            this.x2 = this.renderer.bounds.x;
            this.x1 = this.x2 - width;
        }

        if (this.y1 < 0) {
            const height = this.height;
            this.y1 = 0;
            this.y2 = height;
        } else if (this.y2 >= this.renderer.bounds.y) {
            const height = this.height;
            this.y2 = this.renderer.bounds.y;
            this.y1 = this.y2 - height;
        }
    }

    move(x, y) {
        if (x >= 0 && x < this.renderer.bounds.x);
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + this.width;
        this.y2 = y + this.height;
        this._clamp();
    }

    moveBy(x, y) {
        this.x1 += x;
        this.y1 += y;
        this.x2 += x;
        this.y2 += y;
        this._clamp();
    }

    lookAtPoint(point) {
        const width = this.width;
        const height = this.height;
        this.x1 = point - (width / 2);
        this.y1 = point - (height / 2);
        this.x2 = this.x1 + width;
        this.y2 = this.y1 + height;
        this._clamp();
    }

    lookAtRect(rect) {
        let     xFit = this.renderer.width / rect.width,
                yFit = this.renderer.height / rect.height;
        const   mid = rect.midPoint();

        const zoom = Math.min(Math.min(xFit, yFit), this.maxZoom);

        if (zoom >= 1) this.zoom = ~~zoom;
        else {
            xFit = this.renderer.width / this.renderer.bounds.x;
            yFit = this.renderer.height / this.renderer.bounds.y;
            this.zoom = Math.min(xFit, yFit);
        }

        const   width = this.renderer.width / this.zoom,
                height = this.renderer.height / this.zoom;

        this.x1 = mid.x - (width / 2);
        this.y1 = mid.y - (height / 2);
        this.x2 = this.x1 + width;
        this.y2 = this.y1 + height;
        this._clamp();
        this._updateParallax();
    }

    _updateParallax() {
        for (let layer of this.layers) {
            layer.scale.set(this.zoom, this.zoom);
            layer.position.set(~~-(this.x * layer.parallaxXMod * this.zoom), ~~-(this.y * layer.parallaxYMod * this.zoom));
        }
        this.debugMarkers['Center'].moveTo(this.midPoint().x, this.midPoint().y);
        this.debugMarkers['UL'].moveTo(this.x1, this.y1);
        this.debugMarkers['UR'].moveTo(this.x2, this.y1);
        this.debugMarkers['LL'].moveTo(this.x1, this.y2);
        this.debugMarkers['LR'].moveTo(this.x2, this.y2);
    }

    _createParallaxTypeLayer(parallax, type) {
        if (parallax < 0 || parallax > 200) throw new RangeError('parallax out of range');

        const layer = new type(parallax, this);
        this.renderer.addLayer(layer);
        this.layers.push(layer);
        return layer;
    }

    // Parallax is a whole number representing a percentage value that
    // controls how fast the layer moves relative to the baseline layer
    // (which is at 100%). Values in the range 0..200 are supported
    createSceneryLayer(parallax) {
        return this._createParallaxTypeLayer(parallax, SceneryParallaxLayer);
    }

    createLayer(parallax=100) {
        return this._createParallaxTypeLayer(parallax, ParallaxLayer);
    }
}
