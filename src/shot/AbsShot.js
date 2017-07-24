phina.namespace(() => {

  phina.define("passion.Shot", {
    superClass: "passion.Sprite",

    bx: 0,
    by: 0,
    power: 0,
    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", e => {
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
        const ShotClass = this;
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

        const shotPool = glLayer.shotDrawer.objParameters["shot"].pool;
        player.heatByShot = ShotClass.heatByShot;
        player.on("fireShot", e => {
          if (shotPool.length >= ShotClass.fireCount) {
            for (let i = 0; i < ShotClass.fireCount; i++) {
              const s = glLayer.shotDrawer.get("shot");
              if (s) {
                s.spawn(player, i, gameScene).addChildTo(glLayer);
                shots.push(s);
              }
            }
            // TODO 効果音
            // phina.asset.SoundManager.play("shot");
          }
        });

        shotPool.forEach(shot => {
          if (ShotClass.hitEffect) {
            shot.on("hit", e => {
              const effect = glLayer.topEffectDrawer.get("hitEffect");
              if (effect) {
                effect
                  .spawn({
                    x: shot.x,
                    y: shot.y,
                  })
                  .addChildTo(glLayer);
              }
            });
          }
          shot.on("removed", e => shots.erase(shot));
        });

        if (ShotClass.mazzleFlashEffect) {
          player.on("fireShot", e => {
            const effect = glLayer.effectDrawer.get("mazzleFlashEffect");
            if (effect) {
              effect
                .spawn({
                  x: player.x + ShotClass.mazzleFlashEffect.x,
                  y: player.y + ShotClass.mazzleFlashEffect.y,
                })
                .addChildTo(glLayer);
            }
          });
        }
      },
    },
  });

});
