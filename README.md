#OKlib

It's OK to use it

This repository contains the Sinusbot Script Library OKLib and the JSDoc based javascript file from which the documentation can be generated.

##Example

Demo Script that explains how to use the OK_lib


```javascript
registerPlugin({
    name: 'Demo Script',
    version: '1.0',
    description: 'OK_Lib_Demo',
    author: 'Author <author@example.com>',
    vars: []
}, function(sinusbot, config) {
    event.on('load', function(){
        var lib = require('OK_lib.js');
        //Your Code goes here
    }
});
```


