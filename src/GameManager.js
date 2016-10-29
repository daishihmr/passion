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
    
    startBgm: function(arg) {
      
    },
    
    stopBgm: function() {},
    
    wait: function(arg) {
      this.waitTo = this.frame + arg.time;
    },
    
    enemy: function(arg) {
      this.flare("spawnEnemy", arg);
    },
    
    warning: function(arg) {},
    
    boss: function(arg) {},

  });
});
