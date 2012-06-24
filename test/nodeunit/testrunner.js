var nodeunit = require('./nodeunit'),
    util = require('util');



exports.run = function(files){

    var red   = function(str){return "\033[31m" + str + "\033[39m"};
    var green = function(str){return "\033[32m" + str + "\033[39m"};
    var bold  = function(str){return "\033[1m" + str + "\033[22m"};

    var start = new Date().getTime();

    nodeunit.runFiles(files, {
        moduleStart: function(name){
            util.puts('\n' + bold(name));
        },
        testDone: function(name, assertions){
            if(!assertions.failures){
                util.puts('✔ ' + name);
            }
            else {
                util.puts(red('✖ ' + name) + '\n');
                assertions.forEach(function(assertion){
                    if(assertion.failed()){
                        util.puts(assertion.error.stack + '\n');
                    }
                });
            }
        },
        done: function(assertions){
            var end = new Date().getTime();
            var duration = end - start;
            if(assertions.failures){
                util.puts(
                    '\n' + bold(red('FAILURES: ')) + assertions.failures +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                util.puts(
                    '\n' + bold(green('OK: ')) + assertions.length +
                    ' assertions (' + assertions.duration + 'ms)'
                );
            }
            process.reallyExit(assertions.failures);
        }
    });
};

// If this is run from the command-line:
if(module.id === '.'){
    require.paths.push(process.cwd());
    var args = process.ARGV.slice(2);
    exports.run(args);
}
