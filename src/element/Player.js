phina.namespace(function() {

  phina.define("passion.Player", {
    superClass: "passion.Sprite",
    
    _roll: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.controll(e.app);
      });
    },

    spawn: function() {
      passion.Sprite.prototype.spawn.call(this, {
        scaleX: 60,
        scaleY: 60,
        frameX: 3 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
      });
      return this;
    },

    controll: function(app) {
      var p = app.pointer;
      var dp = p.deltaPosition;

      if (p.getPointing()) {
        this.x += dp.x * 2;
        this.y += dp.y * 2;

        this.x = Math.clamp(this.x, 5, GAME_AREA_WIDTH - 5);
        this.y = Math.clamp(this.y, 5, GAME_AREA_HEIGHT - 5);
      }
    },
    
    acceccor: {
      roll: {
        get: function() {
          return this._roll;
        },
        set: function(v) {
          this._roll = Math.clamp(v, -3, 3);
          var r = ~~this._roll;
          if (-3 < r && r < 0) r += 1;
          this.frameX = (r + 3) / 8;
        },
      },
    },

  });
});
