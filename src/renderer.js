import {DEG_TO_RAD} from '../../2dGameUtils';
import {mixinOnObj, ObservableMixin} from '../../2dGameUtils';

import {ScreenLayer, SceneryParallaxLayer, ParallaxLayer} from './layer';
import {RenderObject} from './renderObject';
import {ViewPort} from './viewport';

export const Renderer = {
    init: function(width, height) {
        console.log(`Initialising render window ${width}x${height}`);
        this.width = width;
        this.height = height;

        this.pixi = PIXI.autoDetectRenderer(width, height, {antialias: false, resolution: 1});
        PIXI.settings.SCALE_MODE = PIXI.scaleModes.NEAREST;
        document.querySelector('body').appendChild(Renderer.pixi.view);
        this.pixi.view.id = 'renderer';
        this.stage = new PIXI.Container();

        this.bounds = {x: width, y: height};

        this.viewPorts = [];

        this.layers = [];

        this.runningAnimations = [];

        this.frameNo = 0;
    },

    setBounds(x, y) {
        if (x < 1 || y < 1) throw new Error('bounds must be positive');
        this.bounds.x = x;
        this.bounds.y = y;

        this.notifyObservers('boundsChanged', this.bounds);
    },

    createViewPort(rect) {
        const vp = new ViewPort(this, rect.x1, rect.y1, rect.x2, rect.y2);
        this.viewPorts.push(vp);
        return vp;
    },

    createScreenLayer() {
        const layer = new ScreenLayer();
        this.addLayer(layer);
        return layer;
    },

    addLayer: function(layer) {
        this.stage.addChild(layer);
        this.stage.children.sort((a, b) => b.parallax < a.parallax);
    },

    _completeLoadAssets(json, completeFn) {
        if (completeFn !== undefined)
            completeFn();
    },

    loadAssets: function(assets, completeFn) {
        this.assets = assets;
        PIXI.loader.add(assets.atlas).load(this._completeLoadAssets.bind(this, assets, completeFn));
    },

    renderFrame: function() {
        this.frameNo ++;

        for (let animName in this.runningAnimations) {
            this.runningAnimations[animName].update(performance.now());
        }

        this.pixi.render(this.stage);
    }
}
mixinOnObj(Renderer, ObservableMixin);
