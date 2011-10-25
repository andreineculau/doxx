(function()
 {
     // CommonJS
     typeof(require) != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;

     function Brush()
     {
         // https://github.com/jashkenas/coffee-script/blob/master/src/lexer.coffee#L532
         var keywords =
             'true false null this ' +
             'new delete typeof in instanceof ' +
             'return throw break continue debugger ' +
             'if else switch for while do try catch finally ' +
             'class extends super ' +
             'undefined then unless until loop of by when';
         var r = SyntaxHighlighter.regexLib;
         this.regexList = [
             { regex: r.singleLinePerlComments,                     css: 'comments'      },
             { regex: r.doubleQuotedString,                         css: 'string'        },
             { regex: r.singleQuotedString,                         css: 'string'        },
             { regex: new RegExp(this.getKeywords(keywords), 'gm'), css: 'keyword'       },
             { regex: /@\w+/g,                                      css: 'variable bold' }, // @instance variables
         ];
         this.forHtmlScript(r.scriptScriptTags);
     };

     Brush.prototype = new SyntaxHighlighter.Highlighter();
     Brush.aliases   = ['coffee', 'coffeescript'];

     SyntaxHighlighter.brushes.CoffeeScript = Brush;

     // CommonJS
     typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
 })();
