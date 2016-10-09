phina.namespace(function() {

  phina.define("passion.Enemy", {
    superClass: "passion.Sprite",

    runner: null,

    hp: 0,
    active: false,
    // vs shot
    damageRadius: 0,
    // vs player
    attackRadius: 0,

    isMissile: false,
    isEntered: false,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("removed", function() {
        this.clear("everyframe");
        this.clear("damaged");
        this.clear("killed");
        this.tweener.clear();
        this.stopAttack();
        this.isMissile = false;
        this.isEntered = false;
      });
      this.on("enterframe", function() {
        if (this.isEntered) {
          if (this.x < -this.damageRadius || GAME_AREA_WIDTH + this.damageRadius < this.x || this.y < -this.damageRadius || GAME_AREA_HEIGHT + this.damageRadius < this.y) {
            this.remove();
            return;
          }
        } else {
          if (this.damageRadius < this.x && this.x < GAME_AREA_WIDTH - this.damageRadius && this.damageRadius < this.y && this.y < GAME_AREA_HEIGHT - this.damageRadius) {
            this.isEntered = true;
          }
        }

        if (this.runner) {
          this.runner.x = this.x;
          this.runner.y = this.y;
          this.runner.update();
          if (this.isMissile) {
            this.x = this.runner.x;
            this.y = this.runner.y;
          }
        }
      });
    },

    spawn: function(options) {
      passion.Sprite.prototype.spawn.call(this, options);
      this.hp = options.hp || 0;
      this.damageRadius = options.damageRadius || 48;
      this.attackRadius = options.attackRadius || 24;
      return this;
    },

    startAttack: function(bulletmlName) {
      var bulletmlDoc = phina.asset.AssetManager.get("xml", bulletmlName);
      var pattern = bulletml.buildXML(bulletmlDoc.data);
      var config = passion.Danmaku.config;
      this.runner = pattern.createRunner(config);
    },

    stopAttack: function() {
      this.runner = null;
    },

  });
});
