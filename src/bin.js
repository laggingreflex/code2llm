#!/usr/bin/env node

import OS from 'os';
// import Path from 'path';
// import fs from 'fs-extra';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import main from './index.js';

// const cwdBase = Path.basename(process.cwd());

yargs(hideBin(process.argv))
  .scriptName('code2llm')
  .options({
    path: {
      alias: 'p',
      type: 'string',
      description: 'Path to the file',
      default: '.',
    },
    output: {
      alias: 'o',
      type: 'string',
      description: 'Output file',
      // default: `~/downloads/${cwdBase}.md`,
    },
    exclude: {
      alias: 'e',
      type: 'array',
      description: 'Exclude files',
    },
    commonExcludes: {
      type: 'array',
      description: 'Use common excludes',
      default: [
        'code2prompt',
        '.git/',
        '.vscode/',
        'node_modules/',
        'dist/',
        'target/',
        '.spec.',
        // 'test',
        'migration',
        'cache',
        '.css',
        '.d.ts',
        '.prod.',
        '.ico',
        '.csv',
        '.txt',
        '.sfd',
        '.dict',
        // '.json',
        'Jenkinsfile',
        // '.config.',
        '.preset.',
        'README',
        'output.',
        'build/',
        'coverage/',
        'tmp/',
        'temp/',
        'logs/',
        '.log',
        'package-lock.json',
        '.lock',
        '.nx/',
        'nx-welcome',
        // 'tsconfig',
        'eslint',
        // 'babelrc',
        'browserslistrc',
        'prettierrc',
        'editorconfig',
        'polyfills',
        'environment.',
        'e2e',
        'ignore',
        '.svg',
        '.old.',
        '.old/',
        // '.config.',
        '.vite/',
        'pdfbox',
        'surefire',
        'terms-conditions',
        'privacy-policy',
        '.min.',
        '.astro/',
        '.next/',
      ],
    },
    gitignore: {
      alias: 'g',
      type: 'array',
      description: 'Use .gitignore',
      default: ['.gitignore', '~/.gitignore'],
    },
    include: {
      // alias: 'i',
      type: 'array',
      description: 'Include files',
    },
    maxContentLength: {
      alias: 'l',
      type: 'number',
      description: 'Maximum content length',
      default: 2000,
    },
    github: {
      type: 'boolean',
      description: 'Treat path as a repo on github/remote',
    },
    verbose: {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    },
    debug: {
      alias: 'd',
      type: 'boolean',
      description: 'Run with debug logging',
    },
  })
  .command({
    command: '$0 [path]',
    describe: 'Run the main function',
    async handler(args) {
      const _ = { args, startedAt: new Date() };
      try {
        _.result = await main(args);
        return _.result ?? _;
      } catch (e) {
        _.error = e;
        throw e;
      } finally {
        _.endedAt = new Date();
        _.runTime = +_.endedAt - _.startedAt;
        // console.debug('bin', _);
      }
    },
  })
  .middleware(middleware)
  .help().argv;

function middleware(argv) {
  // console.log(`middleware:`, args);
  // for (const arg )
  for (const key in argv) {
    const val = argv[key];
    if (val?.includes?.('~')) {
      argv[key] = val.replace('~', OS.homedir());
    }
  }
  // process.exit()
  return this;
}

console.debug = () => {};
// console.log = ( (log, global) => (...args) => { const lastTime = global.__CONSOLE_LAST_TIME__ || Date.now(); const now = Date.now(); global.__CONSOLE_LAST_TIME__ = now; log(...args, `[+${now - lastTime}ms]`); } )(console.log.bind(console), {});
