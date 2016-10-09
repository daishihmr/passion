phina.namespace(function() {

  phina.define("passion.Danmaku", {
    _static: {
      config: null,
      setup: function(gameScene) {
        var player = gameScene.player;
        var bullets = gameScene.bullets;
        var enemies = gameScene.enemies;
        var glLayer = gameScene.glLayer;
        var bulletDrawer = glLayer.bulletDrawer;
        var enemyDrawer = glLayer.enemyDrawer;

        this.config = {
          target: player,
          createNewBullet: function(runner, spec) {
            if (spec.missile) {
              var missile = enemyDrawer.get("enemy");
              if (missile) {
                missile.spawn({
                  x: runner.x,
                  y: runner.y,
                  rotation: runner.direction,
                  scaleX: 32,
                  scaleY: 32,
                  frameX: 0,
                  frameY: 0,
                  frameW: 1 / 8,
                  frameH: 1 / 8,
                });
                missile.isMissile = true;
                missile.runner = runner;
                missile.addChildTo(glLayer);
                enemies.push(missile);
              }
            } else {
              var bullet = bulletDrawer.get();
              if (bullet) {
                bullet.spawn(runner, {
                  type: spec.type,
                  scale: 32,
                });
                bullet.addChildTo(glLayer);
                bullets.push(bullet);
              }
            }
          },
        };

        return this.config;
      },
    },

    init: function() {},
  });
});
