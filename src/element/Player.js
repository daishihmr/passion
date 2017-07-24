phina.namespace(() => {

  phina.define("passion.Player", {
    superClass: "passion.Sprite",

    _static: {
      setup: function(glLayer, spec) {
        glLayer.playerDrawer.addObjType("player", {
          className: "passion.Player",
          texture: "texture0.png",
        });

        const player = glLayer.playerDrawer.get("player");
        player.spawn(spec);

        player.on("enterframe", e => {
          if (e.app.ticker.frame % 2 !== 0) return;

          const hex1 = glLayer.effectDrawer.get("particle");
          const hex2 = glLayer.effectDrawer.get("particle");
          const options = {
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

          if (hex1) {
            options.x = player.x - 8;
            hex1.spawn(options);
            hex1.onenterframe = e => {
              hex1.y += 2;
              hex1.alpha *= 0.80;
              if (hex1.alpha < 0.01) {
                hex1.remove();
              }
            };
            hex1.addChildTo(glLayer);
          }

          if (hex2) {
            options.x = player.x + 8;
            hex2.spawn(options);
            hex2.onenterframe = e => {
              hex2.y += 2;
              hex2.alpha *= 0.80;
              if (hex2.alpha < 0.01) {
                hex2.remove();
              }
            };
            hex2.addChildTo(glLayer);
          }
        });

        const aura = glLayer.effectDrawer.get("particle");
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
        aura.on("enterframe", e => {
          aura.x = player.x;
          aura.y = player.y;
        });

        const centerMarker = glLayer.topEffectDrawer.get("particle");
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
        centerMarker.on("enterframe", e => {
          centerMarker.x = player.x;
          centerMarker.y = player.y;
          centerMarker.rotation += 0.1;
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
      this.on("enterframe", e => {
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
      const p = app.pointer;
      const dp = p.deltaPosition;

      if (this.controllable) {

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
        const touch = (!phina.isMobile() && p.getPointing()) || (phina.isMobile() && app.pointers.length > 0);
        if (touch && this.heat <= 0) {
          this.flare("fireShot");
          this.heat = this.heatByShot;
        }
      }

      this.heat -= 1;
    },

    ondamaged: function(e) {
      if (this.mutekiTime > 0) return;

      const another = e.another;
    },

    _accessor: {
      roll: {
        get: function() {
          return this._roll;
        },
        set: function(v) {
          this._roll = Math.clamp(v, -3, 3);
          const r = ~~this._roll;
          this.frameX = (r + 3) / 8;
        },
      },
    },

  });
});