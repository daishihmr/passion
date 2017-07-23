phina.namespace(function() {

  phina.define("passion.GameScene", {
    superClass: "phina.display.DisplayScene",

    gameManager: null,
    status: -1,

    shots: null,
    enemies: null,
    bullets: null,
    items: null,

    init: function(options) {
      this.superInit(options);

      var gameScene = this;
      var stageData = phina.asset.AssetManager.get("json", "stage").data;

      var r = phina.util.Random(12345);
      var randomFunc = function() {
        return r.random();
      };
      bulletml.Walker.random = randomFunc;

      this.gameManager = passion.GameManager(stageData, randomFunc);

      this.fromJSON({
        shots: [],
        enemies: [],
        bullets: [],
        items: [],
        children: {
          bg: {
            className: "phina.display.Sprite",
            arguments: passion.GameSceneBg.drawBgTexture(),
            originX: 0,
            originY: 0,
          },
          glLayer: {
            className: "passion.GLLayer",
          },
          uiLayer: {
            className: "passion.UILayer",
            arguments: this.gameManager,
            alpha: 0,
          },
        },
      });

      this.uiLayer.tweener.clear().fadeIn(500);

      var gameManager = this.gameManager;
      var glLayer = this.glLayer;

      glLayer.effectDrawer.addObjType("particle", {
        texture: "texture0.png",
        additiveBlending: true,
        count: 200,
      });
      glLayer.topEffectDrawer.addObjType("BulletEraseEffect", {
        className: "passion.BulletEraseEffect",
        texture: "bullets_erase.png",
        count: 200,
      });
      glLayer.topEffectDrawer.addObjType("particle", {
        className: "passion.Particle",
        texture: "texture0.png",
        count: 200,
        additiveBlending: true,
      });

      // 背景
      passion.Background.setup(glLayer, "bg", 1069);

      // 自機
      var playerSpec = {
        hp: 100,
      };
      this.player = passion.Player.setup(glLayer, playerSpec).addChildTo(glLayer);

      // ショット
      var shotClassName = "passion.WideShot2";
      var ShotClass = phina.using(shotClassName);
      ShotClass.setup(shotClassName, glLayer, this.player, this.shots, gameScene);

      // 敵
      stageData.enemies
        .map(function(enemy) {
          return phina.asset.AssetManager.get("json", enemy + ".enemy").data;
        })
        .map(function(enemyData) {
          return enemyData.texture;
        })
        .uniq()
        .forEach(function(textureName) {
          glLayer.enemyDrawer.addObjType(textureName, {
            className: "passion.Enemy",
            texture: textureName,
            count: 50,
          });
          glLayer.enemyDrawer.objParameters[textureName].pool.forEach(function(enemy) {
            enemy.on("removed", function() {
              enemies.erase(this);
            });
            enemy.on("killed", function() {
              this.playKilledEffect(gameScene);
            });
          });
        });
      var enemies = this.enemies;
      gameManager.on("spawnEnemy", function(e) {
        var enemyData = phina.asset.AssetManager.get("json", e.name + ".enemy").data;
        var enemy = glLayer.enemyDrawer.get(enemyData.texture)
        if (enemy) {
          enemy.spawn({}.$extend(enemyData, e, { x: e.x * GAME_AREA_WIDTH, y: e.y * GAME_AREA_HEIGHT }));
          enemy.addChildTo(glLayer);
          enemies.push(enemy);
        }
      });

      // 弾
      passion.Danmaku.setup(this);
      var bullets = this.bullets;
      this.on("spawnBullet", function(e) {
        var bullet = e.bullet;
        bullet.addChildTo(glLayer);
        bullets.push(bullet);
      });
      glLayer.bulletDrawer.pool.array.forEach(function(bullet) {
        bullet.on("removed", function() {
          bullets.erase(this);
        });
        bullet.on("erased", function() {
          var effect = glLayer.topEffectDrawer.get("BulletEraseEffect");
          if (effect) {
            effect
              .spawn({
                x: this.x,
                y: this.y,
                frameY: 0,
              })
              .addChildTo(glLayer);
          }
        });
      });

      this.uiLayer.showReadyGo(function() {
        gameScene.status = 0;
      });
    },

    update: function(app) {
      switch (this.status) {
        case 0:
          this.gameManager.update(app);
          this._hitTest();
          break;
      }

      var kb = app.keyboardEx;
      var gp = app.gamepadManager.get();
      if (gp.leftPressing || kb.leftPressing) console.log("left" + Date.now());
      if (gp.rightPressing || kb.rightPressing) console.log("right" + Date.now());
      if (gp.upPressing || kb.upPressing) console.log("up" + Date.now());
      if (gp.downPressing || kb.downPressing) console.log("down" + Date.now());
    },

    _hitTest: function() {
      this._hitTestItemPlayer();
      this._hitTestEnemyShot();
      this._hitTestEnemyPlayer();
      this._hitTestBulletPlayer();
    },

    _hitTestItemPlayer: function() {},

    _hitTestEnemyShot: function() {
      var es = this.enemies.clone();
      var ss = this.shots.clone();
      for (var i = 0; i < es.length; i++) {
        var e = es[i];
        for (var j = 0; j < ss.length; j++) {
          var s = ss[j];
          if (e.isHit(s)) {
            e.flare("damaged", { shot: s });
            s.flare("hit", { enemy: e });
          }
        }
      }
    },

    _hitTestEnemyPlayer: function() {
      var es = this.enemies.clone();
      var p = this.player;
      for (var i = 0; i < es.length; i++) {
        var e = es[i];
        if (e.isHit(p)) {
          p.flare("damaged", { another: e });
        }
      }
    },

    _hitTestBulletPlayer: function() {
      var bs = this.bullets.clone();
      var p = this.player;
      for (var i = 0; i < bs.length; i++) {
        var b = bs[i];
        if (b.isHit(p)) {
          p.flare("damaged", { another: b });
          b.remove();
        }
      }
    },

    eraseAllBullets: function() {
      this.bullets.clone().forEach(function(bullet) {
        bullet.flare("erased");
        bullet.remove();
      });
    },

    onspawnItem: function(e) {
      var item = e.item;
      item.addChildTo(this.glLayer);
      this.items.push(item);
    },

    onspawnParticle: function(e) {
      var EmitterClass = phina.using(e.className);
      var emitter = EmitterClass(this.glLayer, this.glLayer.topEffectDrawer);
      emitter.x = e.x;
      emitter.y = e.y;
      emitter.addChildTo(this.glLayer);
    }

  });
});
