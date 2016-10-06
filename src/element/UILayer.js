phina.namespace(function() {

  phina.define("passion.UILayer", {
    superClass: "phina.display.DisplayElement",

    init: function() {
      this.superInit();
      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          scoreBg: {
            className: "passion.UIFrame",
            arguments: {
              width: GAME_AREA_WIDTH * 0.96,
              height: GAME_AREA_HEIGHT * 0.05,
            },
            x: GAME_AREA_WIDTH * 0.01,
            y: GAME_AREA_HEIGHT * 0.00,
            originX: 0,
            originY: 0,
            children: {
              scoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "1,234,567,890",
                  align: "right",
                  baseline: "middle",
                  fontSize: GAME_AREA_HEIGHT * 0.04,
                },
                x: GAME_AREA_WIDTH * 0.96,
                y: GAME_AREA_HEIGHT * 0.04,
              },
            },
          },
          button: {
            className: "passion.CircleButton",
            arguments: {
              text: "B",
              radius: GAME_AREA_WIDTH * 0.08,
            },
            x: GAME_AREA_WIDTH * 0.10,
            y: GAME_AREA_HEIGHT * 0.94,
          },
          damage: {
            className: "phina.display.Sprite",
            arguments: this.damageTexture(),
            originX: 0,
            originY: 0,
            alpha: 0.0,
          },
        },
      });
    },

    damageTexture: function() {
      var c = phina.graphics.Canvas();
      c.setSize(GAME_AREA_WIDTH, GAME_AREA_HEIGHT);
      c.clearColor("transparent");
      var g = c.context.createRadialGradient(GAME_AREA_WIDTH / 2, GAME_AREA_HEIGHT / 2, 0, GAME_AREA_WIDTH / 2, GAME_AREA_HEIGHT / 2, GAME_AREA_HEIGHT / 2)
      g.addColorStop(0, "rgba(255, 0, 0, 0.0)");
      g.addColorStop(1, "rgba(255, 0, 0, 1.0)");
      c.fillStyle = g;
      c.fillRect(0, 0, GAME_AREA_WIDTH, GAME_AREA_HEIGHT);
      return c;
    },

  });
});
