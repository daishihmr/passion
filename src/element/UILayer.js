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
            x: GAME_AREA_WIDTH * passion.GLLayer.padding,
            y: GAME_AREA_HEIGHT * passion.GLLayer.padding,
          },
          scoreBg: {
            className: "passion.UIFrame",
            arguments: {
              width: SCREEN_WIDTH * 0.96,
              height: SCREEN_HEIGHT * 0.05,
            },
            x: SCREEN_WIDTH * 0.00,
            y: SCREEN_HEIGHT * 0.00,
            originX: 0,
            originY: 0,
            children: {
              scoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "9,991,234,567,890",
                  align: "right",
                  baseline: "middle",
                  fontSize: SCREEN_HEIGHT * 0.035,
                },
                x: SCREEN_WIDTH * 0.96,
                y: SCREEN_HEIGHT * 0.038,
              },
              hi: {
                className: "phina.display.Label",
                arguments: {
                  text: "HI",
                  align: "left",
                  baseline: "middle",
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.04,
                y: SCREEN_HEIGHT * 0.035,
              },
              highscoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "9,991,234,567,890",
                  align: "right",
                  baseline: "middle",
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.44,
                y: SCREEN_HEIGHT * 0.035,
              },
            },
          },
          messageWindow: {
            className: "passion.UIFrame",
            arguments: {
              width: SCREEN_WIDTH * 0.96,
              height: SCREEN_HEIGHT * 0.14,
            },
            x: SCREEN_WIDTH * 0.0,
            y: SCREEN_HEIGHT * 0.84,
            originX: 0,
            originY: 0,
            // visible: false,
            children: {
              nameLabel: {
                className: "passion.UIHead2Label",
                arguments: {
                  text: "オペ子",
                  width: SCREEN_WIDTH * 0.30,
                  height: SCREEN_HEIGHT * 0.03,
                  fontSize: 18,
                  fontFamily: "main, message",
                },
                x: SCREEN_WIDTH * 0.20,
                y: SCREEN_HEIGHT * 0.034,
                visible: false,
              },
              mesasgeLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "WARNING!!\n今までにない強大な力が近づいてきます！\n気をつけてください！！",
                  align: "left",
                  baseline: "top",
                  fontSize: 16,
                  lineHeight: 1.1,
                  fontFamily: "main, message",
                },
                x: SCREEN_WIDTH * 0.05,
                y: SCREEN_HEIGHT * 0.076,
                visible: false,
              },
            },
          },
          bombButton: {
            className: "passion.CircleButton",
            arguments: {
              text: "BOMB",
              fontSize: 15,
              radius: GAME_AREA_WIDTH * 0.09,
            },
            x: GAME_AREA_WIDTH * 0.12,
            y: GAME_AREA_HEIGHT * 0.92,
            // y: GAME_AREA_HEIGHT * 1.085,
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
      gameManager.on("damage", function(e) {});
    },

    damageTexture: function() {
      var c = phina.graphics.Canvas();
      var p = passion.GLLayer.padding;
      c.setSize(GAME_AREA_WIDTH * (1 - p * 2), GAME_AREA_HEIGHT * (1 - p * 2));
      c.clearColor("transparent");
      var g = c.context.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.height / 2)
      g.addColorStop(0, "rgba(255, 0, 0, 0.0)");
      g.addColorStop(1, "rgba(255, 0, 0, 1.0)");
      c.fillStyle = g;
      c.fillRect(0, 0, c.width, c.height);
      return c;
    },

  });
});
