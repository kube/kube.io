---
title: React Electron
description: Simple React driver for BrowserWindow in Electron
github: https://github.com/kube/react-electron
index: 11
---

Just a proof-of-concept, but already in production usage in PandaNote.

**React Electron** provides a simple driver for BrowserWindow declaration in Electron, using React.

```jsx
render(
  <App>
    {state.notes.map(note => (
      <BrowserWindow
        key={note.id}
        url={NOTE_RENDERER_PATH}
        height={640}
        width={480}
        onClose={() =>
          store.dispatch(
            closeNoteRequest(note.id)
          )
        }
      />
    ))}
  </App>
);
```

No more manual management of window properties, all is reactive.
Needs to be re-written with a cleaner API though.
