
/*!
 * Dox
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

// DEPENDENCIES ================================================================

var sys = require('sys');
var fs = require('fs');
var path = require('path');
require.paths.unshift(__dirname + '/../SyntaxHighlighter/scripts');
var highlighter = require('shCore').SyntaxHighlighter;
var opt = require('./options').opt;
var markdown = require('github-flavored-markdown');

/**
 * Library version.
 */
var version = '22.10.10';

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
    '  -J, --no-jsdoc    Disable jsdoc parsing (fallback to markdown)\n' +
    '  -p, --private     Output private code in documentation\n' +
    '  -v, --version     Output dox library version\n' +
    '  -h, --help        Display help information' +
    '\n';

// FUNS ========================================================================

/**
 * Log the given message.
 *
 * @param {String} msg
 * @api private
 */
function log(msg) {
    sys.error('... ' + msg);
}

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
    var extname = path.extname(file).substr(1);
    var options = opt[extname] || opt._;
    var render_cfg = {
        toolbar: false,
        'first-line': 1,
        'smart-tabs': true
    };
    var update_render_cfg = function(part) {
        part = part || '';
        render_cfg['first-line'] += part.length - part.replace(/\n/g, '').length;
    };
    var render_code = function(str) {
        str = str || '';
        if (/^\s*$/.test(str)) {
            return '';
        }
        str = str
            .replace(/ /g, '&nbsp;')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        // TODO Tab size should be dynamic

        var brush = new options.brush();
        brush.init(render_cfg);
        return brush.getHtml(str);
    };

    // PARTS: Split content
    var re_splits;
    var re_extract;
    var parts;
    (function() {
        var i, ilen;
        var parts_new = [str];
        var re;
        var splits = options.comments;

        if (!splits) {
            parts = [str];
            return;
        }

        re_splits = [];
        re_extract = [];
        for (i = 0, ilen = splits.length; i < ilen; ++i) {
            re_splits.push(splits[i].split);
            re_extract.push(splits[i].extract.source);
        }
        re_extract = new RegExp(re_extract.join('|'));

        while (re_splits.length) {
            re = re_splits.shift();
            parts_tmp = [];
            for (i = 0, ilen = parts_new.length; i < ilen; ++i) {
                parts_tmp = parts_tmp.concat(parts_new[i].split(re));
            }
            parts_new = parts_tmp;
        }
        parts = parts_new;
    })();

    // BLOCKS: Populate HTML blocks based on split content
    var part;
    var blocks = [];
    var i, ilen;
    var j, jlen;
    for (i = 0, ilen = parts.length; i < ilen; i++) {
        part = parts[i];

        // Empty
        if (/^\s*$/.test(part)) {
            update_render_cfg(part);
            continue;
        // Ignored comment
        //} else if (/^!\s*\*/.test(part)) {
        //    update_render_cfg(part);
        //    continue;
        } else {
            // If part is not a split
            if (!re_extract || !re_extract.test(part)) {
                if (i > 0 && typeof blocks[blocks.length-1].code === 'undefined') {
                    blocks[blocks.length-1].code = render_code(part);
                } else {
                    blocks.push({
                        code: render_code(part)
                    });
                }
                update_render_cfg(part);
                continue;
            }

            // Otherwise, if it's a split
            for (j = 0, jlen = options.comments.length; j < jlen; j++) {
                if (options.comments[j].extract.test(part)) {
                    if (typeof options.comments[j].callback === 'function') {
                        blocks = blocks.concat(options.comments[j].callback(
                            part,
                            part.match(options.comments[j].extract)
                        ));
                    } else {
                        blocks.push({
                            comment: part.match(options.comments[j].extract)[1]
                        });
                    }
                    update_render_cfg(part);
                    break;
                }
            }
        }
    }

    // HTML Generate
    var html = [];
    var fileOverview = '';
    for (i = 0, ilen = blocks.length; i < ilen; i++) {
        if (!blocks[i].comment && !blocks[i].code) {
            continue;
        }

        if (blocks[i].fileOverview) {
            fileOverview += '<br>' + blocks[i].fileOverview;
        }

        html.push('<tr class="code"><td class="comments ' +
                  (blocks[i]['class'] || '') + '">' +
                  (blocks[i].comment || '') +
                  '</td><td class="code">' +
                  (blocks[i].code || '')  +
                 '</td></tr>');
    }

    html.unshift('<tr class="filename"><td><h2 id="' + file + '">' +
                 path.basename(file, '.js') + '</h2>' +
                 '</td><td>' +
                 file + fileOverview +
                 '</td></tr>');
    return html.join('\n');
};
exports.render = render;

// RUN =========================================================================

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
        // Add SyntaxHighlighter styles
        css = fs.readFileSync(__dirname + '/../SyntaxHighlighter/styles/shThemeEmacs.css', 'utf8') + css;
        css = fs.readFileSync(__dirname + '/../SyntaxHighlighter/styles/shCoreEmacs.css', 'utf8') + css;

        if (intro) {
          desc = (desc || '') + fs.readFileSync(intro, 'utf8');
        }

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
            sys.print(render(str, file));
            --pending || sys.print(foot, '</tbody></table>');
        });

    } else {
        throw new Error('files required.');
    }
};
