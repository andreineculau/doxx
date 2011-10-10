var markdown = require('github-flavored-markdown');
var sys = require('sys');
var toMarkdown;

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
                        comment: markdown.parse('# ' + matches[1]),
                        'class': 'section'
                    }, {
                        code: ''
                    }];
                }
            },{
                // JSDOC
                split:    /([ \t]*\/\*\*[^]+?\*\/[ \t]*\n)/g,
                extract:  /[ \t]*\/\*(\*[^]+?)\*\/[ \t]*\n/,
                callback: function(part, matches) {
                    // Support @ignore and --private
                    //if (utils.ignore(part) || (utils.isPrivate(part) && !showPrivate)) {
                    //    continue;
                    //}
                    //part = part.replace('/*', '').replace('*/', '');
                    matches[1] = matches[1].replace(/[ \t]*\* ?/g, '');
                    matches[1] = toMarkdown(matches[1]);

                    return [{
                        comment: markdown.parse(matches[1])
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
toMarkdown = function(str) {
    str = str
        //.replace(/\r?\n/gm, '  \n')
        .replace(/^((?:[A-Z]\w* ?)+):/gm, '## $1')
        .replace(/^[ \t]*@(\w+)[ \t]+\{([^}]+)\}[ \t]+([a-z]\w+)([ \t]+[^\n]+)?/gm, function(_, key, type, name, desc){
            return '\n - **' + key + '**: _' + type.split(/ *[|\/] */).join(' | ') + '_ **' + (name || '') + '** '  + (desc || '') + '\n';
        })
        .replace(/^[ \t]*@(\w+)[ \t]+\{([^}]+)\}([ \t]+[^\n]+)?/gm, function(_, key, type, desc){
            return '\n - **' + key + '**: _' + type.split(/ *[|\/] */).join(' | ') + '_ ' + (desc || '') + '\n';
        })
        .replace(/^[ \t]*@(\w+)[ \t]+(\w+)$/gm, '  \n - **$1**: _$2_\n')
        .replace(/^[ \t]*@(\w+)?/gm, '  \n - **$1**\n');
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
