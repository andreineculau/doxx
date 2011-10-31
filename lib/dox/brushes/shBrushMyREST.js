;(function()
{
	// CommonJS
	typeof(require) != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;

	function Brush()
	{
        var keywords =
            'send receive ' +
            // Methods
            'OPTIONS HEAD GET POST PUT DELETE TRACE CONNECT ' +
            // Request
            'accept accept_charset accept_encoding accept_language cache_control ' +
            'referer cookie ' +
            // Response
            'status allow cache_control connection content_encoding content_language ' +
            'content_location content_type location mediaType set_cookie ' +
            // Header
            '100_continue ' +
            '200_ok 201_created 202_accepted 204_no_content' +
            '301_moved_permanently 303_see_other 304_not_modified 307_temporary_redirect ' +
            '400_bad_request 401_unathorized 403_forbidden 404_not_found 405_method_not_allowed 409_conflict 410_gone 415_unsupported_media_type ' +
            '500_internal_server_error ';

        this.regexList = [
            { regex: SyntaxHighlighter.regexLib.doubleQuotedString, css: 'string'           }, // strings
            { regex: SyntaxHighlighter.regexLib.singleQuotedString, css: 'string'           }, // strings
            { regex: new RegExp(this.getKeywords(keywords), 'gm'),  css: 'keyword'          }
	    ];
	};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
    Brush.aliases	= ['myrest'];

    SyntaxHighlighter.brushes.myREST = Brush;

	// CommonJS
	typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();
