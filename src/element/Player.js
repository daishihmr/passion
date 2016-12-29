phina.namespace(function() {

  phina.define("passion.Player", {
    superClass: "passion.Sprite",

    _static: {
      setup: function(glLayer, spec) {
        glLayer.playerDrawer.addObjType("player", {
          className: "passion.Player",
          texture: "texture0.png",
        });

        var player = glLayer.playerDrawer.get("player");
        player.spawn(spec);

        player.on("enterframe", function(e) {
          if (e.app.ticker.frame % 2 !== 0) return;

          var hex1 = glLayer.effectDrawer.get("particle");
          var hex2 = glLayer.effectDrawer.get("particle");
          var options = {
            x: player.x - 8,
            y: player.y + 15,
            scaleX: 18,
            scaleY: 18,
            frameX: 7 / 8,
            frameY: 0 / 8,
            frameW: 1 / 8,
            frameH: 1 / 8,
            red: 1.0,
            green: 1.0,
            blue: 1.0,
            alpha: 1.0,
          };
          var oefl = function() {
            this.y += 2;
            this.alpha *= 0.80;
            if (this.alpha < 0.01) {
              this.remove();
            }
          };

          if (hex1) {
            options.x = player.x - 8;
            hex1.spawn(options);
            hex1.onenterframe = oefl;
            hex1.addChildTo(glLayer);
          }

          if (hex2) {
            options.x = player.x + 8;
            hex2.spawn(options);
            hex2.onenterframe = oefl;
            hex2.addChildTo(glLayer);
          }
        });

        var aura = glLayer.effectDrawer.get("particle");
        aura.spawn({
          x: player.x,
          y: player.y,
          scaleX: 80,
          scaleY: 80,
          frameX: 0 / 8,
          frameY: 1 / 8,
          frameW: 1 / 8,
          frameH: 1 / 8,
          red: 2.0,
          green: 2.0,
          blue: 2.0,
          alpha: 0.2,
        });
        aura.addChildTo(glLayer);
        aura.on("enterframe", function() {
          this.x = player.x;
          this.y = player.y;
        });

        var centerMarker = glLayer.topEffectDrawer.get("particle");
        centerMarker.spawn({
          x: player.x,
          y: player.y,
          scaleX: 14,
          scaleY: 14,
          frameX: 7 / 8,
          frameY: 0 / 8,
          frameW: 1 / 8,
          frameH: 1 / 8,
          red: 0.4,
          green: 2.0,
          blue: 1.6,
          alpha: 1.0,
        });
        centerMarker.addChildTo(player);
        centerMarker.on("enterframe", function() {
          this.x = player.x;
          this.y = player.y;
          this.rotation += 0.1;
        });

        return player;
      },
    },
    
    hp: 0,

    _roll: 0,
    heat: 0,
    heatByShot: 0,

    fireable: true,
    controllable: true,
    mutekiTime: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.controll(e.app);
        if (this.mutekiTime > 0) this.mutekiTime -= 1;
      });
    },

    spawn: function(spec) {
      this.superMethod("spawn", {
        x: GAME_AREA_WIDTH * 0.5,
        y: GAME_AREA_HEIGHT * 0.9,
        scaleX: 64,
        scaleY: 64,
        frameX: 3 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.2,
        green: 1.2,
        blue: 1.2,
      });
      
      this.hp = spec.hp;

      return this;
    },

    controll: function(app) {
      if (this.controllable) {
        var p = app.pointer;
        var dp = p.deltaPosition;

        if (phina.isMobile() || p.getPointing()) {
          this.x += dp.x * 2;
          this.y += dp.y * 2;
          if (dp.x < 0) {
            this.roll -= 0.2;
          } else if (0 < dp.x) {
            this.roll += 0.2;
          }

          this.x = Math.clamp(this.x, 5, GAME_AREA_WIDTH - 5);
          this.y = Math.clamp(this.y, 40, GAME_AREA_HEIGHT - 5);
        }
      }

      if (!this.controllable || dp.x == 0) {
        this.roll *= 0.9;
        if (-0.01 < this.roll && this.roll < 0.01) {
          this.roll = 0;
        }
      }

      if (this.fireable) {
        var touch = (!phina.isMobile() && p.getPointing()) || (phina.isMobile() && app.pointers.length > 0);
        if (touch && this.heat <= 0) {
          this.flare("fireShot");
          this.heat = this.heatByShot;
        }
      }

      this.heat -= 1;
    },

    ondamaged: function(e) {
      if (this.mutekiTime > 0) return;

      var another = e.another;
    },

    _accessor: {
      roll: {
        get: function() {
          return this._roll;
        },
        set: function(v) {
          this._roll = Math.clamp(v, -3, 3);
          var r = ~~this._roll;
          this.frameX = (r + 3) / 8;
        },
      },
    },

  });
});
