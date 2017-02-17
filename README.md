# pixl.js
Renderer for (primarily) 2d pixel graphics games built on [Pixi.js](https://github.com/pixijs/pixi.js/).

I'm building this as a component of a spaceship battle game, which is at:
https://github.com/nikosandronikos/spacebattle

# Dependencies
Requires the [2dGameUtils](https://github.com/nikosandronikos/2dGameUtils) library, which must be located in
the same directory that this project is checked out into.

So, to get both, run the following from the directory where you want your copies of the repositories to live.
```
git clone https://github.com/nikosandronikos/pixl.js.git
git clone https://github.com/nikosandronikos/2dGameUtils.git
```
# Definitions
To render things with Pixl, assets are supplied via templates, then instantiated with `RenderObject.createFromConfig`.
The assets definition is an object made up of a specific collection of properties that define the texture atlas, the templates for RenderObjects, and some optional visual configurations for RenderObjects.
RenderObjects are a complex entity, that is made up of a tree of containers, sprites, and animated sprites. Nodes of a RenderObject may be named so they can be referenced in visual configurations.
Visual configurations control the visual state of the RenderObject, including what nodes of the RenderObject are visible, what animations are running, etc.

An example configuration:
```
export const RendererAssets = {
	atlas: ['atlas.json'],
	templates: {
		'ushipBasic': {
			base: {
				type: 'sprite',
				sprite: 'USpaceShip--'
			}
		},
		'uship': {
			base: {
				//name: 'main'				// Name is optional, used to refer to nodes explicitly
				type: 'sprite',				// Can be container|sprite|animatedSprite
				sprite: 'USpaceShip--',	// Only for type:sprite
				//animations: [],			// Only for type:animatedSprite
				//pivot: {x: 0.5, y: 0.5},	// Mid point is the default
				//rotation: 90, 			// 0 is the default
				//visible: true				/// true|false, true is default
				children: [
					{
						name: 'engine',		// Give a name because we'll want to hide this
						type: 'animatedSprite',
						position: {x: -18, y: 0}, // Relative to pivot of parent
						frames: ['USpaceShipEngine--0', 'USpaceShipEngine--1', 'USpaceShipEngine--2'],
						//animationSpeed: 100		// ms per frame - default is 100
					},
					{
						name: 'engineStart',
						type: 'animatedSprite',
						position: {x: -18, y: 0},
						frames: ['USpaceShipEngine--0', 'USpaceShipEngine--1', 'USpaceShipEngine--2'],
						visible: false,
					}
				]
			},
			configs: {
				engineStart: [
					{name: 'engine', visible: false, animation: {control: 'stop'}} ,
					{name: 'engineStart', visible: true, animation: {control: 'start', repeats: 1, onEnd: 'engineOn'}},
				],
				engineOn: [
					{name: 'engineStart', visible: false, animation: {control: 'stop'}},
					{name: 'engine', visible: true, animation: {control: 'start', repeats: Infinity}} 
				],
				engineOff: [
					{name: 'engineStart', visible: false, animation: {control: 'stop'}},
					{name: 'engine', visible: false, animation: {control: 'stop'}} 
				],
			}
		}
};
```
