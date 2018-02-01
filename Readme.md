
 Provides the fastest way of integrating [Angular](https://angular.io) into [Laravel](http://laravel.com).

  [![contributions welcome][contributions]]([issues-link])

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 8.5.0 or higher is required.

Installation is done using the
[`npm install -g` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install -g laang
```

## Quick Start

  Create the [Laravel](https://laravel.com) app:

```bash
$ composer create-project --prefer-dist laravel/laravel laravel
```

  Install [Angular](https://angular.io):

```bash
$ cd laravel
$ ng new angular
```

  Run `laang --run` command:

```bash
$ laang --run
```

  Install all packages:

```bash
$ npm install
```

  Finally, build your Angular app:

```bash
$ npm run abuild
```

## Available NPM commands

  To build your angular project run `npm run abuild` command:

```bash
$ npm run abuild
```

  You can watch changes by running `npm run awatch` command:

```bash
$ npm run awatch
```

  All following commands must be run in <b>root directory</b> of Laravel. Other [Angular CLI](https://github.com/angular/angular-cli) features are available by running `ng` command

  Use `--no-delete-output-path` option too keep your Laravel's public directory.

```bash
ng build --no-delete-output-path --prod
```

## License

  [MIT](https://opensource.org/licenses/MIT)

[issues-link]: https://github.com/lsndr/laang/issues
[npm-url]: https://npmjs.org/package/express
[contributions]: https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat