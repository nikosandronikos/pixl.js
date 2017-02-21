import {DEG_TO_RAD} from '../../2dGameUtils';
import {mixin, ObservableMixin} from '../../2dGameUtils';

import {SceneryParallaxLayer, ParallaxLayer} from './layer';
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

        this.bounds = {x: width * 4, y: height * 4};

        this.viewPorts = [];

        this.layers = [];

        this.runningAnimations = [];

        this.frameNo = 0;
    },

    createViewPort(rect) {
        const vp = new ViewPort(this, rect.x1, rect.y1, rect.x2, rect.y2);
        this.viewPorts.push(vp);
        return vp;
    },

    _completeLoadAssets(json, completeFn) {
        if (completeFn !== undefined)
            completeFn();
    },

    loadAssets: function(assets, completeFn) {
        this.assets = assets;
        PIXI.loader.add(assets.atlas).load(this._completeLoadAssets.bind(this, assets, completeFn));
    },

    addLayer: function(layer) {
        this.stage.addChild(layer);
        this.stage.children.sort((a, b) => b.parallax < a.parallax);
    },

    renderFrame: function() {
        this.frameNo ++;

        for (let animName in this.runningAnimations) {
            this.runningAnimations[animName].update(performance.now());
        }

        this.pixi.render(this.stage);
    }
}
