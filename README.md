Symfony JavaScript Router
=========================

This is a modern implementation of the JS router for generation Symfony routes.
Best to be used with the [JavaScript routing bundle](https://github.com/Becklyn/javascript-routing-bundle).


Initialization
--------------

For example like this (using `mojave`):

```js
import {initFromGlobalData} from "mojave/init"; 
import {Router} from "@becklyn/router";

let router = initFromGlobalData("RouterInit", new Router());
```


A manual way to wire it up to global data is like this: 

```js
function loadGlobalData (key, handler)
{
    if (undefined === window[key])
    {
        return;
    }

    // replace global callback
    window[key].init = (data) => handler.init(data);
    // handle current data
    handler.init(window[key].data);
}

let router = new Router();
loadGlobalData("RouterInit", router);
```
