phina.namespace(() => {

  phina.define("passion.UIHeadLabel", {
    superClass: "phina.display.Shape",

    init: function(options) {
      this.superInit(options);
      this.backgroundColor = "transparent";
      this.stroke = "hsla(190, 100%, 60%, 1.0)";
      this.strokeWidth = 1;
      this.fromJSON({
        children: {
          text: {
            className: "phina.display.Label",
            arguments: {
              text: options.text,
              fontSize: options.fontSize || 24,
              // fontWeight: "bold",
              fontFamily: options.fontFamily || "main",
              align: options.align || "center",
            },
            fill: "hsla(190, 100%, 95%, 0.8)",
            strokeWidth: 0,
          },
        },
      });
    },

    prerender: function(canvas) {
      const c = canvas.context;
      const fg = c.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
      fg.addColorStop(0.00, "hsla(190, 100%, 50%, 0.2)");
      fg.addColorStop(0.40, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(0.60, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(1.00, "hsla(190, 100%, 50%, 0.2)");
      this.fill = fg;
    },

    postrender: function(canvas) {
      const c = canvas.context;

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(-this.width / 2, -this.height / 2 + 10);
      c.lineTo(-this.width / 2 + 10, -this.height / 2);
      c.lineTo(this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, this.height / 2 - 10);
      c.lineTo(this.width / 2 - 10, this.height / 2);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(-this.width / 2, -this.height / 2 + 10);
      c.lineTo(-this.width / 2 + 10, -this.height / 2);
      c.stroke();

      c.beginPath();
      c.moveTo(this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, this.height / 2 - 10);
      c.lineTo(this.width / 2 - 10, this.height / 2);
      c.stroke();
    },

  });
});

phina.namespace(() => {

  phina.define("passion.UIHead2Label", {
    superClass: "phina.display.Shape",

    init: function(options) {
      this.superInit(options);
      this.backgroundColor = "transparent";
      this.strokeWidth = 1;
      this.fromJSON({
        children: {
          text: {
            className: "phina.display.Label",
            arguments: {
              text: options.text,
              fontSize: options.fontSize || 24,
              // fontWeight: "bold",
              fontFamily: options.fontFamily || "main",
              align: options.align || "center",
            },
            fill: "hsla(190, 100%, 95%, 0.8)",
            strokeWidth: 0,
          },
        },
      });
    },

    prerender: function(canvas) {
      const c = canvas.context;

      const fg = c.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
      fg.addColorStop(0.00, "hsla(190, 100%, 50%, 0.2)");
      fg.addColorStop(0.40, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(0.60, "hsla(190, 100%, 30%, 0.2)");
      fg.addColorStop(1.00, "hsla(190, 100%, 50%, 0.2)");
      this.fill = fg;

      const sg = c.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
      sg.addColorStop(0.00, "hsla(190, 100%, 60%, 0.0)");
      sg.addColorStop(0.30, "hsla(190, 100%, 60%, 1.0)");
      sg.addColorStop(0.70, "hsla(190, 100%, 60%, 1.0)");
      sg.addColorStop(1.00, "hsla(190, 100%, 60%, 0.0)");
      this.stroke = sg;
    },

    postrender: function(canvas) {
      const c = canvas.context;

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(-this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, this.height / 2);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(-this.width / 2, this.height / 2);
      c.lineTo(this.width / 2, this.height / 2);
      c.stroke();

      c.beginPath();
      c.moveTo(-this.width / 2, -this.height / 2);
      c.lineTo(this.width / 2, -this.height / 2);
      c.stroke();
    },

  });
});
