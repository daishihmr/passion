phina.namespace(function() {

  phina.define("passion.BulletRunning", {
    superClass: "phina.accessory.Accessory",

    runner: null,

    init: function() {
      this.superInit();
    },
    
    setRunner: function(runner) {
      this.runner = runner;
      return this;
    },

    onattached: function() {
      if (this.runner) {
        this.target.x = this.runner.x;
        this.target.y = this.runner.y;
        this.target.rotation = this.runner.direction;
        this.runner.onVanish = function() {
          this.remove();
        }.bind(this.target);
      }
    },

    update: function(app) {
      if (this.runner) {
        this.runner.update();
        this.target.x = this.runner.x;
        this.target.y = this.runner.y;
        this.target.rotation = this.runner.direction;
      }
    },

  });
});
