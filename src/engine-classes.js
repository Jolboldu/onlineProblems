// class declarations
import * as PIXI from 'pixi.js'
import {
  Game,
  Block,
  Hero,
  Level
} from './engine'
import {translatePointToPx} from './utilities'

class Sprite extends PIXI.Sprite {

  set position([x,y]) {
    this.x = x
    this.y = y
  }

  get position() {
    return [this.x, this.y]
  }

  set _size([width, height]) {
    this.width = width
    this.height = height
  }

  get _size() {
    return [this.width, this. height]
  }
}


class EngineBlock extends Block {

  constructor(position = [0,0], color = 'block', sprite, texturepack) {
    super(color, position)
    this.texturepack = texturepack
    this.sprite = sprite
    this._setSpritePosition(position)
    this._setSpriteTexture(color)
  }

  _setSpritePosition(position) {
    if (this.sprite)
      this.sprite.position = translatePointToPx(position)
  }
  _setSpriteTexture(color) {
    if (this.sprite)
      this.sprite.texture = this.texturepack[color]
  }

  set position(position) {
    if (!this._position || this._position[0] !== position[0] || this._position[1] !== position[1]) {
      this._position = position
      this._setSpritePosition(position)
    }
  }
  get position() {
    return this._position
  }

  set color(color) {
    if (!this._color || this._color != color) {
      this._color = color
      this._setSpriteTexture(color)
    }
  }
  get color() {
    return this._color
  }

}

class EngineHero extends Hero {
  constructor(startPosition = [0, 0], startDirection = 0, sprite, texturepack) {
    super(startPosition, startDirection)
    this.texturepack = texturepack
    this.sprite = sprite
    this._setSpriteTexture(startDirection)
    this._setSpritePosition(startPosition)
  }

  _setSpritePosition(position) {
    if (this.sprite)
      this.sprite.position = translatePointToPx(position)
  }

  _setSpriteTexture(direction) {
    if (this.sprite)
      this.sprite.texture = this.texturepack[direction]
  }

  set position(position) {
    if (!this._position || this._position[0] !== position[0] || this._position[1] !== position[1]) {
      this._position = position;
      this._setSpritePosition(position)
    }
  }
  get position() {
    return this._position
  }

  set direction(direction) {
    if (!this._direction || this._direction && this._direction != direction) {
      this._direction = direction
      this._setSpriteTexture(direction)
    }
  }
  get direction() {
    return this._direction
  }
}

export {
  EngineBlock,
  EngineHero,
  Sprite
}