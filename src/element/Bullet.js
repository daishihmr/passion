phina.namespace(function() {

  phina.define("passion.Bullet", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    x: 0,
    y: 0,
    age: 0,

    power: 0,

    _active: false,

    radius: 20,
    
    _bulletRunning: null,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;

      this.index = id * instanceStride;
    },

    spawn: function(option) {
      var instanceData = this.instanceData;
      var index = this.index;

      this.age = 0;
      this.scale = option.scale;
      this.frameX = option.type % 8;
      this.frameY = ~~(option.type / 8);
      this.visible = true;
      this.brightness = 1;
      this.auraRed = 0.2 + ~~(option.type / 8) % 2;
      this.auraGreen = 0.2 + 0;
      this.auraBlue = 0.2 + ~~(option.type / 8) % 2 + 1;

      return this;
    },

    activate: function() {
      this._active = true;
      this.flare("activated");
      return this;
    },

    inactivate: function() {
      this._active = false;
      this.flare("inactivated");
      return this;
    },

    onremoved: function() {
      this.visible = false;
      this.bulletRunning.setRunner(null);
    },

    update: function(app) {
      var instanceData = this.instanceData;
      var index = this.index;

      this.brightness = 1.5 + Math.sin(this.age * 0.2) * 0.6;

      if (this.x < -50 || GAME_AREA_WIDTH + 50 < this.x || this.y < -50 || GAME_AREA_HEIGHT + 50 < this.y) {
        this.remove();
        return;
      }

      this.age += 1;
    },

    isHit: function(target) {
      if (!this.visible || !target.visible) return false;
      return (this.x - target.x) * (this.x - target.x) + (this.y - target.y) * (this.y - target.y) < 5 * 5;
    },

    _accessor: {
      x: {
        get: function() {
          return this.instanceData[this.index + 0];
        },
        set: function(v) {
          this.instanceData[this.index + 0] = v;
        },
      },
      y: {
        get: function() {
          return this.instanceData[this.index + 1];
        },
        set: function(v) {
          this.instanceData[this.index + 1] = v;
        },
      },
      rotation: {
        get: function() {
          return this.instanceData[this.index + 2];
        },
        set: function(v) {
          this.instanceData[this.index + 2] = v;
        },
      },
      scale: {
        get: function() {
          return this.instanceData[this.index + 3];
        },
        set: function(v) {
          this.instanceData[this.index + 3] = v;
        },
      },
      frameX: {
        get: function() {
          return this.instanceData[this.index + 4];
        },
        set: function(v) {
          this.instanceData[this.index + 4] = v;
        },
      },
      frameY: {
        get: function() {
          return this.instanceData[this.index + 5];
        },
        set: function(v) {
          this.instanceData[this.index + 5] = v;
        },
      },
      visible: {
        get: function() {
          return this.instanceData[this.index + 6] == 1;
        },
        set: function(v) {
          this.instanceData[this.index + 6] = v ? 1 : 0;
        },
      },
      brightness: {
        get: function() {
          return this.instanceData[this.index + 7];
        },
        set: function(v) {
          this.instanceData[this.index + 7] = v;
        },
      },
      auraRed: {
        get: function() {
          return this.instanceData[this.index + 8];
        },
        set: function(v) {
          this.instanceData[this.index + 8] = v;
        },
      },
      auraGreen: {
        get: function() {
          return this.instanceData[this.index + 9];
        },
        set: function(v) {
          this.instanceData[this.index + 9] = v;
        },
      },
      auraBlue: {
        get: function() {
          return this.instanceData[this.index + 10];
        },
        set: function(v) {
          this.instanceData[this.index + 10] = v;
        },
      },
    },
  });

  passion.Bullet.prototype.getter("bulletRunning", function() {
    if (!this._bulletRunning) {
      this._bulletRunning = passion.BulletRunning().attachTo(this);
    }
    return this._bulletRunning;
  });

});
