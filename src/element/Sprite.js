phina.namespace(function() {

  phina.define("passion.Sprite", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    visible: true,

    x: 0,
    y: 0,
    rotation: 0,
    scale: 0,

    frameX: 0,
    frameY: 0,
    frameW: 0,
    frameH: 0,

    red: 1.0,
    green: 1.0,
    blue: 1.0,
    alpha: 1.0,

    age: 0,

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

      var index = this.index;
      var instanceData = this.instanceData;

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

      instanceData[index + 0] = this.visible ? 1 : 0; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.frameW; // frame.w
      instanceData[index + 9] = this.frameH; // frame.h
      instanceData[index + 10] = this.red; // red
      instanceData[index + 11] = this.green; // green
      instanceData[index + 12] = this.blue; // blue
      instanceData[index + 13] = this.alpha; // alpha

      this.age = 0;

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      instanceData[index + 0] = this.visible ? 1 : 0; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.frameW; // frame.w
      instanceData[index + 9] = this.frameH; // frame.h
      instanceData[index + 10] = this.red; // red
      instanceData[index + 11] = this.green; // green
      instanceData[index + 12] = this.blue; // blue
      instanceData[index + 13] = this.alpha; // alpha

      this.age += 1;
    },

    onremoved: function() {
      this.visible = false;
      this.instanceData[this.index + 0] = 0;
    },
  });

});
