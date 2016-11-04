phina.namespace(function() {

  phina.define("passion.GameManager", {
    superClass: "phina.util.EventDispatcher",

    score: 0,
    highScore: 0,

    frame: 0,
    waitTo: 0,

    timeline: null,

    init: function(stageData) {
      this.superInit();
      this.timeline = stageData.timeline;
      this.waitTo = -1;
    },

    update: function(app) {
      while ((this.waitTo === this.frame || this.waitTo === -1) && this.timeline.length > 0) {
        this.waitTo = -1;
        var task = this.timeline.shift();

        console.log("[task] " + this.frame + " " + task.type);

        this[task.type](task.arguments);
      }

      this.frame += 1;
    },

    startBgm: function() {
      // phina.asset.SoundManager.playMusic("bgm", 0, true);
    },

    stopBgm: function() {},

    wait: function(arg) {
      this.waitTo = this.frame + arg.time;
    },

    enemy: function(arg) {
      this.flare("spawnEnemy", arg);
    },

    enemyGroup: function(arg) {
      var enemy;
      if (typeof(arg.enemy) == "string") {
        enemy = { name: enemy };
      } else {
        enemy = arg.enemy;
      }
      for (var i = 0; i < arg.count; i++) {
        this.flare("spawnEnemy", {}.$extend(enemy, {
          x: (arg.x || 0) + (arg.dx || 0) * i,
          y: (arg.y || 0) + (arg.dy || 0) * i,
          wait: (arg.wait || 0) + (arg.dwait || 0) * i,
        }));
      }
    },

    warning: function(arg) {},

    boss: function(arg) {},

  });
});
