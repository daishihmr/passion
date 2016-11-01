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
              text: "HYPER",
              fontSize: 15,
              radius: GAME_AREA_WIDTH * 0.09,
            },
            x: GAME_AREA_WIDTH * 0.12,
            y: GAME_AREA_HEIGHT * 0.92,
          },
          readyLabels: {
            className: "phina.display.DisplayElement",
            x: GAME_AREA_WIDTH * 0.5,
            y: GAME_AREA_HEIGHT * 0.5,
            children: "Ready".split("").map(function(c, i) {
              return {
                className: "phina.display.Label",
                arguments: {
                  text: c,
                  align: "center",
                  baseline: "middle",
                  fontSize: 60,
                },
                x: ("Ready".length * -0.5 + i + 0.5) * 60 * 0.56,
              };
            }),
            visible: false,
          },
          goLabel: {
            className: "phina.display.Label",
            arguments: {
              text: "GO!!",
              align: "center",
              baseline: "middle",
              fontSize: 60,
            },
            x: GAME_AREA_WIDTH * 0.5,
            y: GAME_AREA_HEIGHT * 0.5,
            visible: false,
          }
        },
      });

      var self = this;
      gameManager.on("updateScore", function() {
        self.scoreBg.scoreLabel.text = passion.Utils.sep(this.score);
        if (this.highScore < this.score) {
          self.scoreBg.highscoreLabel.text = passion.Utils.sep(this.highScore);
        }
      });
      gameManager.on("damaged", function(e) {});
    },

    showReadyGo: function(callback) {
      this.readyLabels.visible = true;
      this.goLabel.visible = true;

      this.readyLabels.children.forEach(function(label, i) {
        label.tweener
          .set({
            scaleX: 4,
            scaleY: 4,
            alpha: 0,
          })
          .wait(i * 200)
          .to({
            scaleX: 1,
            scaleY: 1,
            alpha: 1
          }, 200)
          .wait(500 + ("Ready".length - i) * 200)
          .to({
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
          }, 100);
      });
      this.goLabel.tweener
        .set({
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
        })
        .wait(900 + "Ready".length * 200)
        .to({
          scaleX: 1,
          scaleY: 1,
          alpha: 1
        }, 200)
        .wait(500)
        .to({
          scaleX: 5,
          scaleY: 5,
          alpha: 0,
        }, 200)
        .call(function() {
          this.readyLabels.visible = false;
          this.goLabel.visible = false;
          callback();
        }.bind(this));
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
