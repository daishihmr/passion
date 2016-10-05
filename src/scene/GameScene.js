phina.namespace(function() {

  phina.define("passion.GameScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
      this.superInit();

      this.fromJSON({
        children: {
          bg: {
            className: "phina.display.Sprite",
            arguments: this.drawBgTexture(),
            originX: 0,
            originY: 0,
          },
          glLayer: {
            className: "passion.GLLayer",
          },
          uiLayer: {
            className: "phina.display.DisplayElement",
            originX: 0,
            originY: 0,
          },
        },
      });

      this.glLayer.bgDrawer.addObjType("bg", {
        className: "passion.Background",
        texture: "test.png",
        count: 2,
      });
      var bg = this.glLayer.bgDrawer.get("bg");
      bg.spawn();
      bg.x = GAME_AREA_WIDTH / 2;
      bg.y = GAME_AREA_HEIGHT / 2;
      bg.addChildTo(this.glLayer);
      var bg2 = this.glLayer.bgDrawer.get("bg");
      bg2.spawn();
      bg2.x = GAME_AREA_WIDTH / 2;
      bg2.y = GAME_AREA_HEIGHT / 2 - 640;
      bg2.addChildTo(this.glLayer);

      this.glLayer.playerDrawer.addObjType("player", {
        className: "passion.Player",
        texture: "texture0.png",
      });

      var player = this.glLayer.playerDrawer.get("player");
      player.spawn();
      player.addChildTo(this.glLayer);
      player.x = 100;
      player.y = 100;
    },

    drawBgTexture: function() {
      var bgTexture = phina.graphics.Canvas();
      bgTexture.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      bgTexture.clearColor("hsla(190, 100%, 95%, 0.1)");
      bgTexture.strokeStyle = "hsla(190, 100%, 95%, 0.2)";
      (100).times(function(i, j) {
        var y = (SCREEN_HEIGHT * 1.5) / j * i;
        bgTexture.strokeLines(
          SCREEN_WIDTH * 0.0, y - 10,
          SCREEN_WIDTH * 0.1, y - 10,
          SCREEN_WIDTH * 0.2, y + 20,
          SCREEN_WIDTH * 0.5, y + 20,
          SCREEN_WIDTH * 0.6, y - 30,
          SCREEN_WIDTH * 0.7, y - 30,
          SCREEN_WIDTH * 0.8, y - 50,
          SCREEN_WIDTH * 1.0, y - 50
        );
      });
      return bgTexture;
    },

  });
});
