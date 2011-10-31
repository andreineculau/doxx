# Doxx
 Doxx is a fork of [Dox](https://github.com/visionmedia/dox).

 It uses [SyntaxHighlighter](https://github.com/alexgorbatchev/SyntaxHighlighter)
 and [github markdown](https://github.com/isaacs/github-flavored-markdown).

 You can use it not only for JavaScript source files, but for any SyntaxHighlighter
 brush available, or one that you can create yourself.

 Custom brushes, like a JSON, or a REST API brush have been added.

 Doxx can parse all sorts of comments as well, just tweak lib/dox/options.js

 Meantimes, Dox has taken some steps in this direction as well, by outputing JSON,
 but it still assumes that you comment only JavaScript source files. Your choice!

# Dox
 Dox is a JavaScript documentation generator written for [node](http://nodejs.org).

 Dox is a 2 hour product of my frustration with documentation generators. I wanted
 something that could parse my JavaScript using _markdown_ and _JSDoc_ tags, an easy
 to use _executable_, as well as a _single deployment file_, no external css or js, one file!

## Features

  * Supports JSDoc
  * Markdown bodies
  * Custom title / description
  * Simple CLI `dox`
  * Single file generated
  * Generated navigation menu
  * Linked function definitions with references
  * Syntax highlighting

## Installation

Install from npm:

    $ npm install dox

Install from git clone or tarball:

    $ make install

## Usage Examples

Simple example:

    $ dox --title Connect lib/connect/index.js

Lots of files:

    $ dox --title Connect --desc "markdown _here_" $(file lib/* -type f) > docs.html

## Usage

Output from `--help`:

    Usage: dox [options] <file ...>

	Options:
	  -t, --title      Project title
	  -d, --desc       Project description (markdown)
    -i, --intro      File that contains introduction text (markdown)
	  -s, --style      Document style, available: ["default"]
	  -J, --no-jsdoc   Disable jsdoc parsing (coverts to markdown)
	  -p, --private    Output private code in documentation
	  -h, --help       Display help information

