phina.namespace(() => {

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
            className: "passion.UIFrame",
            arguments: {
              fill: "black",
              stroke: null,
              width: SCREEN_WIDTH * 0.9,
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

      this.step0(options.stage);
    },

    update: function(app) {
      let t = Math.floor(app.ticker.frame * 0.1) % 4;
      let s = "downloading";
      t.times(() =>  s += ".");
      s.paddingRight("downloading".length + 3, " ");
      this.label.text = s;
    },

    step0: function(stageName) {
      const loader = phina.asset.AssetLoader();
      loader.load({
        json: { "stage": "./asset/stage/" + stageName + ".json" }
      });
      this.label.tweener.fadeIn(1000);
      loader.on("load", e => this.step1());

      // this.label.text = "step0";
    },

    step1: function() {
      const stageData = phina.asset.AssetManager.get("json", "stage").data;
      // console.log(stageData);

      const enemies = {};
      stageData.enemies.forEach(enemy => enemies[enemy + ".enemy"] = "./asset/enemy/" + enemy + ".json");
      
      const sounds = {};
      stageData.bgm.forEach((b, idx) => sounds["bgm" + idx] = "./asset/sound/" + b.bgm + ".mp3");

      const loader = phina.asset.AssetLoader();
      loader.load({
        json: enemies,
        sound: sounds,
        image: { "bg": "./asset/image/" + stageData.bg + ".png" },
      });
      loader.on("load", e => this.step2(stageData));

      // this.label.text = "step1";
    },

    step2: function(stageData) {
      const textures = {};
      stageData.enemies
        .map(enemy => phina.asset.AssetManager.get("json", enemy + ".enemy").data)
        .map(enemyData => enemyData.texture)
        .uniq()
        .forEach(texture => textures[texture] = "./asset/image/" + texture + ".png");

      const loader = phina.asset.AssetLoader();
      loader.load({
        image: textures,
      });
      loader.on("load", () => this.step3(stageData));

      // this.label.text = "step2";
    },

    step3: function(stageData) {
      const xmls = {};
      stageData.enemies
        .map(enemy => phina.asset.AssetManager.get("json", enemy + ".enemy").data)
        .forEach(enemyData => {
          if (enemyData.motion) {
            xmls["motion/" + enemyData.motion] = "./asset/motion/" + enemyData.motion + ".xml";
          }
          if (enemyData.attack) {
            xmls["attack/" + enemyData.attack] = "./asset/attack/" + enemyData.attack + ".xml";
          }
        });
      stageData.timeline.forEach(task => {
        if (task.arguments.motion) {
          xmls["motion/" + task.arguments.motion] = "./asset/motion/" + task.arguments.motion + ".xml";
        }
        if (task.arguments.attack) {
          xmls["attack/" + task.arguments.attack] = "./asset/attack/" + task.arguments.attack + ".xml";
        }
        if (task.arguments.enemy) {
          if (task.arguments.enemy.motion) {
            xmls["motion/" + task.arguments.enemy.motion] = "./asset/motion/" + task.arguments.enemy.motion + ".xml";
          }
          if (task.arguments.enemy.attack) {
            xmls["attack/" + task.arguments.enemy.attack] = "./asset/attack/" + task.arguments.enemy.attack + ".xml";
          }
        }
      });

      const loader = phina.asset.AssetLoader();
      loader.load({
        xml: xmls,
      });
      loader.on("load", () => this.step4());

      // this.label.text = "step3";
    },

    step4: function() {
      this.label.tweener.clear().fadeOut(100);
      this.bg1.tweener.fadeOut(500).call(() => this.app.popScene());
    },

  });
});
