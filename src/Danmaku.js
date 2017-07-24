phina.namespace(() => {

  phina.define("passion.Danmaku", {
    _static: {

      config: null,

      setup: function(gameScene) {
        const player = gameScene.player;
        const bullets = gameScene.bullets;
        const enemies = gameScene.enemies;
        const glLayer = gameScene.glLayer;
        const bulletDrawer = glLayer.bulletDrawer;
        const enemyDrawer = glLayer.enemyDrawer;
        bulletml.Walker.random = function() {
          return gameScene.random.random();
        };

        this.config = {
          target: player,
          createNewBullet: function(runner, spec) {
            const bullet = bulletDrawer.get();
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
        const bulletmlDoc = phina.asset.AssetManager.get("xml", name);
        const pattern = bulletml.buildXML(bulletmlDoc.data);
        const config = passion.Danmaku.config;
        return pattern.createRunner(config);
      },
    },

    init: function() {},
  });
  
  phina.asset.AssetLoader.assetLoadFunctions["bulletml"] = phina.asset.AssetLoader.assetLoadFunctions["xml"];

});
