phina.namespace(function() {

  phina.define("passion.UILayer", {
    superClass: "phina.display.DisplayElement",

    init: function(gameManager) {
      this.superInit();
      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          damage: {
            className: "phina.display.Sprite",
            arguments: this.damageTexture(),
            originX: 0,
            originY: 0,
            alpha: 0.0,
          },
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
                x: GAME_AREA_WIDTH * 0.55,
                y: GAME_AREA_HEIGHT * 0.04,
              },
              hi: {
                className: "phina.display.Label",
                arguments: {
                  text: "HI",
                  align: "left",
                  baseline: "middle",
                  fontSize: GAME_AREA_HEIGHT * 0.03,
                },
                x: GAME_AREA_WIDTH * 0.60,
                y: GAME_AREA_HEIGHT * 0.042,
              },
              highscoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "1,234,567,890",
                  align: "right",
                  baseline: "middle",
                  fontSize: GAME_AREA_HEIGHT * 0.03,
                },
                x: GAME_AREA_WIDTH * 0.96,
                y: GAME_AREA_HEIGHT * 0.042,
              },
            },
          },
          button: {
            className: "passion.CircleButton",
            arguments: {
              text: "BOMB",
              fontSize: 15,
              radius: GAME_AREA_WIDTH * 0.09,
            },
            x: GAME_AREA_WIDTH * 0.10,
            y: GAME_AREA_HEIGHT * 0.93,
          },
        },
      });

      var self = this;
      gameManager.on("updateScore", function() {
        self.scoreBg.scoreLabel.text = passion.Utils.sep(this.score);
        if (this.highScore < this.score) {
          self.scoreBg.highscoreLabel.text = passion.Utils.sep(this.highScore);
        }
      });
      gameManager.on("damage", function(e) {
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
