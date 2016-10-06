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
            className: "passion.UILayer",
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

      this.glLayer.effectDrawer.addObjType("effect", {
        texture: "texture0.png",
        additiveBlending: true,
        count: 500,
      });
      this.on("enterframe", function(e) {
        if (e.app.ticker.frame % 2 !== 0) return;
        var hex = this.glLayer.effectDrawer.get("effect");
        if (hex) {
          var dx = Math.randfloat(-1, 1);
          hex.onenterframe = function() {
            this.x += dx;
            this.y += 2;
            this.alpha *= 0.9;
            if (this.alpha < 0.01) {
              this.remove();
            }
          };
          var s = Math.randfloat(22, 32);
          hex.spawn({
            scaleX: s,
            scaleY: s,
            frameX: 7 / 8,
            frameY: 0 / 8,
            frameW: 1 / 8,
            frameH: 1 / 8,
            red: 0.2,
            green: 1.0,
            blue: 0.8,
            alpha: 1.0,
          });
          hex.addChildTo(this.glLayer);
          hex.x = player.x;
          hex.y = player.y + 15;
        }
      });

      this.glLayer.playerDrawer.addObjType("player", {
        className: "passion.Player",
        texture: "texture0.png",
      });

      var player = this.glLayer.playerDrawer.get("player");
      player.spawn();
      player.addChildTo(this.glLayer);
      player.x = 100;
      player.y = 100;

      this.glLayer.topEffectDrawer.addObjType("effect", {
        texture: "texture0.png",
        count: 2,
        // additiveBlending: true,
      });
      var marker1 = this.glLayer.topEffectDrawer.get("effect");
      marker1.spawn({
        scaleX: 14,
        scaleY: 14,
        frameX: 7 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 0.4,
        green: 2.0,
        blue: 1.6,
        alpha: 1.0,
      });
      marker1.addChildTo(this.glLayer);
      marker1.on("enterframe", function() {
        this.x = player.x;
        this.y = player.y;
        this.rotation += 0.1;
      });
      var marker2 = this.glLayer.topEffectDrawer.get("effect");
      marker2.spawn({
        scaleX: 8,
        scaleY: 8,
        frameX: 7 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 0.4,
        green: 2.0,
        blue: 1.6,
        alpha: 1.0,
        rotation: 0.5,
      });
      marker2.addChildTo(this.glLayer);
      marker2.on("enterframe", function() {
        this.x = player.x;
        this.y = player.y;
        this.rotation += 0.1;
      });
      var marker3 = this.glLayer.effectDrawer.get("effect");
      marker3.spawn({
        scaleX: 80,
        scaleY: 80,
        frameX: 0 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 2.0,
        green: 2.0,
        blue: 2.0,
        alpha: 0.3,
      });
      marker3.addChildTo(this.glLayer);
      marker3.on("enterframe", function() {
        this.x = player.x;
        this.y = player.y;
      });

      bulletml.dsl();
      var ptn = new bulletml.Root({
        top0: action([
          repeat(Infinity, [
            repeat(50, [
              fire(bullet({ type: 9 }), direction(7, "sequence"), speed(3.0)),
              fire(bullet({ type: 1 }), direction(90, "sequence"), speed(2.0)),
              fire(bullet({ type: 9 }), direction(90, "sequence"), speed(3.0)),
              fire(bullet({ type: 1 }), direction(90, "sequence"), speed(2.0)),
              fire(bullet({ type: 9 }), direction(90, "sequence"), speed(3.0)),
              wait(1),
            ]),
            wait(120),
          ]),
        ]),
      });

      var glLayer = this.glLayer;
      var bulletDrawer = this.glLayer.bulletDrawer;

      var runner = ptn.createRunner({
        target: player,
        createNewBullet: function(runner, spec) {
          var b = bulletDrawer.get();
          if (b) {
            b.spawn(runner, {
              type: spec.type,
              scale: 32,
            });
            b.addChildTo(glLayer);
          }
        },
      });
      player.on("enterframe", function() {
        runner.x = this.x;
        runner.y = this.y;
        runner.update();
      });
    },

    drawBgTexture: function() {
      var bgTexture = phina.graphics.Canvas();
      bgTexture.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      bgTexture.clearColor("hsla(190, 100%, 95%, 0.1)");
      (150).times(function(i, j) {
        var y = (SCREEN_HEIGHT * 1.5) / j * i;
        bgTexture.strokeStyle = "hsla(190, 100%, 95%, 0.2)";
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
        bgTexture.strokeStyle = "hsla(190, 100%, 65%, 0.2)";
        y += 1;
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
        bgTexture.strokeStyle = "hsla(190, 100%, 35%, 0.2)";
        y += 1;
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
