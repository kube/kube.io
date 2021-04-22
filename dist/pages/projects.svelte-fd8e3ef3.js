import{S as e,i as t,s as a,e as n,t as i,c as s,a as r,b as o,d as l,o as c,f as u,g as p,h,p as d,q as g,r as m,w as f,x as b,y,j as w,l as v,C as k,D as x,n as F,O as A,P as S,V as j,Q as $,R as T}from"../chunks/vendor-29114a38.js";import{G as C}from"../chunks/Github-7e09389d.js";import{c as E,a as I,m as R}from"../chunks/marked-48ce9fa6.js";import{f as P,a as _}from"../chunks/index-5658a734.js";const L=([e])=>e.replace(/^\n/,"").replace(/\n\s+$/,"").replace(/^\s+\|/gm,""),z=[{title:"Monolite",text:L`
          |**Monolite** is a simple, type-safe,
          |[Structural-Sharing](https://www.youtube.com/watch?v=pLvrZPSzHxo&feature=youtu.be&t=1390)
          |library.
          |
          |It was originally written for usage in Redux reducers,
          |but can be used anywhere you want to preserve an object immutability.
          |
          |**ImmutableJS** is
          |[not able to infer type](https://github.com/facebook/immutable-js/issues/1462)
          |on sub-state-trees as it uses strings to define sub-tree to update:
          |
          |\`\`\`js
          |state.set(['some', 'nested', 'property'], 42)
          |\`\`\`
          |
          |Monolite, on its side, uses accessor functions to get the target node
          |of the state tree to update:
          |\`\`\`js
          |set(state, _ => _.some.nested.property, 42)
          |\`\`\`
          |
          |This allows TypeScript to do static analysis and
          |completion on the sub-state type, and type of the updated value.
          |
          |The library uses ES6 Proxies under-the-hood to analyze the
          |accessor function.
          |These functions, though, can be statically resolved, using
          |[a Babel Plugin](https://github.com/kube/babel-plugin-monolite),
          |permitting to target older browsers not supporting \`Proxy\`.
          `,github:"https://github.com/kube/monolite",npm:"https://npmjs.org/package/monolite"},{title:"ReturnOf",text:L`
          |**ReturnOf** was a workaround solution permitting type inference
          |on function returns in TypeScript.
          |
          |Getting the return type of a function is something particularly
          |interesting, in case of Redux Action Creators or React-Redux
          |containers, to prevent code duplication, for example.
          |
          |I had also opened a proposal on TypeScript
          |[static type inference](https://github.com/Microsoft/TypeScript/issues/14400),
          |enabling a static-only solution for return type inference.
          |
          |TypeScript 2.8 finally introduced
          |[Conditional Types](https://github.com/Microsoft/TypeScript/pull/21316),
          |and added a new [\`ReturnType\`](https://github.com/Microsoft/TypeScript/pull/21496)
          |using a new \`infer\` keyword.
          `,github:"https://github.com/kube/returnof"},{title:"WhenSwitch",text:L`
          |**WhenSwitch** adds Ruby-like \`case/when\` statements in JavaScript,
          |through a single \`when\` function.
          |
          |Ternary expressions become too much nested when handling too much cases,
          |and switch statements are
          |[error-prone and block-only](https://medium.com/chrisburgin/rewriting-javascript-replacing-the-switch-statement-cfff707cf045),
          |WhenSwitch enables simple function conditional flows, as expressions:
          |
          |\`\`\`js
          |const getDrinkPrice = drink =>
          |  when(drink)
          |    .is('Coke', 1.50)
          |    .is('Pepsi', 1.80)
          |    .else(2.00)
          |\`\`\`
          |
          |This is useful for conditional components in React for example:
          |\`\`\`jsx
          |<div>
          |  {
          |    when(props.page)
          |      .is('Hello', () => <HelloPage />)
          |      .is('World', () => <WorldPage />)
          |      .else(() => <Page404 />)
          |  }
          |</div>
          |\`\`\`
          |
          |JavaScript not being lazily evaluated though,
          |it adds some overhead on expressions, needing to wrap them in thunks.
          |
          |Another issue is with TypeScript: The goal here was to have something
          |completely type-safe, but as it was impossible at the moment to define
          |generic [type guards](https://basarat.gitbooks.io/typescript/docs/types/typeGuard.html),
          |I left this library as it was, and for now only use it for simple cases.
          `,github:"https://github.com/kube/when-switch"},{title:"Kay Theme",picture:"https://github.com/kube/vscode-kay-theme/raw/master/images/theme-dark.png",text:L`
          |**Kay** is my personal code editor theme.
          |
          |It was designed to be colored,
          |with an **80's-inspired color palette**, without losing **focus on code**.
          |
          |Comments and all non-code text are nearly invisible. It also includes a Light Theme.
          `,github:"https://github.com/kube/vscode-kay-theme"},{title:"Redux Electron Global Dispatch",text:L`
          |This library provides a simple way to have **Redux actions globally dispatched**
          |through all processes of an Electron application, thanks to a middleware.
          |
          |It permits to define easily which actions will be dispatched globally,
          |by configuring the middleware:
          |\`\`\`js
          |applyMiddleware(
          |  createGlobalDispatchMiddleware(action =>
          |    action.type === 'INCREMENT'
          |  )
          |)
          |\`\`\`
          |
          |Or if using the default already-specialized middleware, just
          |define actions with a \`global\` property set to \`true\`:
          |\`\`\`js
          |const globalIncrement = x => ({
          |  global: true,
          |  type: 'INCREMENT',
          |  payload: x
          |})
          |\`\`\`
          `,github:"https://github.com/kube/redux-electron-global-dispatch"},{title:"React Electron",text:L`
          |Just a proof-of-concept, but already in production usage in
          |PandaNote.
          |
          |**React Electron** provides a simple driver for BrowserWindow
          |declaration in Electron, using React.
          |
          |\`\`\`jsx
          |render(
          |  <App>
          |    {
          |      state.notes.map(note =>
          |        <BrowserWindow
          |          key={note.id}
          |          url={NOTE_RENDERER_PATH}
          |          height={640}
          |          width={480}
          |          onClose={() => store.dispatch(
          |            closeNoteRequest(note.id)
          |          )}
          |        />
          |      )
          |    }
          |  </App>
          |)
          |\`\`\`
          |
          |No more manual management of window properties, all is reactive.
          |Needs to be re-written with a cleaner API though.
          `,github:"https://github.com/kube/react-electron"},{title:"42 GraphQL",text:L`
          |**42 GraphQL** was a Façade of the 42 REST API, using
          |[GraphQL](http://graphql.org/).
          |
          |42 REST API was very slow and not easily understable.
          |The idea here was to wrap it in a
          |[GraphQL Schema](https://github.com/kube/42GraphQL/tree/master/src/Schema),
          |and cache resources in a Redis cache for faster responses.
          |
          |GraphQL permits to reduce heavily number of REST API calls,
          |as server response maps the client query, which resulted in a really
          |fast API.
          |
          |This was done without access to the database, only upon the public REST API.
          `,github:"https://github.com/kube/42graphql"},{title:"42 Scalizer",text:L`
          |When creating exercises for the **42 JavaScript Piscine**
          |(a 2-week programming bootcamp), I had to create validation scales
          |using a Yaml Schema really difficult to change once written:
          |- 100 points were dispatched between each exercise manually.
          |- Each exercise had to be numbered by its index by hand.
          |
          |If an exercise was modified or added anywhere, this had to be done
          |again for all exercises.
          |
          |**42 Scalizer** was a simple CLI permitting to automatically harmonize
          |exercise points, and allowing float values.
          |
          |It also used a much more simple schema, permitted exportation
          |to the legacy format for compatibility, and visualized points progression
          |in a simple chart.
          `,github:"https://github.com/kube/scalizer"},{title:"VSCode ClangComplete",text:L`
          |When VSCode opened third-party extensions I took a look at their Language Server
          |implementation.
          |
          |**C/C++ Completion** was not offered at this time, so I dediced to
          |port the simple [**Clang Complete**](https://github.com/Rip-Rip/clang_complete),
          |respecting the VSCode Language Server architecture.
          `,github:"https://github.com/kube/vscode-clang-complete"},{title:"VSCode 42 Header",text:L`
          |A **VSCode extension** for 42 Students.
          |
          |42 projects need to include a 42 header in all source files.
          |This extension provides this header, with automatic refresh on save.
          `,github:"https://github.com/kube/vscode-42header"},{title:"CUT",text:L`
          |**CUT** is for C Unit Testing.
          |
          |It was an attempt to create a simple way to write unit tests
          |for C programs.
          |
          |It included **CutRun**, a CLI written in Ruby in charge of compiling
          |and running automatically the tests.
          |
          |This permitted to reduce need of test-specific configuration in the project.
          |Comment-based directives could be added in top of test files, to
          |provide more compilation flags to CutRun.
          |
          |The idea was to try to offer a programming experience close from
          |what could be found with **Jest** in the JavaScript world.
          |
          |The project was abandonned as I was not sure of the architecture
          |and I was not programming anymore with C at the time.
          `,github:"https://github.com/kube/cut"},{title:"Kuji",text:L`
          |**Kuji** was a simple library for NodeJS, simplifying asynchronous tasks.
          |
          |It was a more generic version of a previous MongoDB-specific library
          |[MongoAsyncMultiRequest](https://github.com/kube/mongoAsyncMultiRequest).
          |
          |Its goal was to easily create a **control-flow graph** for asynchronous tasks,
          |by providing dependencies between them.
          |This permitted to optimize the execution timeline.
          |
          |It was abandonned once I realized that the \`graph\` feature, which was the
          |real added-value, was already included in **Async** as
          |[\`auto\`](https://caolan.github.io/async/docs.html#auto).
          `,github:"https://github.com/kube/kuji",npm:"https://www.npmjs.com/package/kuji"},{title:"Zappy",text:L`
          |**Zappy** is a game composed by three programs:
          |- A **Server**, written in C, emulating a map containing different resources.
          |
          |- An **AI**, written in CoffeeScript/NodeJS, connecting to the server, and trying to evolve by taking resources which permits it to level up.
          |
          |  Elevation is only permitted after a group incantation. AI need to group themselves on the same cell before being able to do the incantation.
          |
          |  The tricky part is that AI are not able to know locations nor level of other AI on the map.
          |  All they are able to do is to broadcast a sound saying that they are waiting for other AI for elevation incantation,
          |  which permits to know in which direction AI has to go to find others.
          |
          |  Each new AI is a fork of its parent.
          |
          |- A **Graphic Visualizer**, written in NodeWebkit/ThreeJS, which shows in real-time what happens on the map.
          |
          |All inter-process communication was achieved through TCP.
          `,youtube:"https://youtube.com/embed/F2R2BoDBg5Y",github:"https://github.com/kubekhrm/zappy"},{title:"RayTracer",youtube:"https://www.youtube.com/embed/1JoTZg4Ulo0",text:L`
          |**RayTracer** was 42 first-semester Graphics final group project.
          |
          |The imperative was to create a basic
          |[raytracer](https://en.wikipedia.org/wiki/Ray_tracing_(graphics))
          |with some simple geometric shapes.
          |
          |We decided to differentiate from other projects on the UX, by adding an
          |embedded editor usable with mouse/keyboard, a post-render adjustable diaphragm,
          |and some other commands.
          |
          |This implied performance optimization, so we decided to make the renderer asynchronous
          |from the scene-edition events, and to use multithreading for faster computation.
          |
          |All this project was written in pure C, upon our LibFt and a subset of LibX called
          |[MiniLibX](https://github.com/abouvier/minilibx).
          `,github:"https://github.com/kubekhrm/RT"},{title:"FdF",text:L`
          |**FdF** was 42 first Graphics project.
          |
          |It's a **basic [rasterizer](https://en.wikipedia.org/wiki/Rasterisation)**,
          |which takes a map of altitudes as input, and needs to render
          |a 3D view of it.
          |
          |No helper library are allowed, so each part
          |(color blend, line-drawing, antialias, camera, projection...)
          |had to be recoded from scratch.
          |
          |My project added as bonuses:
          |- Antialiased lines
          |- Movement blur
          |- Parallel/One-point perspective switch
          |- Adjustable perspective point.
          |
          |All this project was written in pure C, upon our LibFt and a subset of LibX called
          |[MiniLibX](https://github.com/abouvier/minilibx).`,youtube:"https://youtube.com/embed/X3pcTRCgQF4"},{title:"LibFt",text:L`
          |42 first project.
          |
          |**LibFt** is a recode of a subset the
          |[C Standard Library](https://en.wikipedia.org/wiki/C_standard_library),
          |which is the first block of all other C projects at 42.
          |
          |Usage of **LibC is prohibited** in 42 C Projects, so each project needs to use only
          |functions from our own LibFt.
          |
          |With the time, multiple functions were added, to include Color Manipulation,
          |Data-Structures, Trigonometry, Infinite Numbers, Hash Function, and a basic Test Framework.
          `,github:"https://github.com/kube/libft"},{title:"Sudoku",text:L`
          |This **Sudoku** was my first C project, when at **Faculty of Science of Luminy**.
          |
          |The subject was to create a **Sudoku Solver**, with a simple graphical interface,
          |using a simple Façade library for LibX/Win32 named
          |[EZ-Draw](https://pageperso.lif.univ-mrs.fr/~edouard.thiel/ez-draw/index.html).
          |
          |Skeleton of the project was given with most of code structure, with program state already defined,
          |the goal was to add a simple **back-tracking algorithm** to check if the user-given grid was valid and
          |solve it if possible.
          |
          |My project added a grid generator, with multiple available levels, and some
          |work has been done on the UI to have something responsive and clean.
          `,picture:"https://cloud.githubusercontent.com/assets/2991143/25461505/b3c40da0-2ae9-11e7-8e2b-7a02515d4991.gif",github:"https://github.com/kube/luminy-sudoku"}];var M=E((function(e){var t=function(e){var t=/\blang(?:uage)?-([\w-]+)\b/i,a=0,n={manual:e.Prism&&e.Prism.manual,disableWorkerMessageHandler:e.Prism&&e.Prism.disableWorkerMessageHandler,util:{encode:function e(t){return t instanceof i?new i(t.type,e(t.content),t.alias):Array.isArray(t)?t.map(e):t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++a}),e.__id},clone:function e(t,a){var i,s;switch(a=a||{},n.util.type(t)){case"Object":if(s=n.util.objId(t),a[s])return a[s];for(var r in i={},a[s]=i,t)t.hasOwnProperty(r)&&(i[r]=e(t[r],a));return i;case"Array":return s=n.util.objId(t),a[s]?a[s]:(i=[],a[s]=i,t.forEach((function(t,n){i[n]=e(t,a)})),i);default:return t}},getLanguage:function(e){for(;e&&!t.test(e.className);)e=e.parentElement;return e?(e.className.match(t)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(n){var e=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(n.stack)||[])[1];if(e){var t=document.getElementsByTagName("script");for(var a in t)if(t[a].src==e)return t[a]}return null}},isActive:function(e,t,a){for(var n="no-"+t;e;){var i=e.classList;if(i.contains(t))return!0;if(i.contains(n))return!1;e=e.parentElement}return!!a}},languages:{extend:function(e,t){var a=n.util.clone(n.languages[e]);for(var i in t)a[i]=t[i];return a},insertBefore:function(e,t,a,i){var s=(i=i||n.languages)[e],r={};for(var o in s)if(s.hasOwnProperty(o)){if(o==t)for(var l in a)a.hasOwnProperty(l)&&(r[l]=a[l]);a.hasOwnProperty(o)||(r[o]=s[o])}var c=i[e];return i[e]=r,n.languages.DFS(n.languages,(function(t,a){a===c&&t!=e&&(this[t]=r)})),r},DFS:function e(t,a,i,s){s=s||{};var r=n.util.objId;for(var o in t)if(t.hasOwnProperty(o)){a.call(t,o,t[o],i||o);var l=t[o],c=n.util.type(l);"Object"!==c||s[r(l)]?"Array"!==c||s[r(l)]||(s[r(l)]=!0,e(l,a,o,s)):(s[r(l)]=!0,e(l,a,null,s))}}},plugins:{},highlightAll:function(e,t){n.highlightAllUnder(document,e,t)},highlightAllUnder:function(e,t,a){var i={callback:a,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};n.hooks.run("before-highlightall",i),i.elements=Array.prototype.slice.apply(i.container.querySelectorAll(i.selector)),n.hooks.run("before-all-elements-highlight",i);for(var s,r=0;s=i.elements[r++];)n.highlightElement(s,!0===t,i.callback)},highlightElement:function(a,i,s){var r=n.util.getLanguage(a),o=n.languages[r];a.className=a.className.replace(t,"").replace(/\s+/g," ")+" language-"+r;var l=a.parentElement;l&&"pre"===l.nodeName.toLowerCase()&&(l.className=l.className.replace(t,"").replace(/\s+/g," ")+" language-"+r);var c={element:a,language:r,grammar:o,code:a.textContent};function u(e){c.highlightedCode=e,n.hooks.run("before-insert",c),c.element.innerHTML=c.highlightedCode,n.hooks.run("after-highlight",c),n.hooks.run("complete",c),s&&s.call(c.element)}if(n.hooks.run("before-sanity-check",c),!c.code)return n.hooks.run("complete",c),void(s&&s.call(c.element));if(n.hooks.run("before-highlight",c),c.grammar)if(i&&e.Worker){var p=new Worker(n.filename);p.onmessage=function(e){u(e.data)},p.postMessage(JSON.stringify({language:c.language,code:c.code,immediateClose:!0}))}else u(n.highlight(c.code,c.grammar,c.language));else u(n.util.encode(c.code))},highlight:function(e,t,a){var s={code:e,grammar:t,language:a};return n.hooks.run("before-tokenize",s),s.tokens=n.tokenize(s.code,s.grammar),n.hooks.run("after-tokenize",s),i.stringify(n.util.encode(s.tokens),s.language)},tokenize:function(e,t){var a=t.rest;if(a){for(var n in a)t[n]=a[n];delete t.rest}var i=new o;return l(i,i.head,e),r(e,i,t,i.head,0),function(e){var t=[],a=e.head.next;for(;a!==e.tail;)t.push(a.value),a=a.next;return t}(i)},hooks:{all:{},add:function(e,t){var a=n.hooks.all;a[e]=a[e]||[],a[e].push(t)},run:function(e,t){var a=n.hooks.all[e];if(a&&a.length)for(var i,s=0;i=a[s++];)i(t)}},Token:i};function i(e,t,a,n){this.type=e,this.content=t,this.alias=a,this.length=0|(n||"").length}function s(e,t,a,n){e.lastIndex=t;var i=e.exec(a);if(i&&n&&i[1]){var s=i[1].length;i.index+=s,i[0]=i[0].slice(s)}return i}function r(e,t,a,o,u,p){for(var h in a)if(a.hasOwnProperty(h)&&a[h]){var d=a[h];d=Array.isArray(d)?d:[d];for(var g=0;g<d.length;++g){if(p&&p.cause==h+","+g)return;var m=d[g],f=m.inside,b=!!m.lookbehind,y=!!m.greedy,w=m.alias;if(y&&!m.pattern.global){var v=m.pattern.toString().match(/[imsuy]*$/)[0];m.pattern=RegExp(m.pattern.source,v+"g")}for(var k=m.pattern||m,x=o.next,F=u;x!==t.tail&&!(p&&F>=p.reach);F+=x.value.length,x=x.next){var A=x.value;if(t.length>e.length)return;if(!(A instanceof i)){var S,j=1;if(y){if(!(S=s(k,F,e,b)))break;var $=S.index,T=S.index+S[0].length,C=F;for(C+=x.value.length;$>=C;)C+=(x=x.next).value.length;if(F=C-=x.value.length,x.value instanceof i)continue;for(var E=x;E!==t.tail&&(C<T||"string"==typeof E.value);E=E.next)j++,C+=E.value.length;j--,A=e.slice(F,C),S.index-=F}else if(!(S=s(k,0,A,b)))continue;$=S.index;var I=S[0],R=A.slice(0,$),P=A.slice($+I.length),_=F+A.length;p&&_>p.reach&&(p.reach=_);var L=x.prev;R&&(L=l(t,L,R),F+=R.length),c(t,L,j),x=l(t,L,new i(h,f?n.tokenize(I,f):I,w,I)),P&&l(t,x,P),j>1&&r(e,t,a,x.prev,F,{cause:h+","+g,reach:_})}}}}}function o(){var e={value:null,prev:null,next:null},t={value:null,prev:e,next:null};e.next=t,this.head=e,this.tail=t,this.length=0}function l(e,t,a){var n=t.next,i={value:a,prev:t,next:n};return t.next=i,n.prev=i,e.length++,i}function c(e,t,a){for(var n=t.next,i=0;i<a&&n!==e.tail;i++)n=n.next;t.next=n,n.prev=t,e.length-=i}if(e.Prism=n,i.stringify=function e(t,a){if("string"==typeof t)return t;if(Array.isArray(t)){var i="";return t.forEach((function(t){i+=e(t,a)})),i}var s={type:t.type,content:e(t.content,a),tag:"span",classes:["token",t.type],attributes:{},language:a},r=t.alias;r&&(Array.isArray(r)?Array.prototype.push.apply(s.classes,r):s.classes.push(r)),n.hooks.run("wrap",s);var o="";for(var l in s.attributes)o+=" "+l+'="'+(s.attributes[l]||"").replace(/"/g,"&quot;")+'"';return"<"+s.tag+' class="'+s.classes.join(" ")+'"'+o+">"+s.content+"</"+s.tag+">"},!e.document)return e.addEventListener?(n.disableWorkerMessageHandler||e.addEventListener("message",(function(t){var a=JSON.parse(t.data),i=a.language,s=a.code,r=a.immediateClose;e.postMessage(n.highlight(s,n.languages[i],i)),r&&e.close()}),!1),n):n;var u=n.util.currentScript();function p(){n.manual||n.highlightAll()}if(u&&(n.filename=u.src,u.hasAttribute("data-manual")&&(n.manual=!0)),!n.manual){var h=document.readyState;"loading"===h||"interactive"===h&&u&&u.defer?document.addEventListener("DOMContentLoaded",p):window.requestAnimationFrame?window.requestAnimationFrame(p):window.setTimeout(p,16)}return n}("undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{});
/**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   */e.exports&&(e.exports=t),void 0!==I&&(I.Prism=t),t.languages.markup={comment:/<!--[\s\S]*?-->/,prolog:/<\?[\s\S]+?\?>/,doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/,name:/[^\s<>'"]+/}},cdata:/<!\[CDATA\[[\s\S]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},t.languages.markup.tag.inside["attr-value"].inside.entity=t.languages.markup.entity,t.languages.markup.doctype.inside["internal-subset"].inside=t.languages.markup,t.hooks.add("wrap",(function(e){"entity"===e.type&&(e.attributes.title=e.content.replace(/&amp;/,"&"))})),Object.defineProperty(t.languages.markup.tag,"addInlined",{value:function(e,a){var n={};n["language-"+a]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:t.languages[a]},n.cdata=/^<!\[CDATA\[|\]\]>$/i;var i={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:n}};i["language-"+a]={pattern:/[\s\S]+/,inside:t.languages[a]};var s={};s[e]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,(function(){return e})),"i"),lookbehind:!0,greedy:!0,inside:i},t.languages.insertBefore("markup","cdata",s)}}),t.languages.html=t.languages.markup,t.languages.mathml=t.languages.markup,t.languages.svg=t.languages.markup,t.languages.xml=t.languages.extend("markup",{}),t.languages.ssml=t.languages.xml,t.languages.atom=t.languages.xml,t.languages.rss=t.languages.xml,function(e){var t=/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;e.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:/@[\w-](?:[^;{\s]|\s+(?![\s{]))*(?:;|(?=\s*\{))/,inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+t.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+t.source+"$"),alias:"url"}}},selector:RegExp("[^{}\\s](?:[^{};\"'\\s]|\\s+(?![\\s{])|"+t.source+")*(?=\\s*\\{)"),string:{pattern:t,greedy:!0},property:/(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,important:/!important\b/i,function:/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:,]/},e.languages.css.atrule.inside.rest=e.languages.css;var a=e.languages.markup;a&&(a.tag.addInlined("style","css"),e.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/(^|["'\s])style\s*=\s*(?:"[^"]*"|'[^']*')/i,lookbehind:!0,inside:{"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{style:{pattern:/(["'])[\s\S]+(?=["']$)/,lookbehind:!0,alias:"language-css",inside:e.languages.css},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}},"attr-name":/^style/i}}},a.tag))}(t),t.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,boolean:/\b(?:true|false)\b/,function:/\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},t.languages.javascript=t.languages.extend("clike",{"class-name":[t.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:prototype|constructor))/,lookbehind:!0}],keyword:[{pattern:/((?:^|})\s*)(?:catch|finally)\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:/\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),t.languages.javascript["class-name"][0].pattern=/(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/,t.languages.insertBefore("javascript","keyword",{regex:{pattern:/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:t.languages.regex},"regex-flags":/[a-z]+$/,"regex-delimiter":/^\/|\/$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:t.languages.javascript},{pattern:/(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,inside:t.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:t.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:t.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),t.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\${|}$/,alias:"punctuation"},rest:t.languages.javascript}},string:/[\s\S]+/}}}),t.languages.markup&&t.languages.markup.tag.addInlined("script","javascript"),t.languages.js=t.languages.javascript,function(){if("undefined"!=typeof self&&self.Prism&&self.document){Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector);var e=window.Prism,t={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},a="data-src-status",n="loading",i="loaded",s='pre[data-src]:not([data-src-status="loaded"]):not([data-src-status="loading"])',r=/\blang(?:uage)?-([\w-]+)\b/i;e.hooks.add("before-highlightall",(function(e){e.selector+=", "+s})),e.hooks.add("before-sanity-check",(function(r){var o=r.element;if(o.matches(s)){r.code="",o.setAttribute(a,n);var c=o.appendChild(document.createElement("CODE"));c.textContent="Loading…";var u=o.getAttribute("data-src"),p=r.language;if("none"===p){var h=(/\.(\w+)$/.exec(u)||[,"none"])[1];p=t[h]||h}l(c,p),l(o,p);var d=e.plugins.autoloader;d&&d.loadLanguages(p);var g=new XMLHttpRequest;g.open("GET",u,!0),g.onreadystatechange=function(){var t,n;4==g.readyState&&(g.status<400&&g.responseText?(o.setAttribute(a,i),c.textContent=g.responseText,e.highlightElement(c)):(o.setAttribute(a,"failed"),g.status>=400?c.textContent=(t=g.status,n=g.statusText,"✖ Error "+t+" while fetching file: "+n):c.textContent="✖ Error: File does not exist or is empty"))},g.send(null)}})),e.plugins.fileHighlight={highlight:function(t){for(var a,n=(t||document).querySelectorAll(s),i=0;a=n[i++];)e.highlightElement(a)}};var o=!1;e.fileHighlight=function(){o||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),o=!0),e.plugins.fileHighlight.highlight.apply(this,arguments)}}function l(e,t){var a=e.className;a=a.replace(r," ")+" language-"+t,e.className=a.replace(/\s+/g," ").trim()}}()}));!function(e){var t=e.util.clone(e.languages.javascript);e.languages.jsx=e.languages.extend("markup",t),e.languages.jsx.tag.pattern=/<\/?(?:[\w.:-]+(?:\s+(?:[\w.:$-]+(?:=(?:"(?:\\[^]|[^\\"])*"|'(?:\\[^]|[^\\'])*'|[^\s{'">=]+|\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])+\}))?|\{\s*\.{3}\s*[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*\s*\}))*\s*\/?)?>/i,e.languages.jsx.tag.inside.tag.pattern=/^<\/?[^\s>\/]*/i,e.languages.jsx.tag.inside["attr-value"].pattern=/=(?!\{)(?:"(?:\\[^]|[^\\"])*"|'(?:\\[^]|[^\\'])*'|[^\s'">]+)/i,e.languages.jsx.tag.inside.tag.inside["class-name"]=/^[A-Z]\w*(?:\.[A-Z]\w*)*$/,e.languages.insertBefore("inside","attr-name",{spread:{pattern:/\{\s*\.{3}\s*[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*\s*\}/,inside:{punctuation:/\.{3}|[{}.]/,"attr-value":/\w+/}}},e.languages.jsx.tag),e.languages.insertBefore("inside","attr-value",{script:{pattern:/=(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])+\})/i,inside:{"script-punctuation":{pattern:/^=(?={)/,alias:"punctuation"},rest:e.languages.jsx},alias:"language-javascript"}},e.languages.jsx.tag);var a=function(e){return e?"string"==typeof e?e:"string"==typeof e.content?e.content:e.content.map(a).join(""):""},n=function(t){for(var i=[],s=0;s<t.length;s++){var r=t[s],o=!1;if("string"!=typeof r&&("tag"===r.type&&r.content[0]&&"tag"===r.content[0].type?"</"===r.content[0].content[0].content?i.length>0&&i[i.length-1].tagName===a(r.content[0].content[1])&&i.pop():"/>"===r.content[r.content.length-1].content||i.push({tagName:a(r.content[0].content[1]),openedBraces:0}):i.length>0&&"punctuation"===r.type&&"{"===r.content?i[i.length-1].openedBraces++:i.length>0&&i[i.length-1].openedBraces>0&&"punctuation"===r.type&&"}"===r.content?i[i.length-1].openedBraces--:o=!0),(o||"string"==typeof r)&&i.length>0&&0===i[i.length-1].openedBraces){var l=a(r);s<t.length-1&&("string"==typeof t[s+1]||"plain-text"===t[s+1].type)&&(l+=a(t[s+1]),t.splice(s+1,1)),s>0&&("string"==typeof t[s-1]||"plain-text"===t[s-1].type)&&(l=a(t[s-1])+l,t.splice(s-1,1),s--),t[s]=new e.Token("plain-text",l,null,l)}r.content&&"string"!=typeof r.content&&n(r.content)}};e.hooks.add("after-tokenize",(function(e){"jsx"!==e.language&&"tsx"!==e.language||n(e.tokens)}))}(Prism);function N(e){let t,a,d=e[0].subtitle+"";return{c(){t=n("blockquote"),a=i(d),this.h()},l(e){t=s(e,"BLOCKQUOTE",{class:!0});var n=r(t);a=o(n,d),n.forEach(l),this.h()},h(){c(t,"class","svelte-rwn9i3")},m(e,n){u(e,t,n),p(t,a)},p(e,t){1&t&&d!==(d=e[0].subtitle+"")&&h(a,d)},d(e){e&&l(t)}}}function B(e){let t,a,i;return{c(){t=n("img"),this.h()},l(e){t=s(e,"IMG",{alt:!0,src:!0,class:!0}),this.h()},h(){c(t,"alt",a=`${e[0].title} picture`),t.src!==(i=e[0].picture)&&c(t,"src",i),c(t,"class","svelte-rwn9i3")},m(e,a){u(e,t,a)},p(e,n){1&n&&a!==(a=`${e[0].title} picture`)&&c(t,"alt",a),1&n&&t.src!==(i=e[0].picture)&&c(t,"src",i)},d(e){e&&l(t)}}}function O(e){let t,a,i;return{c(){t=n("iframe"),this.h()},l(e){t=s(e,"IFRAME",{class:!0,title:!0,src:!0,allowFullScreen:!0}),r(t).forEach(l),this.h()},h(){c(t,"class","youtubeIframe svelte-rwn9i3"),c(t,"title",a=`${e[0].title} YouTube video`),t.src!==(i=e[0].youtube)&&c(t,"src",i),t.allowFullscreen=!0},m(e,a){u(e,t,a)},p(e,n){1&n&&a!==(a=`${e[0].title} YouTube video`)&&c(t,"title",a),1&n&&t.src!==(i=e[0].youtube)&&c(t,"src",i)},d(e){e&&l(t)}}}function D(e){let t,a,i,o;return a=new C({props:{class:"github-link"}}),{c(){t=n("a"),d(a.$$.fragment),this.h()},l(e){t=s(e,"A",{href:!0,target:!0,class:!0});var n=r(t);g(a.$$.fragment,n),n.forEach(l),this.h()},h(){c(t,"href",i=e[0].github),c(t,"target","_blank"),c(t,"class","svelte-rwn9i3")},m(e,n){u(e,t,n),m(a,t,null),o=!0},p(e,a){(!o||1&a&&i!==(i=e[0].github))&&c(t,"href",i)},i(e){o||(f(a.$$.fragment,e),o=!0)},o(e){b(a.$$.fragment,e),o=!1},d(e){e&&l(t),y(a)}}}function H(e){let t,a,d,g,m,y,F,A,S,j,$,T=e[0].title+"",C=e[0].subtitle&&N(e),E=e[0].picture&&B(e),I=e[0].youtube&&O(e),R=e[0].github&&D(e);return{c(){t=n("div"),a=n("a"),d=n("h3"),g=i(T),m=w(),C&&C.c(),y=w(),E&&E.c(),F=w(),I&&I.c(),A=w(),S=n("div"),j=w(),R&&R.c(),this.h()},l(e){t=s(e,"DIV",{class:!0});var n=r(t);a=s(n,"A",{href:!0,class:!0});var i=r(a);d=s(i,"H3",{id:!0,class:!0});var c=r(d);g=o(c,T),c.forEach(l),i.forEach(l),m=v(n),C&&C.l(n),y=v(n),E&&E.l(n),F=v(n),I&&I.l(n),A=v(n),S=s(n,"DIV",{class:!0}),r(S).forEach(l),j=v(n),R&&R.l(n),n.forEach(l),this.h()},h(){c(d,"id",e[2]),c(d,"class","svelte-rwn9i3"),c(a,"href",`#${e[2]}`),c(a,"class","svelte-rwn9i3"),c(S,"class","marked-description svelte-rwn9i3"),c(t,"class","project svelte-rwn9i3")},m(n,i){u(n,t,i),p(t,a),p(a,d),p(d,g),p(t,m),C&&C.m(t,null),p(t,y),E&&E.m(t,null),p(t,F),I&&I.m(t,null),p(t,A),p(t,S),S.innerHTML=e[1],p(t,j),R&&R.m(t,null),$=!0},p(e,[a]){(!$||1&a)&&T!==(T=e[0].title+"")&&h(g,T),e[0].subtitle?C?C.p(e,a):(C=N(e),C.c(),C.m(t,y)):C&&(C.d(1),C=null),e[0].picture?E?E.p(e,a):(E=B(e),E.c(),E.m(t,F)):E&&(E.d(1),E=null),e[0].youtube?I?I.p(e,a):(I=O(e),I.c(),I.m(t,A)):I&&(I.d(1),I=null),e[0].github?R?(R.p(e,a),1&a&&f(R,1)):(R=D(e),R.c(),f(R,1),R.m(t,null)):R&&(k(),b(R,1,1,(()=>{R=null})),x())},i(e){$||(f(R),$=!0)},o(e){b(R),$=!1},d(e){e&&l(t),C&&C.d(),E&&E.d(),I&&I.d(),R&&R.d()}}}function W(e,t,a){let{project:n}=t;const i=R(n.text,{highlight:(e,t)=>t in M.languages?M.highlight(e,M.languages[t],t):e}),s=n.title.toLowerCase().replace(/\s+/g,"-");return e.$$set=e=>{"project"in e&&a(0,n=e.project)},[n,i,s]}class G extends e{constructor(e){super(),t(this,e,W,H,a,{project:0})}}function q(e,t,a){const n=e.slice();return n[0]=t[a],n}function Z(e){let t,a;return t=new G({props:{project:e[0]}}),{c(){d(t.$$.fragment)},l(e){g(t.$$.fragment,e)},m(e,n){m(t,e,n),a=!0},p:F,i(e){a||(f(t.$$.fragment,e),a=!0)},o(e){b(t.$$.fragment,e),a=!1},d(e){y(t,e)}}}function J(e){let t,a,h,d,g,m,y,F,C,E,I,R,L,M;document.title=t="KUBE - "+U;let N=z,B=[];for(let n=0;n<N.length;n+=1)B[n]=Z(q(e,N,n));const O=e=>b(B[e],1,1,(()=>{B[e]=null}));return{c(){a=w(),h=n("main"),d=n("h1"),g=i(U),m=i("."),F=w(),C=n("h2"),E=i("Some Code Stuff."),I=w();for(let e=0;e<B.length;e+=1)B[e].c();this.h()},l(e){A('[data-svelte="svelte-xm3y2e"]',document.head).forEach(l),a=v(e),h=s(e,"MAIN",{class:!0});var t=r(h);d=s(t,"H1",{class:!0});var n=r(d);g=o(n,U),m=o(n,"."),n.forEach(l),F=v(t),C=s(t,"H2",{class:!0});var i=r(C);E=o(i,"Some Code Stuff."),i.forEach(l),I=v(t);for(let a=0;a<B.length;a+=1)B[a].l(t);t.forEach(l),this.h()},h(){c(d,"class","svelte-sfc25k"),c(C,"class","svelte-sfc25k"),c(h,"class","svelte-sfc25k")},m(e,t){u(e,a,t),u(e,h,t),p(h,d),p(d,g),p(d,m),p(h,F),p(h,C),p(C,E),p(h,I);for(let a=0;a<B.length;a+=1)B[a].m(h,null);M=!0},p(e,[a]){if((!M||0&a)&&t!==(t="KUBE - "+U)&&(document.title=t),0&a){let t;for(N=z,t=0;t<N.length;t+=1){const n=q(e,N,t);B[t]?(B[t].p(n,a),f(B[t],1)):(B[t]=Z(n),B[t].c(),f(B[t],1),B[t].m(h,null))}for(k(),t=N.length;t<B.length;t+=1)O(t);x()}},i(e){if(!M){y||$((()=>{y=T(d,_,{y:100,duration:290}),y.start()}));for(let e=0;e<N.length;e+=1)f(B[e]);$((()=>{L&&L.end(1),R||(R=T(h,P,{duration:320})),R.start()})),M=!0}},o(e){B=B.filter(Boolean);for(let t=0;t<B.length;t+=1)b(B[t]);R&&R.invalidate(),L=S(h,P,{duration:160}),M=!1},d(e){e&&l(a),e&&l(h),j(B,e),e&&L&&L.end()}}}const U="Projects";export default class extends e{constructor(e){super(),t(this,e,null,J,a,{})}}
