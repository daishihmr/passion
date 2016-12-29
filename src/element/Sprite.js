phina.namespace(function() {

  phina.define("passion.Sprite", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    age: 0,

    _bulletRunning: null,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;
    },

    spawn: function(options) {
      options.$safe({
        visible: true,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        frameX: 0,
        frameY: 0,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 1.0,
      });

      // var index = this.index;
      // var instanceData = this.instanceData;

      this.visible = options.visible;
      this.x = options.x;
      this.y = options.y;
      this.rotation = options.rotation;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.frameX = options.frameX;
      this.frameY = options.frameY;
      this.frameW = options.frameW;
      this.frameH = options.frameH;
      this.red = options.red;
      this.green = options.green;
      this.blue = options.blue;
      this.alpha = options.alpha;

      this.age = 0;

      return this;
    },

    update: function(app) {
      this.age += 1;
    },

    onremoved: function() {
      this.visible = false;
      this.bulletRunning.setRunner(null);
      this.tweener.clear();
    },

    _accessor: {
      visible: {
        get: function() {
          return this.instanceData[this.index + 0] === 1;
        },
        set: function(v) {
          this.instanceData[this.index + 0] = v ? 1 : 0;
        },
      },
      x: {
        get: function() {
          return this.instanceData[this.index + 1];
        },
        set: function(v) {
          this.instanceData[this.index + 1] = v;
        },
      },
      y: {
        get: function() {
          return this.instanceData[this.index + 2];
        },
        set: function(v) {
          this.instanceData[this.index + 2] = v;
        },
      },
      rotation: {
        get: function() {
          return this.instanceData[this.index + 3];
        },
        set: function(v) {
          this.instanceData[this.index + 3] = v;
        },
      },
      scaleX: {
        get: function() {
          return this.instanceData[this.index + 4];
        },
        set: function(v) {
          this.instanceData[this.index + 4] = v;
        },
      },
      scaleY: {
        get: function() {
          return this.instanceData[this.index + 5];
        },
        set: function(v) {
          this.instanceData[this.index + 5] = v;
        },
      },
      frameX: {
        get: function() {
          return this.instanceData[this.index + 6];
        },
        set: function(v) {
          this.instanceData[this.index + 6] = v;
        },
      },
      frameY: {
        get: function() {
          return this.instanceData[this.index + 7];
        },
        set: function(v) {
          this.instanceData[this.index + 7] = v;
        },
      },
      frameW: {
        get: function() {
          return this.instanceData[this.index + 8];
        },
        set: function(v) {
          this.instanceData[this.index + 8] = v;
        },
      },
      frameH: {
        get: function() {
          return this.instanceData[this.index + 9];
        },
        set: function(v) {
          this.instanceData[this.index + 9] = v;
        },
      },
      red: {
        get: function() {
          return this.instanceData[this.index + 10];
        },
        set: function(v) {
          this.instanceData[this.index + 10] = v;
        },
      },
      green: {
        get: function() {
          return this.instanceData[this.index + 11];
        },
        set: function(v) {
          this.instanceData[this.index + 11] = v;
        },
      },
      blue: {
        get: function() {
          return this.instanceData[this.index + 12];
        },
        set: function(v) {
          this.instanceData[this.index + 12] = v;
        },
      },
      alpha: {
        get: function() {
          return this.instanceData[this.index + 13];
        },
        set: function(v) {
          this.instanceData[this.index + 13] = v;
        },
      },
    },
  });

  passion.Sprite.prototype.getter("bulletRunning", function() {
    if (!this._bulletRunning) {
      this._bulletRunning = passion.BulletRunning().attachTo(this);
    }
    return this._bulletRunning;
  });

});
