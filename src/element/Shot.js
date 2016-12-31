phina.namespace(function() {

  var commonSetup = function(shotClassName, glLayer, player, shots, gameScene) {
    var ShotClass = this;
    glLayer.shotDrawer.addObjType("shot", {
      className: shotClassName,
      texture: ShotClass.texture || "bullets.png",
      additiveBlending: ShotClass.additiveBlending || false,
      count: ShotClass.count || 9,
    });

    // 着弾エフェクト
    if (ShotClass.hitEffect) {
      glLayer.topEffectDrawer.addObjType("hitEffect", ShotClass.hitEffect);
    }

    // 発射口エフェクト
    if (ShotClass.mazzleFlashEffect) {
      glLayer.effectDrawer.addObjType("mazzleFlashEffect", ShotClass.mazzleFlashEffect);
    }

    var shotPool = glLayer.shotDrawer.objParameters["shot"].pool;
    player.heatByShot = ShotClass.heatByShot;
    player.on("fireShot", function(e) {
      if (shotPool.length >= ShotClass.fireCount) {
        for (var i = 0; i < ShotClass.fireCount; i++) {
          var s = glLayer.shotDrawer.get("shot");
          if (s) {
            s.spawn(this, i, gameScene).addChildTo(glLayer);
            shots.push(s);
          }
        }
        // TODO 効果音
        // phina.asset.SoundManager.play("shot");
      }
    });

    shotPool.forEach(function(shot) {
      if (ShotClass.hitEffect) {
        shot.on("hit", function() {
          var effect = glLayer.topEffectDrawer.get("hitEffect");
          if (effect) {
            effect
              .spawn({
                x: this.x,
                y: this.y,
              })
              .addChildTo(glLayer);
          }
        });
      }
      shot.on("removed", function() {
        shots.erase(this);
      });
    });

    if (ShotClass.mazzleFlashEffect) {
      player.on("fireShot", function(e) {
        var effect = glLayer.effectDrawer.get("mazzleFlashEffect");
        if (effect) {
          effect
            .spawn({
              x: this.x + ShotClass.mazzleFlashEffect.x,
              y: this.y + ShotClass.mazzleFlashEffect.y,
            })
            .addChildTo(glLayer);
        }
      });
    }
  };

  phina.define("passion.Shot", {
    superClass: "passion.Sprite",

    bx: 0,
    by: 0,
    power: 0,
    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        this.bx = this.x;
        this.by = this.y;
        this.controll(e.app);
        this.age += 1;
      });
    },

    spawn: function(options) {
      this.superMethod("spawn", options);
      this.age = 0;
      return this;
    },

    controll: function(app) {},
  });

  phina.define("passion.NormalShot", {
    superClass: "passion.Shot",

    _static: {
      setup: commonSetup,
      count: 9,
      heatByShot: 8,
      fireCount: 3,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 9,
      },
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.superMethod("spawn", {
        x: player.x + [-1, 1, 0][index] * 10,
        y: player.y - 30 + [0, 0, -1][index] * 10,
        rotation: -Math.PI * 0.5,
        scaleX: 48,
        scaleY: 48,
        frameX: 1 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      });
      return this;
    },

    controll: function(app) {
      this.y -= 20;
      if (this.y < GAME_AREA_HEIGHT * -0.1) {
        this.remove();
      }
    },

    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.NormalShot2", {
    superClass: "passion.Shot",

    _static: {
      setup: commonSetup,
      count: 18,
      heatByShot: 8,
      fireCount: 5,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 18,
      },
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.superMethod("spawn", {
        x: player.x + [-2, 2, -1, 1, 0][index] * 10,
        y: player.y - 30 + [1, 1, 0, 0, -1][index] * 10,
        rotation: -Math.PI * 0.5,
        scaleX: 48,
        scaleY: 48,
        frameX: 1 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      });
      return this;
    },

    controll: function(app) {
      this.y -= 20;
      if (this.y < GAME_AREA_HEIGHT * -0.1) {
        this.remove();
      }
    },

    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.WideShot", {
    superClass: "passion.Shot",

    _static: {
      setup: commonSetup,
      count: 9,
      heatByShot: 6,
      fireCount: 3,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 9,
      },
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.superMethod("spawn", {
        x: player.x + [-1, 1, 0][index] * 20,
        y: player.y,
        rotation: -Math.PI * 0.5 + [-1, 1, 0][index] * 0.2,
        scaleX: 48,
        scaleY: 48,
        frameX: 1 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      });

      this.dx = Math.cos(this.rotation) * 20;
      this.dy = Math.sin(this.rotation) * 20;
      return this;
    },

    controll: function(app) {
      this.x += this.dx;
      this.y += this.dy;
      if (this.y < GAME_AREA_HEIGHT * -0.1 || this.x < GAME_AREA_WIDTH * -0.1 || GAME_AREA_WIDTH * 1.1 < this.x) {
        this.remove();
      }
    },

    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.WideShot2", {
    superClass: "passion.Shot",

    _static: {
      setup: commonSetup,
      count: 27,
      heatByShot: 6,
      fireCount: 9,
      additiveBlending: false,
      hitEffect: {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 27,
      },
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      var d = ~~(index / 3);
      var i = index % 3;

      this.superMethod("spawn", {
        x: player.x + [-1, 1, 0][d] * 30 + [-1, 1, 0][i] * 10,
        y: player.y,
        rotation: -Math.PI * 0.5 + [-1, 1, 0][d] * 0.2,
        scaleX: 48,
        scaleY: 48,
        frameX: 1 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      });

      this.dx = Math.cos(this.rotation) * 20;
      this.dy = Math.sin(this.rotation) * 20;
      return this;
    },

    controll: function(app) {
      this.x += this.dx;
      this.y += this.dy;
      if (this.y < GAME_AREA_HEIGHT * -0.1 || this.x < GAME_AREA_WIDTH * -0.1 || GAME_AREA_WIDTH * 1.1 < this.x) {
        this.remove();
      }
    },

    onhit: function(e) {
      this.remove();
    },
  });

  phina.define("passion.Laser", {
    superClass: "passion.Shot",

    _static: {
      setup: commonSetup,
      count: 20,
      heatByShot: 1,
      fireCount: 1,
      additiveBlending: true,
      texture: "effect.png",
      mazzleFlashEffect: {
        className: "passion.LaserMazzleFlash",
        texture: "effect.png",
        count: 20,
        additiveBlending: true,
        x: 0,
        y: -10,
      }
    },

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.power = 1;
    },

    spawn: function(player, index, gameScene) {
      this.player = player;
      var f = Math.randint(6, 8);
      this.superMethod("spawn", {
        x: player.x,
        y: player.y - 30,
        rotation: -Math.PI * 0.5,
        scaleX: 84,
        scaleY: 84,
        frameX: (f % 8) / 8,
        frameY: ~~(f / 8) / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      });
      return this;
    },

    controll: function(app) {
      this.x = this.player.x;
      this.y -= 30;
      this.scaleX = Math.min(this.scaleY + 80, 250);
      this.scaleY = Math.max(this.scaleY - 32, 16);
      if (this.y < GAME_AREA_HEIGHT * -0.1) {
        this.remove();
      }
    },

    onhit: function(e) {
      if (e.enemy.hp > 0) {
        this.remove();
      }
    },
  });

});
