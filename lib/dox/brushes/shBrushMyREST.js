;(function()
{
	// CommonJS
	typeof(require) != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;

	function Brush()
	{
        var keywords =
            'OPTIONS HEAD GET POST PUT DELETE ' +
            'send receive';
        var useless =
            '( ) ;';

        this.regexList = [
            { regex: SyntaxHighlighter.regexLib.doubleQuotedString, css: 'string'           }, // strings
            { regex: SyntaxHighlighter.regexLib.singleQuotedString, css: 'string'           }, // strings
            { regex: new RegExp(this.getKeywords(keywords), 'gm'),  css: 'keyword'          },
            { regex: new RegExp(this.getKeywords(useless), 'gm'),   css: 'comments useless' }
	    ];
	};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
    Brush.aliases	= ['myrest'];

    SyntaxHighlighter.brushes.myREST = Brush;

	// CommonJS
	typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();
