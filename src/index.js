import OS from 'os';
import Path from 'path';
import fs from 'fs-extra';
import micromatch from 'micromatch';
import { isBinaryFileSync as isBinaryFile } from 'isbinaryfile';
import fetchGitRepo from 'fetch-git-repo-async';
import { hasLongWord } from './utils.js';

const homedir = OS.homedir();
const matchComments = /^[ ]*\/\//;
const matchTodos = /todo/i;

const readdir = path => fs.readdir(path, { recursive: true });

export default main;
export async function main(opts) {
  const _ = { opts, startedAt: new Date() };
  let gitignores = [];
  try {
    console.log('Getting files...');
    if (!opts.name) opts.name = opts.path;
    opts.path = await getPath(opts.path, opts);
    opts.dirname = Path.dirname(opts.path);
    opts.basename = Path.basename(opts.path);
    const files = (_.files = await readdir(opts.path));
    console.log('Got files:', files.length);
    gitignores = _.gitignores = opts.gitignore.flatMap(flatMapGitignore).filter(Boolean);
    console.log('Filtering...');
    const filtered = (_.filtered = files.filter(file => filter(file, opts)));
    console.log('Filtered files:', filtered.length);
    console.log('Sorting...');
    const sorted = (_.sorted = filtered.sort(sort));
    console.log('Finalizing...');
    let final = (_.final = sorted.map(file => finalMap(file, opts)).join('\n'));
    console.log('Adding tree...');
    const tree = (_.tree = sorted.map(file => `  ${file}`).join('\n'));
    console.log('Tree:', tree);
    final = `# ${opts.name}\n\n${tree}\n\n${final}`;

    if (opts.output === false) {
      console.log(final);
    } else {
      if (!opts.output) {
        opts.output = Path.join(OS.homedir(), 'downloads', Path.basename(Path.resolve(opts.path)) + '.md');
        await fs.ensureDir(Path.dirname(opts.output));
      }
      await fs.writeFile(opts.output, final);
      console.log(
        `Wrote to ${opts.output}, ${filtered.length} files (excluded ${files.length - filtered.length}), ${
          final.length
        } chars`,
      );
    }
  } catch (e) {
    _.error = e;
    throw e;
  } finally {
    _.endedAt = new Date();
    _.runTime = +_.endedAt - _.startedAt;
    // console.debug('main', _);
  }

  function filter(path, opts) {
    path = Path.normalize(path);
    const fullPath = Path.join(opts.path, path);
    const _ = { path, startedAt: new Date(), reason: [] };
    let result = (_.result = true);
    try {
      for (let exclude of [...opts.commonExcludes, ...(opts.exclude || [])]) {
        exclude = Path.normalize(exclude).toLowerCase();
        if (path.toLowerCase().includes(exclude)) {
          _.reason.push(`exclude: ${exclude}`);
          console.debug(`Excluding "${path}" since it matches ${exclude}`);
          return (result = _.result = false);
        }
      }

      const stats = (_.stats = fs.statSync(fullPath));
      const isFile = (_.isFile = stats.isFile());

      if (!isFile) {
        result = _.result = false;
        _.reason.push(`isFile: ${isFile}`);
      }

      const isBinary = (_.isBinary = _.isFile && isBinaryFile(fullPath));

      if (isBinary) {
        result = _.result = false;
        _.reason.push(`isBinary: ${isBinary}`);
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

  function finalMap(path, opts) {
    const fullPath = Path.join(opts.path, path);
    const _ = { path, startedAt: new Date() };
    try {
      const extension = (_.extension = path.split('.').pop());
      const contents = (_.contents = modifyContents(fs.readFileSync(fullPath, 'utf8'), opts));
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

function modifyContents(contents, opts = {}) {
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
    .join('\n')
    .substring(0, opts.maxContentLength || 1000);
}

async function getPath(path, argv, _ = {}) {
  if (await fs.exists(path)) {
    return path;
  } else if (argv.github === false) {
    throw new Error(`Path '${path}' doesn't exist`);
  } else {
    console.warn(`Path '${argv.path}' doesn't exist, trying github... (pass --no-github to prevent)`);
    const tmpDir = Path.join(
      OS.tmpdir(),
      // `code2prompt_gh-${crypto.createHash('sha256').update('argv.path').digest('hex').slice(0, 8)}`,
      `c2pgh_${path.replaceAll(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    );
    if ((await fs.exists(tmpDir)) && (await readdir(tmpDir)).length && !argv.force) {
      console.warn(`Hashed path for '${argv.path}' already exists (pass --force to re-clone):`, tmpDir);
      return tmpDir;
    }
    await fs.emptyDir(tmpDir);
    console.log(`Cloning into:`, tmpDir);
    try {
      await fetchGitRepo(argv.path, tmpDir);
      return tmpDir;
    } catch (error) {
      console.error(error);
      throw new Error(`Invalid github path '${path}'`);
    }
  }
}
