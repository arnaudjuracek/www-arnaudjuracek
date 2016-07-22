const argv         = require('minimist')(process.argv.slice(2));
const path         = require('path');
const xtend        = require('xtend');
const sh           = require('./utils/Shell');
const createDoodle = require('./utils/createDoodle');
const createBuild  = require('./utils/createBuild');

function build(options) {
  const build = createBuild(options);
  build.run()
    .catch((e) => sh.error(e));
}

if (!argv._ || !argv._[0]) {

  const options = {
    isDoodle: false,
    isProduction: true
  };
  build(options);

} else {

  let doodle;
  try { doodle = createDoodle(argv._[0], path.join(__dirname, '..', 'doodles')); }
  catch(e) { sh.error(e + '\n').exit(); }
  doodle.exists()
    .catch((e) => {
      sh.error('Doodle ' + doodle.name + ' doesn\'t exist.')
        .info('You can use '
          + sh.c.yellow.italic('npm run doodle -- "' + doodle.name + '"')
          + ' to create it\n')
        .exit()
    })
    .then(() => {
      const options = {
        isDoodle: true,
        isProduction: true,
        paths: { cwd: doodle.cwd }
      };
      build(options);
    });
}
