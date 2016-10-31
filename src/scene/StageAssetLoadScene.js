phina.namespace(function() {

  phina.define("passion.StageAssetLoadScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
      this.superInit(options);

      this.fromJSON({
        children: {
          bg0: {
            className: "phina.display.Sprite",
            arguments: passion.GameSceneBg.drawBgTexture(),
            originX: 0,
            originY: 0,
          },
          bg1: {
            className: "phina.display.RectangleShape",
            arguments: {
              fill: "black",
              stroke: null,
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT * 0.1,
            },
            x: SCREEN_WIDTH * 0.5,
            y: SCREEN_HEIGHT * 0.5,
          },
          label: {
            className: "phina.display.Label",
            arguments: {
              text: "",
            },
            x: SCREEN_WIDTH * 0.5,
            y: SCREEN_HEIGHT * 0.5,
            alpha: 0,
          },
        },
      });

      var stageName = options.stage;

      var loader = phina.asset.AssetLoader();
      loader.load({
        json: { "stage": "./asset/stage/" + stageName + ".json" }
      });
      this.label.tweener.fadeIn(1000);
      loader.on("load", function() {
        this.step1();
      }.bind(this));

      this.label.text = "step0";
    },

    update: function(app) {
      var t = Math.floor(app.ticker.frame * 0.1) % 4;
      var s = "downloading";
      t.times(function() { s += "." });
      s.paddingRight("downloading".length + 3, " ");
      // this.label.text = s;
    },

    step1: function() {
      var stageData = phina.asset.AssetManager.get("json", "stage").data;
      // console.log(stageData);

      var enemies = {};
      stageData.enemies.forEach(function(enemy) {
        enemies[enemy + ".enemy"] = "./asset/enemy/" + enemy + ".json";
      });

      var loader = phina.asset.AssetLoader();
      loader.load({
        json: enemies,
        sound: { "bgm": "./asset/sound/" + stageData.bgm + ".mp3" },
        image: { "bg": "./asset/image/" + stageData.bg + ".png" },
      });
      loader.on("load", function() {
        this.step2(stageData);
      }.bind(this));

      this.label.text = "step1";
    },

    step2: function(stageData) {
      var textures = {};
      stageData.enemies
        .map(function(enemy) {
          return phina.asset.AssetManager.get("json", enemy + ".enemy").data;
        })
        .map(function(enemyData) {
          // console.log(enemyData);
          return enemyData.texture;
        })
        .uniq()
        .forEach(function(texture) {
          textures[texture] = "./asset/image/" + texture + ".png";
        });

      var loader = phina.asset.AssetLoader();
      loader.load({
        image: textures,
      });
      loader.on("load", function() {
        this.step3(stageData);
      }.bind(this));

      this.label.text = "step2";
    },

    step3: function(stageData) {
      var xmls = {};
      stageData.enemies
        .map(function(enemy) {
          return phina.asset.AssetManager.get("json", enemy + ".enemy").data;
        })
        .forEach(function(enemyData) {
          if (enemyData.motion) {
            xmls[enemyData.motion] = "./asset/bulletml/" + enemyData.motion + ".xml";
          }
          if (enemyData.attack) {
            xmls[enemyData.attack] = "./asset/bulletml/" + enemyData.attack + ".xml";
          }
        });
      stageData.timeline.forEach(function(task) {
        if (task.arguments.motion) {
          xmls[task.arguments.motion] = "./asset/bulletml/" + task.arguments.motion + ".xml";
        }
        if (task.arguments.attack) {
          xmls[task.arguments.attack] = "./asset/bulletml/" + task.arguments.attack + ".xml";
        }
        if (task.arguments.enemy) {
          if (task.arguments.enemy.motion) {
            xmls[task.arguments.enemy.motion] = "./asset/bulletml/" + task.arguments.enemy.motion + ".xml";
          }
          if (task.arguments.enemy.attack) {
            xmls[task.arguments.enemy.attack] = "./asset/bulletml/" + task.arguments.enemy.attack + ".xml";
          }
        }
      });
      
      var loader = phina.asset.AssetLoader();
      loader.load({
        xml: xmls,
      });
      loader.on("load", function() {
        this.label.tweener.clear().fadeOut(100);
        this.bg1.tweener.fadeOut(500).call(function() {
          this.app.popScene();
        }.bind(this));
      }.bind(this));

      this.label.text = "step3";
    },

  });
});
