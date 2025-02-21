#!/usr/bin/env node

import OS from 'os';
import Path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import main from './index.js';

const cwdBase = Path.basename(process.cwd());

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
      default: `../${cwdBase}.md`,
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
        '.git',
        '.vscode',
        'node_modules',
        'dist',
        'build',
        'coverage',
        'tmp',
        'temp',
        'logs',
        'log',
        'package-lock.json',
        'lock',
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
  .help().argv;
