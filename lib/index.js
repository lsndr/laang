const fs = require('fs');
const path = require('path');

function removeDir(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                removeDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function isLaravel(laravel_dir) {
    if (!fs.existsSync(laravel_dir + '/composer.json')) {
        return false;
    }

    const composer = JSON.parse(fs.readFileSync(laravel_dir + '/composer.json', 'utf8'));

    return (composer.require && composer.require['laravel/framework']) || false;
}

function isAngular(angular_dir) {
    if (!fs.existsSync(angular_dir + '/.angular-cli.json') || !fs.existsSync(angular_dir + '/package.json')) {
        return false;
    }

    const package = JSON.parse(fs.readFileSync(angular_dir + '/package.json', 'utf8'));

    return (package.dependencies && package.dependencies['@angular/core']) || false;
}

function isAngularIntegrated(laravel_dir) {
    const laravel_package = JSON.parse(fs.readFileSync(laravel_dir + '/package.json', 'utf8'));

    return (laravel_package.dependencies && laravel_package.dependencies['@angular/core']) ? true : false;
}

function configureLaravelPackage(laravel_dir, angular_dir) {
    const angular_package = JSON.parse(fs.readFileSync(angular_dir + '/package.json', 'utf8'));
    let laravel_package = JSON.parse(fs.readFileSync(laravel_dir + '/package.json', 'utf8'));

    angular_package.dependencies = angular_package.dependencies || {};
    angular_package.devDependencies = angular_package.devDependencies || {};

    laravel_package.dependencies = laravel_package.dependencies || {};
    laravel_package.scripts = laravel_package.scripts || {};
    laravel_package.devDependencies = laravel_package.devDependencies || {};

    for (let k in angular_package.dependencies) {
        laravel_package.dependencies[k] = angular_package.dependencies[k];
    }

    for (let k in angular_package.devDependencies) {
        laravel_package.devDependencies[k] = angular_package.devDependencies[k];
    }

    laravel_package.scripts['abuild'] = 'ng build --no-delete-output-path --prod';
    laravel_package.scripts['awatch'] = 'ng build --no-delete-output-path --watch --poll 1000';

    fs.writeFileSync(laravel_dir + '/package.json', JSON.stringify(laravel_package, null, 2));
}

function configureAngularCli(laravel_dir, angular_dir) {
    let angular_cli = JSON.parse(fs.readFileSync(angular_dir + '/.angular-cli.json', 'utf8'));

    angular_cli.apps.map((app) => {
        if (app.root == 'src') {
            app.root = path.basename(angular_dir) + '/src';
        }

        if (app.outDir == 'dist') {
            app.outDir = 'public';
        }

        if (app.index == 'index.html') {
            app.index = 'app.html';

            fs.copyFileSync(angular_dir + '/src/index.html', angular_dir + '/src/app.html');
        }

        return app;
    });

    if (angular_cli.e2e && angular_cli.e2e.protractor && angular_cli.e2e.protractor.config === './protractor.conf.js') {
        angular_cli.e2e.protractor.config = './' + path.basename(angular_dir) + '/protractor.conf.js';
    }

    if (angular_cli.lint) {
        angular_cli.lint.map((item) => {
            if (item.project) {
                item.project = './' + path.basename(angular_dir) + '/' + item.project;
            }

            return item;
        });
    }

    if (angular_cli.test && angular_cli.test.karma && angular_cli.test.karma.config === './karma.conf.js') {
        angular_cli.test.karma.config = './' + path.basename(angular_dir) + '/karma.conf.js';
    }

    fs.writeFileSync(laravel_dir + '/.angular-cli.json', JSON.stringify(angular_cli, null, 2));
}

function configureTS(laravel_dir, angular_dir) {
    let tsconfig = JSON.parse(fs.readFileSync(angular_dir + '/tsconfig.json', 'utf8'));
    let tsconfigapp = JSON.parse(fs.readFileSync(angular_dir + '/src/tsconfig.app.json', 'utf8'));
    let tsconfigspec = JSON.parse(fs.readFileSync(angular_dir + '/src/tsconfig.spec.json', 'utf8'));

    if (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir == './dist/out-tsc') {
        tsconfig.compilerOptions.outDir = '../public/out-tsc';
    }

    if (tsconfigapp.compilerOptions && tsconfigapp.compilerOptions.outDir == '../out-tsc/app') {
        tsconfigapp.compilerOptions.outDir = '../../public/app';
    }

    if (tsconfigspec.compilerOptions && tsconfigspec.compilerOptions.outDir == '../out-tsc/spec') {
        tsconfigspec.compilerOptions.outDir = '../../public/spec';
    }

    fs.writeFileSync(angular_dir + '/tsconfig.json', JSON.stringify(tsconfig, null, 2));
    fs.writeFileSync(angular_dir + '/src/tsconfig.app.json', JSON.stringify(tsconfigapp, null, 2));
    fs.writeFileSync(angular_dir + '/src/tsconfig.spec.json', JSON.stringify(tsconfigspec, null, 2));
}

function writeLaravelRoutes(laravel_dir, angular_dir) {
    let routes = fs.readFileSync(laravel_dir + '/routes/web.php', 'utf8');

    routes = routes.replace('<?php', '<?php\r\n\r\nRoute::get(\'{route}\', function () {\n' +
        '    $response = response()->file(public_path(\'app.html\'));\n' +
        '\n' +
        '    if (\\App::isLocal()) {\n' +
        '        $response->headers->set(\'Cache-Control\', \'no-cache, no-store, must-revalidate\');\n' +
        '        $response->headers->set(\'Pragma\', \'no-cache\');\n' +
        '        $response->headers->set(\'Expires\', \'0\');\n' +
        '        $response->headers->set(\'ETag\', rand());\n' +
        '    }\n' +
        '\n' +
        '    return $response;\n' +
        '})->where(\'route\', \'.*\');');

    fs.writeFileSync(laravel_dir + '/routes/web.php', routes);
}

function removeTrash(laravel_dir, angular_dir) {
    fs.unlinkSync(angular_dir + '/.angular-cli.json');
    fs.unlinkSync(angular_dir + '/package.json');
    fs.unlinkSync(angular_dir + '/package-lock.json');
    removeDir(angular_dir + '/node_modules');
}

function laang(laravel_dir, angular_dir, force) {
    const laravel = isLaravel(laravel_dir);
    const angular = isAngular(angular_dir);

    if (!laravel) {
        throw 'It\'s not a Laravel dir';
    } else {
        console.log('Detected Laravel ' + laravel);
    }

    if (!force && isAngularIntegrated(laravel_dir)) {
        throw 'Angular already integrated to the project';
    }

    if (!angular) {
        throw 'Can\'t find an Angular project';
    } else {
        console.log('Detected Angular ' + angular);
    }

    console.log('Configuring Laravel...') & configureLaravelPackage(laravel_dir, angular_dir) & writeLaravelRoutes(laravel_dir, angular_dir);
    console.log('Configuring Angular CLI...') & configureAngularCli(laravel_dir, angular_dir);
    console.log('Configuring TS...') & configureTS(laravel_dir, angular_dir);
    console.log('Removing trash...') & removeTrash(laravel_dir, angular_dir);

    return true;
}

function detectAngular(path) {
    let angular = false;

    fs.readdirSync(path).forEach(file => {
        if (isAngular(path + '/' + file)) {
            angular = path + '/' + file;
        }
    });

    return angular;
}

exports.laang = laang;
exports.detectAngular = detectAngular;