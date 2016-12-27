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
        bulletml.Walker.random = function() {
          return gameScene.random.random();
        };

        this.config = {
          target: player,
          createNewBullet: function(runner, spec) {
            var bullet = bulletDrawer.get();
            if (bullet) {
              bullet.spawn({
                type: spec.type,
                scale: 32,
              });
              bullet.bulletRunning.setRunner(runner);
              gameScene.flare("spawnBullet", { bullet: bullet });
            }
          },
        };

        return this.config;
      },

      createRunner: function(name) {
        var bulletmlDoc = phina.asset.AssetManager.get("xml", name);
        var pattern = bulletml.buildXML(bulletmlDoc.data);
        var config = passion.Danmaku.config;
        return pattern.createRunner(config);
      },
    },

    init: function() {},
  });
  
  phina.asset.AssetLoader.assetLoadFunctions["bulletml"] = phina.asset.AssetLoader.assetLoadFunctions["xml"];

});
