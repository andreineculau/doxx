
/*!
 * Dox
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

require.paths.unshift(__dirname + '/koala/lib');
var sys = require('sys');
var fs = require('fs');
var path = require('path');
var koala = require('koala');
var utils = require('./utils');
var markdown = require('github-flavored-markdown');
//markdown = require('./markdown/lib/markdown');

/**
 * Library version.
 */

var version = '0.0.4';

/**
 * Style name.
 *
 * @type String
 */

var style = 'default';

/**
 * Project title.
 *
 * @type String
 */

var title = 'Dont forget to use --title to specify me!';

/**
 * Parse JSDoc.
 *
 * @type Boolean
 */

var jsdoc = true;

/**
 * Project description.
 *
 * @type String
 */

var desc = '';

/**
 * Intro text file name.
 *
 * @type String
 */

var intro = '';

/**
 * Show private code.
 *
 * @type Boolean
 */

var showPrivate = false;

/**
 * Github url for the ribbon.
 *
 * @type String
 */

var ribbon = '';

/**
 * Usage documentation.
 */

var usage = '' +
    'Usage: dox [options] <file ...>\n' +
    '\n' +
    'Options:\n' +
    '  -t, --title STR   Project title\n' +
    '  -d, --desc STR    Project description (markdown)\n' +
    '  -i, --intro FILE  Intro file (markdown)\n' +
    '  -r, --ribbon URL  Github ribbon url\n' +
    '  -s, --style NAME  Document style, available: ["default"]\n' +
    '  -J, --no-jsdoc    Disable jsdoc parsing (coverts to markdown)\n' +
    '  -p, --private     Output private code in documentation\n' +
    '  -v, --version     Output dox library version\n' +
    '  -h, --help        Display help information' +
    '\n';

/**
 * Log the given message.
 *
 * @param {String} msg
 * @api private
 */

function log(msg) {
    sys.error('... ' + msg);
}

var regexp_comment = /^[ \t]*\/\*(\*[^]+?)\*\/[ \t]*$/;
var regexp_comment_split = /[ \t]*(\/\*\*[^]+?\*\/[ \t]*)/g;
var regexp_section = /^[ \t]*\/\/ ([^=\n]+) =+[ \t]*$/;
var regexp_section_split = /([ \t]*\/\/ [^=\n]+ =+)/g;

/**
 * Generate html for the given string of code.
 *
 *  - foo
 *    - bar
 *  - baz
 *
 * @param {String} str
 * @param {String} file
 * @return {String}
 * @api public
 */

var render = function(str, file) {
    var parts;
    var blocks = [];
    var i, len;
    var render_comment = function(str) {
        str = str || '';
        str = str.trim();
        str = str ? utils.toMarkdown(str) : '';
        str = str ? markdown.parse(str) : '';
        return str;
    };
    var render_code = function(str) {
        str = str || '';
        //str = str.trim();
        //str = str ? utils.escape(str) : '';
        str = str ? koala.render('.js', str) : '';
        return str;
    };

    (function() {
        var i, len;
        var p = [str];
        var parts_tmp;
        var splits;
        var re;
        var re_list = [regexp_section_split, regexp_comment_split];

        while (re = re_list.shift()) {
            parts_tmp = [];
            for (i = 0, len = p.length; i < len; ++i) {
                splits = p[i].split(re);
                parts_tmp = parts_tmp.concat(splits);
            }
            p = parts_tmp;
        }
        parts = p;
    })();

    // Populate blocks
    var part, next, cont;
    for (i = 0, len = parts.length; i < len; ++i) {
        part = parts[i];
        next = parts[i + 1] || '';
        cont = false;

        // Empty
        if (/^\s*$/.test(part)) {
            continue;
        // Ignored comment
        } else if (/^!\s*\*/.test(part)) {
            continue;
        } else {
            // If part is not a comment nor a section
            if (!regexp_comment.test(part) && !regexp_section.test(part)) {
                blocks.push({
                    comment: '',
                    code: render_code(part)
                });
                continue;
            }

            if (regexp_section.test(part)) {
                next = part;
                part = part.match(regexp_section);
                part = part.pop();
                blocks.push({
                    comment: markdown.parse('# ' + part),
                    code: next
                });
                continue;
            }

            // Support @ignore and --private
            if (utils.ignore(part) || (utils.isPrivate(part) && !showPrivate)) {
                continue;
            }
            part = part.replace('/*', '').replace('*/', '');
            part = part.replace(/^[ \t]*\* ?/gm, '');

            // If next is a comment or a section as well
            if (regexp_comment.test(next) || regexp_section.test(next)) {
                blocks.push({
                    comment: render_comment(part),
                    code: ''
                });
                continue;
            }

            ++i;
            blocks.push({
                comment: render_comment(part),
                code: render_code(next)
            });
        }
    }

    // Generate html
    var html = [];
    for (i = 0, len = blocks.length; i < len; ++i) {
        var block = blocks[i];
        html.push('<tr class="code">');
        html.push('<td class="docs">', block.comment || '', '</td>');
        html.push('<td class="code">', block.code ?
                  '<pre><code>' + block.code + '</code></pre>' :
                  '', '</td>');
        html.push('</tr>');
    }

    return html.join('\n');
};
exports.render = render;

