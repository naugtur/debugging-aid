# debugging-aid
Experimental tools for debugging Node.js apps without pausing.

> Just like with a debugger, these are not meant to run in production in most cases.

## Usage

Tools added via simple require

```
node --require=TOOL app.js
```
or in the beginning of your program:
```js
require('TOOL')
```

All outputs from debugging-aid start with `[aid] `
```
[aid] network, outgoing  
 to: http://127.0.0.1:33453/something?attr=value
 stack:     at Agent.createSocket (_http_agent.js:234:26)
    at Agent.addRequest (_http_agent.js:193:10)

...

```

### Tools

|name to require|description|
|---|---|
|`debugging-aid/promises`| Supports basic handlers for detecting potential issues with promises. Logs them to console |
|`debugging-aid/blocked`| Attempt to list stack traces for functions synchronously blocking the event loop|
|`debugging-aid/network`| Lists all outgoing network requests with their full URL and a stack trace pointing to the code making the request|
|`debugging-aid/moduse`| Lists stack traces pointing to where a module is required. Module name is passed via AID_MODULE env variable - see details below|
|`debugging-aid/hooks`| **work in progress** Produces perf hooks output containing a diagram of asynchronous calls in the application run. See instructions below|

#### Using debugging-aid/moduse

Tested in Node.js v12

To list traces to all modules that require the `net` internal module:

```
AID_MODULE=net node --require debugging-aid/moduse app.js 
```

To list traces to where a non-internal module is required, pass an absolute path to a file.
This would list where `request` was required, but only the one installed top-level

```
AID_MODULE='/home/you/app/node_modules/request/index.js' node --require debugging-aid/moduse app.js 
```


#### Using debugging-aid/hooks

This one is still a work in porgress and probably doesn't work at all.

```
node --trace-event-categories node.perf --require=debugging-aid/hooks app.js
```
Load output to the `about:tracing` interface in chromium/chrome dev tools


### Technical details

- Tools use `process._rawDebug` to print to console to avoid interfering with async hooks etc.
- debugging-aid/promises uses `multipleResolves` and `unhandledRejection` events
- debugging-aid/network hooks into socket implementation, so it can only print the URL, won't print http method etc. (unless you decide to contribute that)
- debugging-aid/moduse hooks into node's internal module cache and checks if there's been a cache fetch for the name of the module
## Blue Oak Model License 1.0.0
https://blueoakcouncil.org/license/1.0.0