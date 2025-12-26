import fs from 'fs-extra';
import { isBinaryFileSync as isBinaryFile } from 'isbinaryfile';
import micromatch from 'micromatch';
import OS from 'os';
import Path from 'path';
import { hasLongWord } from './utils.js';

const homedir = OS.homedir();
const matchComments = /^[ ]*\/\//;
const matchTodos = /todo/i;

export default main;
export async function main(opts) {
  const _ = { opts, startedAt: new Date() };
  let gitignores = [];
  try {
    console.log('Getting files...');
    const files = (_.files = await fs.readdir(opts.path, { recursive: true }));
    console.log('Got files:', files.length);
    gitignores = _.gitignores = opts.gitignore.flatMap(flatMapGitignore).filter(Boolean);
    console.log('Filtering...');
    const filtered = (_.filtered = files.filter(filter));
    console.log('Filtered files:', filtered.length);
    console.log('Sorting...');
    const sorted = (_.sorted = filtered.sort(sort));
    console.log('Finalizing...');
    let final = (_.final = sorted.map(finalMap).join('\n'));
    console.log('Adding tree...');
    const tree = (_.tree = sorted.map(file => `  ${file}`).join('\n'));
    console.log('Tree:', tree);
    final = `# ${opts.path}\n\n${tree}\n\n${final}`;

    if (opts.output) {
      fs.writeFileSync(opts.output, final);
      console.log(
        `Wrote to ${opts.output}, ${filtered.length} files (excluded ${files.length - filtered.length}), ${
          final.length
        } chars`,
      );
    } else {
      console.log(final);
    }
  } catch (e) {
    _.error = e;
    throw e;
  } finally {
    _.endedAt = new Date();
    _.runTime = +_.endedAt - _.startedAt;
    // console.debug('main', _);
  }

  function filter(path) {
    path = Path.normalize(path);
    const _ = { path, startedAt: new Date(), reason: [] };
    let result = (_.result = true);
    try {

      for (let commonExclude of opts.commonExcludes) {
        commonExclude = Path.normalize(commonExclude);
        if (path.includes(commonExclude)) {
          _.reason.push(`commonExclude: ${commonExclude}`);
          console.debug(`Excluding "${path}" since it matches ${commonExclude}`);
          return (result = _.result = false);
          // return result;
          break;
        }
      }

      // const includesGit = (_.includesGit = path?.includes?.('.git'));
      // if (includesGit) result = _.result = false;
      const stats = (_.stats = fs.statSync(path));
      const isFile = (_.isFile = stats.isFile());

      if (!isFile) {
        result = _.result = false;
        _.reason.push(`isFile: ${isFile}`);
        // return result;
      }

      const isBinary = (_.isBinary = _.isFile && isBinaryFile(path));

      if (isBinary) {
        result = _.result = false;
        _.reason.push(`isBinary: ${isBinary}`);
        // return result;
      }

      for (const gitignore of gitignores) {
        if (
          /* This is a weird bug, apparently if a gitignore starts with ! EVERY file is ignored... */
          !gitignore.startsWith('!') &&
          /* */
          micromatch.isMatch(path, gitignore)
        ) {
          result = _.result = false;
          _.reason.push(`gitignore: ${gitignore}`);
          break;
          // return result;
        }
      }

      /* If all files pass the filters, return true */
      return result;
    } catch (e) {
      _.error = e;
      if (opts.halt !== false) {
        console.warn('[WARN] Error filtering file:', path, e.message);
        return false;
      }
      throw e;
    } finally {
      _.endedAt = new Date();
      _.runTime = +_.endedAt - _.startedAt;
      if (path.endsWith('core-view-component-layout.tsx') || path.endsWith('nxdeps.json'))
        console.debug('Sample Filter', _.result ? 'included' : 'excluded', _.path, ..._.reason);
    }
  }

  function flatMapGitignore(gitignoreFile) {
    const _ = { args: gitignoreFile, startedAt: new Date() };
    let contents;
    try {
      if (gitignoreFile.startsWith('~')) {
        gitignoreFile = _['~'] = gitignoreFile.replace('~', homedir);
      }
      try {
        contents = _.contents = fs.readFileSync(gitignoreFile, 'utf8');
      } catch (error) {
        console.warn(`[WARN] No contents found in gitignore file: '${gitignoreFile}'. Error: ${error.message}`);
        return [];
      }
      return (_.result = contents
        .split('\n')
        .map(line => line.trim())
        .filter(line => !line.startsWith('#')));
    } catch (e) {
      _.error = e;
      throw e;
    } finally {
      _.endedAt = new Date();
      _.runTime = +_.endedAt - _.startedAt;
      // console.debug('flatMapGitignore', _);
    }
  }

  function sort(a, b) {
    return a.localeCompare(b);
    const a_ = a.split('').reverse().join('');
    const b_ = b.split('').reverse().join('');
    console.log({ a_, b_ });
    return a_.localeCompare(b_);
    return 0;
    const _ = { a, b, startedAt: new Date() };
    try {
      return a.length - b.length;
      // const numberOfSlashes = (_.numberOfSlashes = file.split('/').length);
      const numberOfSlashesA = (_.numberOfSlashesA = a.split(/[/\\]+/g).length);
      const numberOfSlashesB = (_.numberOfSlashesB = b.split(/[/\\]+/g).length);
      if (numberOfSlashesA < numberOfSlashesB) _.result = -1;
      else if (numberOfSlashesA > numberOfSlashesB) _.result = 1;
      else _.result = a.localeCompare(b);

      // if (a.match(/.md$/i)) _.result = -1;
      // else if (b.match(/.md$/i)) _.result = 1;

      // if (a.match(/readme/i)) _.result = -1;
      // else if (b.match(/readme/i)) _.result = 1;

      return _.result;
    } catch (e) {
      _.error = e;
      throw e;
    } finally {
      _.endedAt = new Date();
      _.runTime = +_.endedAt - _.startedAt;
      // if (a.includes('tailwind') || b.includes('tailwind'))
      // console.debug('sort', _);
    }
  }

  function finalMap(path) {
    const _ = { path, startedAt: new Date() };
    try {
      const extension = (_.extension = path.split('.').pop());
      const contents = (_.contents = modifyContents(fs.readFileSync(path, 'utf8')));
      const addedLineNumbers = (_.addedLineNumbers = contents
        .split('\n')
        .map((line, index) => `${index + 1}: ${line}`)).join('\n');
      return (_.result = [
        ``,
        ``,
        `# ${path}`,
        `---`,
        `\`\`\`${extension}`,
        contents,
        // addedLineNumbers,
        `\`\`\``,
        `---`,
        ``,
        ``,
        ``,
      ].join('\n'));

      // return (_.result = path);
    } catch (e) {
      _.error = e;
      throw e;
    } finally {
      _.endedAt = new Date();
      _.runTime = +_.endedAt - _.startedAt;
      // console.debug('finalMap', _);
    }
  }
}

function modifyContents(contents) {
  return contents
    .split(/[\n\r]+/g)
    .filter(line => {
      if (line.length >= 200) return false;
      if (hasLongWord(line)) return false;
      if (matchComments.test(line)) {
        if (matchTodos.test(line)) {
          return true;
        } else {
          return false;
        }
      } else return true;
    })
    .join('\n');
}
