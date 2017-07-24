phina.namespace(() => {

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

      const gameScene = this;
      const stageData = phina.asset.AssetManager.get("json", "stage").data;

      const r = phina.util.Random(12345);
      const randomFunc = () => r.random();
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

      const gameManager = this.gameManager;
      const glLayer = this.glLayer;

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
      const playerSpec = {
        hp: 100,
      };
      this.player = passion.Player.setup(glLayer, playerSpec).addChildTo(glLayer);

      // ショット
      const shotClassName = "passion.WideShot2";
      const ShotClass = phina.using(shotClassName);
      ShotClass.setup(shotClassName, glLayer, this.player, this.shots, gameScene);

      // 敵
      stageData.enemies
        .map(enemy => phina.asset.AssetManager.get("json", enemy + ".enemy").data)
        .map(enemyData => enemyData.texture)
        .uniq()
        .forEach(textureName => {
          glLayer.enemyDrawer.addObjType(textureName, {
            className: "passion.Enemy",
            texture: textureName,
            count: 50,
          });
          glLayer.enemyDrawer.objParameters[textureName].pool.forEach(enemy => {
            enemy.on("removed", e => enemies.erase(enemy));
            enemy.on("killed", e => enemy.playKilledEffect(gameScene));
          });
        });
      const enemies = this.enemies;
      gameManager.on("spawnEnemy", e => {
        const enemyData = phina.asset.AssetManager.get("json", e.name + ".enemy").data;
        const enemy = glLayer.enemyDrawer.get(enemyData.texture)
        if (enemy) {
          enemy.spawn({}.$extend(enemyData, e, { x: e.x * GAME_AREA_WIDTH, y: e.y * GAME_AREA_HEIGHT }));
          enemy.addChildTo(glLayer);
          enemies.push(enemy);
        }
      });

      // 弾
      passion.Danmaku.setup(this);
      const bullets = this.bullets;
      this.on("spawnBullet", e => {
        const bullet = e.bullet;
        bullet.addChildTo(glLayer);
        bullets.push(bullet);
      });
      glLayer.bulletDrawer.pool.array.forEach(bullet => {
        bullet.on("removed", e => bullets.erase(e));
        bullet.on("erased", e => {
          const effect = glLayer.topEffectDrawer.get("BulletEraseEffect");
          if (effect) {
            effect
              .spawn({
                x: bullet.x,
                y: bullet.y,
                frameY: 0,
              })
              .addChildTo(glLayer);
          }
        });
      });

      this.uiLayer.showReadyGo(() => gameScene.status = 0);
    },

    update: function(app) {
      switch (this.status) {
        case 0:
          this.gameManager.update(app);
          this._hitTest();
          break;
      }

      const kb = app.keyboardEx;
      const gp = app.gamepadManager.get();
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
      const es = this.enemies.clone();
      const ss = this.shots.clone();
      for (let i = 0; i < es.length; i++) {
        const e = es[i];
        for (let j = 0; j < ss.length; j++) {
          const s = ss[j];
          if (e.isHit(s)) {
            e.flare("damaged", { shot: s });
            s.flare("hit", { enemy: e });
          }
        }
      }
    },

    _hitTestEnemyPlayer: function() {
      const es = this.enemies.clone();
      const p = this.player;
      for (let i = 0; i < es.length; i++) {
        const e = es[i];
        if (e.isHit(p)) {
          p.flare("damaged", { another: e });
        }
      }
    },

    _hitTestBulletPlayer: function() {
      const bs = this.bullets.clone();
      const p = this.player;
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        if (b.isHit(p)) {
          p.flare("damaged", { another: b });
          b.remove();
        }
      }
    },

    eraseAllBullets: function() {
      this.bullets.clone().forEach(bullet => {
        bullet.flare("erased");
        bullet.remove();
      });
    },

    onspawnItem: function(e) {
      const item = e.item;
      item.addChildTo(this.glLayer);
      this.items.push(item);
    },

    onspawnParticle: function(e) {
      const EmitterClass = phina.using(e.className);
      const emitter = EmitterClass(this.glLayer, this.glLayer.topEffectDrawer);
      emitter.x = e.x;
      emitter.y = e.y;
      emitter.addChildTo(this.glLayer);
    },

  });
});