const fs = require('fs');
['src/game/game.js', 'src/game/game.test.js', 'src/game/game.extended.test.js'].forEach(f => {
  let txt = fs.readFileSync(f, 'utf8');
  txt = txt.replace(/'coins'/g, "'dheb'")
           .replace(/'cups'/g, "'jben'")
           .replace(/'swords'/g, "'syouf'")
           .replace(/'clubs'/g, "'zrawet'");
  fs.writeFileSync(f, txt);
});
