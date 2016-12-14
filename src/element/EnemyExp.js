phina.namespace(function() {
  
  phina.define("passion.EnemyExp", {
    superClass: "phina.app.Element",
    
    enemy: null,
    
    init: function(enemy) {
      this.superInit();
      this.enemy = enemy;
      this.enemy.status = 3;
      this.enemy.motionRunner = null;
      this.enemy.attackRunner = null;
    },

  });
});