phina.namespace(() => {

  phina.define("passion.ParticleEmitter", {
    superClass: "phina.app.Element",

    x: 0,
    y: 0,

    drawer: null,
    objName: null,
    spawnOptions: null,

    genPerFrame: 0,

    init: function(glLayer, drawer, objName, spawnOptions) {
      this.superInit();
      this.glLayer = glLayer;
      this.drawer = drawer;
      this.objName = objName;
      this.spawnOptions = spawnOptions;
    },

    update: function(app) {
      for (let i = 0; i < this.genPerFrame; i++) {
        const particle = this.drawer.get(this.objName);
        if (particle) {
          particle
            .spawn({}.$extend(this.spawnOptions, {
              x: this.x,
              y: this.y,
            }))
            .addChildTo(this.glLayer);
          this.flare("spawnParticle", { particle: particle });
        } else {
          break;
        }
      }
    },
  });

  phina.define("passion.Particle", {
    superClass: "passion.Sprite",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("removed", e => this.tweener.clear());
    },

  });

});
