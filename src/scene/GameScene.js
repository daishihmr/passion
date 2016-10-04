phina.namespace(function() {

  phina.define("passion.GameScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
      this.superInit();

      var bgTexture = phina.graphics.Canvas();
      bgTexture.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      bgTexture.clearColor("hsl(220, 70%, 20%)");
      bgTexture.strokeStyle = "hsl(220, 70%, 60%)";
      (90).times(function(i, j) {
        bgTexture.drawLine(0, SCREEN_HEIGHT / j * i, SCREEN_WIDTH, SCREEN_HEIGHT / j * i);
      });
      (60).times(function(i, j) {
        bgTexture.drawLine(SCREEN_WIDTH / j * i, 0, SCREEN_WIDTH / j * i, SCREEN_HEIGHT);
      });

      this.fromJSON({
        children: {
          bg: {
            className: "phina.display.Sprite",
            arguments: bgTexture,
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
      
      this.glLayer.playerDrawer.addObjType("test", {
        className: "passion.Player",
        texture: "test.png",
      });
      
      var player = this.glLayer.playerDrawer.get("test");
      player.spawn();
      player.addChildTo(this.glLayer);
      player.x = 100;
      player.y = 100;
    },

  });
});
