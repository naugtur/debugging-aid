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
|`debugging-aid/thebugger`| Non-interactive debugger - logs all passes through the makred location after the program ends |
|`debugging-aid/blocked`| Attempt to list stack traces for functions synchronously blocking the event loop|
|`debugging-aid/leak`| Detects a potential memory leak by noticing memory consumprion growing across 5 GC passes|
|`debugging-aid/network`| Lists all outgoing network requests with their full URL and a stack trace pointing to the code making the request|
|`debugging-aid/curl`| Lists all outgoing http requests as curl commands|
|`debugging-aid/moduse`| Lists stack traces pointing to where a module is required. Module name is passed via AID_MODULE env variable - see details below|
|`debugging-aid/promisecount`| prints the number of promises created while the process was running right before it exits|
|`debugging-aid/promises`| Supports basic handlers for detecting potential issues with promises. Logs them to console |
|`debugging-aid/hooks`| Produces a tree of asynchronous calls and perf hooks output containing a diagram of asynchronous calls with their timing in the application run. See instructions below|

#### Using debugging-aid/thebugger

Whenever there's a point in your code where you feel like adding `console.log('here!')` use `thebugger;` instead. As a result, when the program ends, you'll get a log like this:

```
[aid]  [ /home/naugtur/repo/debugging-aid/935.log:101 ]
|ms     asId | stack & data  |data snip   | position               
|0.47   1    | ./935.log:1   |            | Object.<anonymous> (./test/cases/promise-bugger.js:3:1)
|0.66   1    | ./935.log:16  |trace2723   | Object.<anonymous> (./test/cases/promise-bugger.js:5:11)
|1.08   1    | ./935.log:31  |«{2723}.then| Function.resolve (<anonymous>)
|2.12   3    | ./935.log:46  |»{2723}.z   | ./test/cases/promise-bugger.js:10:13
|2.48   8    | ./935.log:54  |            | ./test/cases/promise-bugger.js:18:9
|2.53   8    | ./935.log:62  |«{2723}.x   | ./test/cases/promise-bugger.js:20:18
|105.37 8    | ./935.log:70  |after       | ./test/cases/promise-bugger.js:22:19
|105.59 14   | ./935.log:78  |{!}         | aNamedFunction (./test/cases/promise-bugger.js:31:9)
|105.78 14   | ./935.log:86  |»{2723}.y   | aNamedFunction (./test/cases/promise-bugger.js:33:13)
|205.43 20   | ./935.log:94  |            | ./test/cases/promise-bugger.js:38:5

…
```
And a log file with detailed information.

`asId` number is the current asyncId - you can see if two logs happened in the same async context (synchronously after each other) or not.
`ms` is time in miliseconds from the first `thebugger` use. Followed by the top of current stack trace.  
Full stack traces and collected data are written to a file, each output line points to the line in the log file. The log is also written at the bottom of the log file.

You can also do `thebugger = data;` 
- if data is a string, a 12 character snippet will appear on the line and the whole text will be written to the log
- if data is not a string, `{!}` will appear and the whole result of util.inspect(data) will be written to the log

The output and the log are optimized to make your IDE recognize the references to lines in files, so `(ctrl/cmd) + click` should let you jump right into code.

##### More features

If your program doesn't end gently and the message does not get printed, you can print it upon request by calling:
```js
thebugger.flush();
```

Instead of assigning, you can call thebugger as a function
```js
thebugger(data)
```

To explicitly decide what the text snippet is going to be, pass 2 values
```js
thebugger(snip, data)
```
or
```js
thebugger.data(snip, data)
```

To debug conditionally:
```js
thebugger.conditional(a===1)
thebugger.conditional(a===1,value)
thebugger.conditional(a===1,snip, data)
```

To **get a trace each time fields on an object are accessed or written**:
```js
const tracedObject = thebugger.traceAccess({ a: 1 })
```

##### Turning thebugger on and off

Add thebugger statements where you need them and then use the following lines to generate a git patch for removing and adding the whole setup at once.

```
git diff -U1 | grepdiff 'thebugger' --output-matching=hunk >  .thebugger_add.patch
git diff -U1 | grepdiff 'thebugger' --output-matching=hunk | sed s/^-/+/ > .thebugger_remove.patch
```

#### Using debugging-aid/moduse

Tested in Node.js v12

In newer versions of Node, some of the internal modules are using ES Modules and imports. Hooks for that exist, but are still very experimental. I might add them, but for now be aware this tool doesn't work with imports. https://nodejs.org/api/esm.html#esm_experimental_loaders

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

```
AID_HOOK_SCOPE='what to look for' node --trace-event-categories node.perf --require=debugging-aid/hooks app.js
```

The tool will look for AID_HOOK_SCOPE in stack traces of all functions called in new asynchronous context and trace their execution along with their descendants.   
- set AID_HOOK_SCOPE to the path to a file with code you're interested in tracing. (:linenumber will also work, it's just searching for a string in stack traces)
- Run it in the VScode terminal and you can click links in the output to jump straight to locations in code.   
- Load the node_trace file to the `about:tracing` interface in chromium/chrome dev tools and see the beginning and the ending (hence the time of synchronous execution) of each function traced.  

How to interpret the output:
```
   └[2->3] Promise.then (<anonymous>)    at start (/storage/projects/github/debugging-aid/test/cases/promise.js:7:8)
```
- [2->3] means the asynchronous jump started at the asyncId==2 and current asyncId is 3. Using indentation hints and these numbers you can follow a chain of promises or other asynchronous jumps.
- SOMETHING1 at SOMETHING2 (path) - SOMETHING1 indicates what has been run. SOMETHING2 is the name of the function inside of which the asynchronous call was initiated. Path points to an exact line in code.
- The lines are printed after each function ends its synchronous execution

This is very experimental and might provide incorrect information under unusual circumstances.  
Also, will definitely not work if your file paths contain braces. A lot of stacktrace parsing is involved.

Tested on Node.js v12.8.0  
Should work in some later versions of Node.js v11 and should not work in anything older than that.

Run this to try it out on an example - should help you understand what it does.
```
AID_HOOK_SCOPE='test/cases/promise' node --trace-event-categories node.perf test/manual-hooks.js 
AID_HOOK_SCOPE='test/cases/helper' node --trace-event-categories node.perf test/manual-hooks.js 
```

### Technical details
If you're interested

- Tools use `process._rawDebug` to print to console to avoid interfering with async hooks etc.
- debugging-aid/promises uses `multipleResolves` and `unhandledRejection` events
- debugging-aid/network hooks into socket implementation, so it can only print the URL, won't print http method etc. (unless you decide to contribute that)
- debugging-aid/moduse hooks into node's internal module cache and checks if there's been a cache fetch for the name of the module

## TODOs

- get `moduse` to also support imports, not just require
- pad asyncIDs with zeros in hooks so they're displayed correctly in chrome://tracing 

## Blue Oak Model License 1.0.0
https://blueoakcouncil.org/license/1.0.0