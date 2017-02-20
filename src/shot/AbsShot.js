phina.namespace(function() {

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

    _static: {
      commonSetup: function(shotClassName, glLayer, player, shots, gameScene) {
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
      },
    },
  });

});
