node_modules:
	@npm install

docs: node_modules
	@node ./node_modules/jsdoc/jsdoc.js -c .jsdoc

.PHONY: all test clean docs browser
