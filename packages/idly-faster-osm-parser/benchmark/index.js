const cTable = require('console.table');
const path = require('path');
var argv = require('minimist')(process.argv.slice(2));

const filePath = getAbsPath(argv._[0] || './benchmark/small.osm');

function getAbsPath(p) {
  if (path.isAbsolute(p)) return p;
  return path.join(process.cwd(), p);
}

var tasks = shuffle([
  require('./node-faster-osm-parser'),
  require('./faster-osm-parser'),
  require('./osmtogeojson'),
  require('./osmium'),
  require('./iD-xml-parser'),
]);

var res = tasks
  .map(t => t(filePath))
  .sort((a, b) => a[1][1] - b[1][1])
  .map(parseHR);

console.table(res);

function parseHR([name, hrend]) {
  return [name, `${hrend[0]}s, ${hrend[1] / 1000000}ms`];
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
