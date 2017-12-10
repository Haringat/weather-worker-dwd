const gulp = require("gulp");
const gulpClean = require("gulp-clean");
const gulpPlumber = require("gulp-plumber");
const gulpRename = require("gulp-rename");
const {
    init: initSourceMaps,
    write: writeSourceMaps,
    identityMap,
    mapSources
} = require("gulp-sourcemaps");
const gulpTsLint = require("gulp-tslint");
const gulpTypescript = require("gulp-typescript");

const merge = require("merge2");

const typescript = require("typescript");
const tslint = require("tslint");

const {
    normalize,
    sep,
    resolve
} = require("path");

const package = require("./package.json");
const tsConfig = require("./tsconfig.json");

//TODO: as soon as es6 gulpfiles are supported do it like this
/*import gulp from "gulp";
import gulpPlumber from "gulp-plumber";
import gulpRename from "gulp-rename";
import gulpSourcemaps from "gulp-sourcemaps";
import gulpTsLint from "gulp-tslint";
import gulpTypescript from "gulp-typescript";

import tslint from "tslint";
import typescript from "typescript";

import path from "path";

import package from "./package.json";
import tsConfig from "./tsconfig.json";

const {
    init as initSourceMaps,
    write as writeSourceMaps,
    identityMap,
    mapSources
} = gulpSourcemaps;

const {
    normalize,
    sep,
    resolve
} = path;
*/

const options = {
    paths: {
        get srcRoot() {
            "use strict";
            return ".";
        },
        get tsSources() {
            "use strict";
            return ["index.ts", "test.ts"].map(path => {
                return this.srcRoot + sep + path;
            });
        },
        get scriptsDist() {
            "use strict";
            return ".";
        },
        get testSources() {
            "use strict";
            return ["/**/*.test.js"].map(path => {
                return normalize(this.scriptsDist + path)
            });
        },
        get dists() {
            "use strict";
            return [
                this.scriptsDist
            ];
        },
        get results() {
            "use strict";
            const es5 = this.tsSources.map(scriptName => scriptName.replace(/\.ts/, ".js"));
            const es6 = this.tsSources.map(scriptName => scriptName.replace(/\.ts/, ".mjs"));
            return [
                ...es5,
                ...es6
            ];
        }
    },
    rename: {
        get es5Scripts() {
            "use strict";
            return {
                extname: ".js"
            };
        },
        get es6Scripts() {
            "use strict";
            return {
                extname: ".mjs"
            };
        }
    }
};

const modernTsConfig = {
    ...tsConfig.compilerOptions,
    target: "es2017",
    module: "es2015",
    typescript: typescript
};

const legacyTsConfig = {
    ...tsConfig.compilerOptions,
    target: "es5",
    module: "commonjs",
    typescript: typescript
};

gulp.task("default", ["build"]);

gulp.task("lint", () => {
    "use strict";
    return gulp.src(options.paths.tsSources)
        .pipe(gulpPlumber())
        .pipe(gulpTsLint({
            configuration: "./tslint.json"
        }))
        .pipe(gulpTsLint.report({
            summarizeFailureOutput: true
        }))
        .pipe(gulpPlumber.stop());
});

gulp.task("build", ["build-es"]);

gulp.task("build-es", ["build-legacy-es", "build-modern-es"]);

gulp.task("build-legacy-es", ["lint"], () => {
    "use strict";
    const ts = gulp.src(options.paths.tsSources, {
        base: options.paths.srcRoot
    })
        .pipe(gulpPlumber())
        .pipe(initSourceMaps())
        .pipe(identityMap())
        .pipe(gulpTypescript(legacyTsConfig));
    const dts = ts.dts;
    const js = ts.js
        .pipe(gulpPlumber())
        .pipe(gulpRename(options.rename.es5Scripts))
        /*.pipe(mapSources((sourcePath) => {
            // TODO: find a way to fix the sourceMap source paths without using absolute paths
            return resolve(sourcePath);
        }))*/
        .pipe(writeSourceMaps())
        .pipe(gulpPlumber.stop())
        .pipe(gulp.dest(options.paths.scriptsDist));
    return merge([js, dts]);
});

gulp.task("build-modern-es", ["lint"], () => {
    "use strict";
    const ts = gulp.src(options.paths.tsSources, {
        base: options.paths.srcRoot
    })
        .pipe(gulpPlumber())
        .pipe(initSourceMaps())
        .pipe(identityMap())
        .pipe(gulpTypescript(modernTsConfig));
    const dts = ts.dts;
    const js = ts.js
        .pipe(gulpRename(options.rename.es6Scripts))
        .pipe(mapSources((sourcePath, file) => {
            // TODO: find a way to fix the sourceMap source paths without using absolute paths
            return resolve(sourcePath);
        }))
        .pipe(writeSourceMaps())
        .pipe(gulpPlumber.stop())
        .pipe(gulp.dest(options.paths.scriptsDist));
    return merge([js, dts]);
});

gulp.task("clean", () => {
    "use strict";
    return gulp.src(options.paths.results, {
        read: false
    })
        .pipe(gulpClean());
});