/**
 * Parse the given arguments.
 *
 * @param {Array} args
 * @api public
 */

exports.parse = function(args) {
    var files = [];

    // Require an argument
    function requireArg() {
        if (args.length) {
            return args.shift();
        } else {
            throw new Error(arg + ' requires an argument.');
        }
    }

    // Parse arguments
    while (args.length) {
        var arg = args.shift();
        switch (arg) {
            case '-h':
            case '--help':
                sys.puts(usage);
                process.exit(1);
                break;
            case '-v':
            case '--version':
                sys.puts(version);
                process.exit(1);
                break;
            case '-t':
            case '--title':
                title = requireArg();
                break;
            case '-d':
            case '--desc':
                desc = requireArg();
                break;
            case '-i':
            case '--intro':
                intro = requireArg();
                break;
            case '-s':
            case '--style':
                style = requireArg();
                break;
            case '-J':
            case '--no-jsdoc':
                jsdoc = false;
                break;
            case '-p':
            case '--private':
                showPrivate = true;
                break;
            case '-r':
            case '--ribbon':
                ribbon = requireArg();
                break;
            default:
                files.push(arg);
        }
    }

    if (files.length) {
        log('parsing ' + files.length + ' file(s)');
        var pending = files.length;

        // Style
        log('loading ' + style + ' style');
        var head = fs.readFileSync(__dirname + '/styles/' + style + '/head.html', 'utf8');
        var foot = fs.readFileSync(__dirname + '/styles/' + style + '/foot.html', 'utf8');
        var css = fs.readFileSync(__dirname + '/styles/' + style + '/style.css', 'utf8');

        if (intro)
          desc = (desc || '') + fs.readFileSync(intro, 'utf8');

        // Substitutions
        head = head.replace(/\{\{title\}\}/g, title).replace(/\{\{style\}\}/, css);

        // Ribbon
        if (ribbon) {
            log('generating ribbon');
            sys.print('<a href="' + ribbon + '">' +
                  '<img alt="Fork me on GitHub" id="ribbon"' +
                  ' src="http://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png">' +
                  '</a>');
        }

        sys.print(head);
        sys.print('<table id="source"><tbody>');

        // Render files
        var first = true;
        files.forEach(function(file) {
            log('parsing ' + file);
            str = fs.readFileSync(file, 'utf8');
            if (first) {
                if (desc) desc = markdown.parse(desc);
                sys.print('<tr><td><h1>' + title + '</h1>' + desc + '</td><td></td></tr>');
                first = false;
            }
            sys.print('<tr class="filename"><td><h2 id="' + file + '"><a href="#">' +
                      path.basename(file, '.js') + '</a></h2></td><td>' +
                      file + '</td></tr>');
            sys.print(render(str, file));
            --pending || sys.print(foot, '</tbody></table>');
        });

    } else {
        throw new Error('files required.');
    }
};
