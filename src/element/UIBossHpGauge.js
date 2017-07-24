phina.namespace(() => {

  phina.define("passion.BossHpGauge", {
    superClass: "phina.display.Shape",

    init: function(options) {
      this.superInit(options);
      this.backgroundColor = "transparent";
      this.strokeWidth = 2;
      this.fill = null;

      const canvas = phina.graphics.Canvas().setSize(this.width, this.height);
      const c = canvas.context;

      const sg = c.createLinearGradient(this.height / 2, -this.width / 2, -this.height / 2, this.width / 2);
      sg.addColorStop(0.00, "hsla(190, 100%, 30%, 1.0)");
      sg.addColorStop(0.38, "hsla(190, 100%, 30%, 1.0)");
      sg.addColorStop(0.48, "hsla(190, 100%, 80%, 1.0)");
      sg.addColorStop(0.52, "hsla(190, 100%, 80%, 1.0)");
      sg.addColorStop(0.62, "hsla(190, 100%, 30%, 1.0)");
      sg.addColorStop(1.00, "hsla(190, 100%, 30%, 1.0)");
      this.stroke = sg;
    },

    prerender: function(canvas) {
      const c = canvas.context;

      c.beginPath();
      c.moveTo(-this.width / 2.05, -this.height / 3);
      c.lineTo(-this.width / 8, -this.height / 3);
      c.lineTo(-this.width / 12, -this.height / 10);
      c.lineTo(this.width / 12, -this.height / 10);
      c.lineTo(this.width / 8, -this.height / 3);
      c.lineTo(this.width / 2.05, -this.height / 3);
      c.lineTo(this.width / 2, this.height / 10);
      c.lineTo(this.width / 8, this.height / 10);
      c.lineTo(this.width / 12, this.height / 3);
      c.lineTo(-this.width / 12, this.height / 3);
      c.lineTo(-this.width / 8, this.height / 10);
      c.lineTo(-this.width / 2, this.height / 10);
      c.closePath();
    },

    postrender: function(canvas) {
      const c = canvas.context;

      c.beginPath();
      c.moveTo(-3 + -this.width / 2 + 5, -3 + -this.height / 3);
      c.lineTo(+3 + -this.width / 8, -3 + -this.height / 3);
      c.lineTo(+3 + -this.width / 12, -3 + -this.height / 10);
      c.lineTo(-3 + this.width / 12, -3 + -this.height / 10);
      c.lineTo(-3 + this.width / 8, -3 + -this.height / 3);
      c.lineTo(+3 + this.width / 2 - 5, -3 + -this.height / 3);
      c.lineTo(+3 + this.width / 2, +3 + this.height / 10);
      c.lineTo(+3 + this.width / 8, +3 + this.height / 10);
      c.lineTo(+3 + this.width / 12, +3 + this.height / 3);
      c.lineTo(-3 + -this.width / 12, +3 + this.height / 3);
      c.lineTo(-3 + -this.width / 8, +3 + this.height / 10);
      c.lineTo(-3 + -this.width / 2, +3 + this.height / 10);
      c.closePath();

      c.lineWidth = 1;
      c.stroke();
    },
  });

  phina.define("passion.BossHpGaugeValue", {
    superClass: "passion.BossHpGauge",

    value: 0,
    maxValue: 100,

    init: function(options) {
      this.superInit(options);
      this.fill = "hsla(210, 80%, 40%, 0.9)";
      this.stroke = null;
    },

    clip: function(canvas) {
      const c = canvas.context;

      const v = Math.clamp(this.value / this.maxValue, 0, 1);

      c.beginPath();
      c.moveTo(-this.width / 2, -this.height / 2);
      c.lineTo(-this.width / 2 + this.width * v, -this.height / 2);
      c.lineTo(-this.width / 2 + this.width * v, +this.height / 2);
      c.lineTo(-this.width / 2, +this.height / 2);
      c.closePath();

      c.clip();
    },

    postrender: function() {},
  });

});
