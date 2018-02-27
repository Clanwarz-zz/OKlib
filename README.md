# OKlib

It's OK to use it

This repository contains the [Sinusbot](https://www.sinusbot.com/) Script Library OKlib and the JSDoc based javascript file from which the [documentation](http://www.server-n2.de/OKlib/external) can be generated.

## Example

Demo Script that explains how to use the OKlib


```javascript
registerPlugin({
    name: 'Demo Script',
    version: '1.0',
    description: 'OKlib_Demo',
    author: 'Author <author@example.com>',
    vars: []
}, function(sinusbot, config) {
    require('event').on('load', function(){
        var lib = require('OKlib.js');
        main(lib);
    });
    function main(OKlib){
        //Your code goes here
    }
});
```

## Build

If you want to build the documentation files follow the next steps

### Install [documentation.js](https://github.com/documentationjs/documentation)

```bash
npm install -g documentation
```
### Generate html file

```bash
documentation build api.js --project-name "OKlib" -f html -o documentation
```
