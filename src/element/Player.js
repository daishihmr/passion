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
        red: 1.2,
        green: 1.2,
        blue: 1.2,
      });
      return this;
    },

    controll: function(app) {
      var p = app.pointer;
      var dp = p.deltaPosition;

      if (phina.isMobile() || (!phina.isMobile() && p.getPointing())) {
        this.x += dp.x * 2;
        this.y += dp.y * 2;
        if (dp.x < 0) {
          this.roll -= 0.2;
        } else if (0 < dp.x) {
          this.roll += 0.2;
        } else {
          this.roll *= 0.9;
          if (-0.1 < this.roll && this.roll < 0.1) {
            this.roll = 0;
          }
        }

        this.x = Math.clamp(this.x, 5, GAME_AREA_WIDTH - 5);
        this.y = Math.clamp(this.y, 5, GAME_AREA_HEIGHT - 5);
      }
    },
    
    _accessor: {
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
