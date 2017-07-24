phina.namespace(() => {

  phina.define("passion.ExplosionSmall", {
    superClass: "passion.ParticleEmitter",

    init: function(glLayer, drawer) {
      this.superInit(glLayer, drawer, "particle", {
        frameX: 7 / 8,
        frameY: 0 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        red: 1.0,
        green: 0.8,
        blue: 0.2,
        alpha: 0.8,
        scaleX: 10,
        scaleY: 10,
      });
      
      this.tweener
        .clear()
        .set({
          genPerFrame: 5,
        })
        .to({
          genPerFrame: 0,
        }, 150)
        .call(() => this.remove());
    },
    
    onspawnParticle: function(e) {
      const p = e.particle;
      const dir = Math.random() * Math.PI * 2;
      const dst = Math.randint(2, 25);
      p.tweener
        .clear()
        .to({
          x: p.x + Math.cos(dir) * dst,
          y: p.y + Math.sin(dir) * dst,
          scaleX: 50,
          scaleY: 50,
          green: 0.0,
          blue: 0.0,
          alpha: 0
        }, 400, "easeOutQuad")
        .call(() => p.remove());
    },

  });
});
