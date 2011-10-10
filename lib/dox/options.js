var markdown = require('github-flavored-markdown');
var sys = require('sys');
var JSDOCtoMarkdown;

exports.opt = {
    _: {
        brush: require('shBrushPlain').Brush
    },

    js: {
        brush: require('shBrushJScript').Brush,
        comments: [
            {
                // Section
                split:    /([ \t]*\/\/ [^=\n]+? =+\n)/g,
                extract:  /[ \t]*\/\/ ([^=\n]+) =+[ \t]*\n/,
                callback: function(part, matches) {
                    return [{
                        'comment': markdown.parse('# ' + matches[1]),
                        'class': 'section'
                    }, {
                        'code': ''
                    }];
                }
            },{
                // JSDOC
                split:    /([ \t]*\/\*\*[^]+?\*\/[ \t]*\n)/g,
                extract:  /[ \t]*\/\*(\*[^]+?)\*\/[ \t]*\n/,
                callback: function(part, matches) {
                    var re_type_name = /^[ \t]*@(\w+)[ \t]+\{([^}]+)\}[ \t]+([a-z]\w+)([ \t]+[^\n]+)?/gm;
                    var re_type = /^[ \t]*@(\w+)[ \t]+\{([^}]+)\}([ \t]+[^\n]+)?/gm;
                    var re_key_value = /^[ \t]*@(\w+)[ \t]+(\w+)$/gm;
                    var re_key = /^[ \t]*@(\w+)?/gm;

                    //part = part.replace('/*', '').replace('*/', '');
                    matches[1] = matches[1]
                        .replace(/[ \t]*\* ?/g, '')
                    //.replace(/\r?\n/gm, '  \n')
                    //.replace(/^((?:[A-Z]\w* ?)+):/gm, '## $1')
                    // @param {type} name Description
                        .replace(re_type_name, function(_, key, type, name, desc){
                            return '\n - **' + key + '**: _' + type.split(/ *[|\/] */).join(' | ') + '_ **' + (name || '') + '** '  + (desc || '') + '\n';
                        })
                    // @return {type} Description
                        .replace(re_type, function(_, key, type, desc){
                            return '\n - **' + key + '**: _' + type.split(/ *[|\/] */).join(' | ') + '_ ' + (desc || '') + '\n';
                        })
                    // @fileOverview Description
                        .replace(re_key_value, '  \n - **$1**: _$2_\n')
                    // @inner
                        .replace(re_key, '  \n - **$1**\n')
                        .trim();

                    var is_private = false;
                    var is_ignore = false;
                    var file_overview = '';
                    if (/ \- \*\*fileOverview\*\*: _/.test(matches[1])) {
                        file_overview = matches[1].replace(/ \- \*\*fileOverview\*\*: (.*)/, '$1');
                        matches[1] = '';
                    }

                    if (/@private/.test(matches[1])) {
                        is_private = true;
                    }

                    if (/@ignore/.test(matches[1])) {
                        is_ignore = true;
                    }

                    return [{
                        'comment': markdown.parse(matches[1]),
                        'private': is_private,
                        'ignore': is_ignore,
                        'file_overview': file_overview
                    }];
                }
            }/*,{
                      split:
                      extract:
                      }
                      ,{
                      split:
                      extract:
                      }
            */
        ]
    },

    css: {
        brush: require('shBrushCss').Brush
    },

    sass: {
        brush: require('shBrushSass').Brush
    },

    scss: {
        brush: require('shBrushSass').Brush
    },

    erl: {
        brush: require('shBrushErlang').Brush
    }
};
exports.opt.php = {
    brush: require('shBrushPhp').Brush,
    comments: exports.opt.js.comments
}

/**
 * Convert the given string of jsdoc to markdown.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */
JSDOCtoMarkdown = function(str) {
    str = str
    return str.trim();
};


/*!
 * Dox
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Check if the given string of docs contains @ignore.
 *
 * @param {String} str
 * @return {Boolean}
 * @api public
 */

/*exports.ignore = function(str) {
    return str.indexOf('@ignore') >= 0;
};*/

/**
 * Check if the given string of docs appears to be private.
 *
 * @param {String} str
 * @return {Boolean}
 * @api public
 */

/*exports.isPrivate = function(str) {
    return str.indexOf('@private') >= 0 ||
        str.indexOf('@api private') >= 0;
};*/
