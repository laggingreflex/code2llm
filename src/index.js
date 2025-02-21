import fs from 'fs-extra';
import { isBinaryFileSync as isBinaryFile } from 'isbinaryfile';
import micromatch from 'micromatch';
import OS from 'os';

const homedir = OS.homedir();

export default main;
export async function main(opts) {
  const _ = { opts, startedAt: new Date() };
  let gitignores = [];
  try {
    const files = (_.files = await fs.readdir(opts.path, { recursive: true }));
    gitignores = _.gitignores = opts.gitignore
      .flatMap(flatMapGitignore)
      .filter(Boolean);
    const filtered = (_.filtered = files.filter(filter));
    const sorted = (_.sorted = filtered.sort(sort));
    const final = (_.final = sorted.map(finalMap).join('\n'));
    if (opts.output) {
      fs.writeFileSync(opts.output, final);
      console.log(
        `Wrote to ${opts.output}, ${filtered.length} files (excluded ${files.length-filtered.length}), ${final.length} chars`
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
    const _ = { path, startedAt: new Date() };
    let result = (_.result = true);
    try {
      // const includesGit = (_.includesGit = path?.includes?.('.git'));
      // if (includesGit) result = _.result = false;
      const stats = (_.stats = fs.statSync(path));
      const isFile = (_.isFile = stats.isFile());
      if (!isFile) result = _.result = false;

      const isBinary = (_.isBinary = _.isFile && isBinaryFile(path));
      if (isBinary) result = _.result = false;

      for (const commonExclude of opts.commonExcludes) {
        if (path.includes(commonExclude)) result = _.result = false;
      }

      for (const gitignore of gitignores) {
        if (micromatch.isMatch(path, gitignore)) result = _.result = false;
      }

      /* If all files pass the filters, return true */
      return result;
    } catch (e) {
      _.error = e;
      throw e;
    } finally {
      _.endedAt = new Date();
      _.runTime = +_.endedAt - _.startedAt;
      // if (path.includes('2dc4f893a3272e7b'))
      // console.debug('filter', _);
    }
  }

  function flatMapGitignore(gitignoreFile) {
    const _ = { args: gitignoreFile, startedAt: new Date() };
    try {
      if (gitignoreFile.startsWith('~')) {
        gitignoreFile = _['~'] = gitignoreFile.replace('~', homedir);
      }
      const contents = (_.contents = fs.readFileSync(gitignoreFile, 'utf8'));
      return (_.result = contents
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => !line.startsWith('#')));
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
      const contents = (_.contents = fs.readFileSync(path, 'utf8'));
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
