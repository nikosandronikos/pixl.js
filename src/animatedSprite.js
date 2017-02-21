import {mixin, ObservableMixin} from '../../2dGameUtils';

import {Renderer} from './renderer';

let AnimatedSpriteNextId = 0;

//class AnimatedSprite extends ObservableMixin(PIXI.Sprite) {
export class AnimatedSprite extends PIXI.Sprite {
    constructor(name, frameTextures, msPerFrame) {
        super(frameTextures[0]);
        this.id = AnimatedSpriteNextId++;
        this.name = name;
        this.frameTextures = frameTextures;
        this.numFrames = frameTextures.length;
        this.startTime = NaN;
        this.currentFrame = 0;
        this.msPerFrame = msPerFrame;
        this.repeats = Infinity;
    }    

    play(startTime) {
        // TODO: Look at whether this is an optimal data structure.
        Renderer.runningAnimations[this.id] = this;
        this.startTime = startTime;
        this.accumulatedTime = 0;
        this.currentFrame = 0;
        this.texture = this.frameTextures[0];
    }

    stop() {
        delete Renderer.runningAnimations[this.id];
        this.notifyObservers('animationEnd', this.name);
    }

    // Currently takes currentTime, but may want to take time
    // since last frame instead, depending on what fits better
    // with the game engine.
    update(currentTime) {
        if (!this.visible) return;

        // TODO: Speed up this calculation
        const frame = ~~((currentTime - this.startTime) / this.msPerFrame);

        if (frame > this.currentFrame) {
            if (frame >= this.numFrames) {
                this.repeats --;
                if (this.repeats == 0) {
                    this.stop();
                    return;
                }
            }
            this.currentFrame = frame % this.numFrames;
            this.texture = this.frameTextures[this.currentFrame];
        }
    }
}
mixin(AnimatedSprite, ObservableMixin);
