'use strict';

// process.env.NODE_ENV = 'production';
// process.env.NODE_ENV = 'development';
// process.env.DEBUG = "express:*";
// process.env.DEBUG='express:*;*';
// const debug = require('debug');
// debug.enable('express:**');

// debug(`process.env.DEBUG : ${process.env.DEBUG}`);
// process.env.DEBUG='*';
// process.env.DEBUG='';

/* eslint-disable no-console */

const gulp = require('gulp');

const fs = require('fs');
const rmdir = require('rimraf');

const tempDirArray = [
  ".temp",
  './coverage',
  './.nyc_output',
  "dist",
  "tests/.temp",
  "tests/openapi-code-generator/output-tests/standard-suite/output"
  //"tests/openapi-code-generator/generate-output-tests/TBA   ",
];

gulp.task('clean', () => {
    for (let i = 0; i < tempDirArray.length; i += 1) {
      const tempDir = tempDirArray[i];
      try {
        fs.stat(tempDir, (fsError) => {
          if (fsError) {
            if (fsError.code !== 'ENOENT') {
              console.error(`ERROR: rmdifs.stat(${tempDir}) erorr: ${fsError}`);
            }
          } else {
            rmdir(tempDir, (err) => {
              if (err) {
                console.error(`ERROR: Failed to rmdir dirs : ${tempDir}`);
              }
            });
          }
        });
      } catch(err) {
        console.error(`Clean '${tempDir}' error: '${err}'`);
      }
    }

  return Promise.resolve(); // Directory does not exist, but do not stop GULP
});
