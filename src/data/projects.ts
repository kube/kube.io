
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

/**
 * Remove left padding on multiline-text
 */
export const paddedText = ([text]: TemplateStringsArray) =>
	text
		.replace(/^\n/, '')
		.replace(/\n\s+$/, '')
		.replace(/^\s+\|/gm, '');

export type Project = {
	title: string;
	subtitle?: string;
	text: string;
	picture?: string;
	youtube?: string;
	github?: string;
	npm?: string;
};

export const PROJECTS: Project[] = [
	{
		title: 'Monolite',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/monolite',
		npm: 'https://npmjs.org/package/monolite'
	},
	{
		title: 'ReturnOf',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/returnof'
	},
	{
		title: 'WhenSwitch',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/when-switch'
	},
	{
		title: 'Kay Theme',
		picture: 'https://github.com/kube/vscode-kay-theme/raw/master/images/theme-dark.png',
		text: paddedText`
          |**Kay** is my personal code editor theme.
          |
          |It was designed to be colored,
          |with an **80's-inspired color palette**, without losing **focus on code**.
          |
          |Comments and all non-code text are nearly invisible. It also includes a Light Theme.
          `,
		github: 'https://github.com/kube/vscode-kay-theme'
	},
	{
		title: 'Redux Electron Global Dispatch',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/redux-electron-global-dispatch'
	},
	{
		title: 'React Electron',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/react-electron'
	},
	{
		title: '42 GraphQL',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/42graphql'
	},
	{
		title: '42 Scalizer',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/scalizer'
	},
	{
		title: 'VSCode ClangComplete',
		text: paddedText`
          |When VSCode opened third-party extensions I took a look at their Language Server
          |implementation.
          |
          |**C/C++ Completion** was not offered at this time, so I dediced to
          |port the simple [**Clang Complete**](https://github.com/Rip-Rip/clang_complete),
          |respecting the VSCode Language Server architecture.
          `,
		github: 'https://github.com/kube/vscode-clang-complete'
	},
	{
		title: 'VSCode 42 Header',
		text: paddedText`
          |A **VSCode extension** for 42 Students.
          |
          |42 projects need to include a 42 header in all source files.
          |This extension provides this header, with automatic refresh on save.
          `,
		github: 'https://github.com/kube/vscode-42header'
	},
	{
		title: 'CUT',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/cut'
	},
	{
		title: 'Kuji',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/kuji',
		npm: 'https://www.npmjs.com/package/kuji'
	},
	{
		title: 'Zappy',
		text: paddedText`
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
          `,
		youtube: 'https://youtube.com/embed/F2R2BoDBg5Y',
		github: 'https://github.com/kubekhrm/zappy'
	},
	{
		title: 'RayTracer',
		youtube: 'https://www.youtube.com/embed/1JoTZg4Ulo0',
		text: paddedText`
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
          `,
		github: 'https://github.com/kubekhrm/RT'
	},
	{
		title: 'FdF',
		text: paddedText`
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
          |[MiniLibX](https://github.com/abouvier/minilibx).`,
		youtube: 'https://youtube.com/embed/X3pcTRCgQF4'
	},
	{
		title: 'LibFt',
		text: paddedText`
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
          `,
		github: 'https://github.com/kube/libft'
	},
	{
		title: 'Sudoku',
		text: paddedText`
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
          `,
		picture:
			'https://cloud.githubusercontent.com/assets/2991143/25461505/b3c40da0-2ae9-11e7-8e2b-7a02515d4991.gif',
		github: 'https://github.com/kube/luminy-sudoku'
	}
];
