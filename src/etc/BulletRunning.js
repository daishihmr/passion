phina.namespace(function() {

  phina.define("passion.BulletRunning", {
    superClass: "phina.accessory.Accessory",

    runner: null,

    init: function() {
      this.superInit();
    },

    setRunner: function(runner) {
      this.runner = runner;
      if (this.target && runner) {
        this.target.x = runner.x;
        this.target.y = runner.y;
        this.target.rotation = runner.direction;
        runner.onVanish = function() {
          this.remove();
        }.bind(this.target);
      }
      return this;
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
