#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const {laang, detectAngular} = require('../lib/index');

const sections = [{
    header: 'Laang',
    content: 'Integrates Angular to Laravel.\r\nRun laang --run'
}, {
    header: 'Options',
    optionList: [{
        name: 'run',
        description: 'Run integration.'
    }, {
        name: 'angular',
        typeLabel: '[underline]{dir}',
        description: 'Angular directory. Laang will try to detect if not specified.'
    }, {
        name: 'force',
        description: 'Force integration'
    }, {
        name: 'help',
        description: 'Print this usage guide.'
    }]
}];

const optionDefinitions = [
    {name: 'help', alias: 'h', type: Boolean},
    {name: 'run', alias: 'r', type: Boolean},
    {name: 'force', 'alias': 'f', type: Boolean},
    {name: 'angular', alias: 'a', type: String}
];

const options = commandLineArgs(optionDefinitions);

if (options.help || !options.run) {
    console.log(getUsage(sections));
    return;
}

try {
    const laravel_dir = process.cwd();
    const angular_dir = options.angular || detectAngular(process.cwd());

    if (!angular_dir) {
        throw 'Can\'t find Angular. Use -angular option';
    }

    laang(laravel_dir, angular_dir, options.force ? true : false);
} catch (e) {
    console.error(e);
}
