---
title: Zappy
description: A game composed by three programs a server, an AI, and a graphic visualizer
youtube: https://youtube.com/embed/F2R2BoDBg5Y
github: https://github.com/kubekhrm/zappy
index: 4
---

**Zappy** is a game composed by three programs:

- A **Server**, written in C, emulating a map containing different resources.

- An **AI**, written in CoffeeScript/NodeJS, connecting to the server, and trying to evolve by taking resources which permits it to level up.

  Elevation is only permitted after a group incantation. AI need to group themselves on the same cell before being able to do the incantation.

  The tricky part is that AI are not able to know locations nor level of other AI on the map.

  All they are able to do is to broadcast a sound saying that they are waiting for other AI for elevation incantation, which permits to know in which direction AI has to go to find others.

  Each new AI is a fork of its parent.

- A **Graphic Visualizer**, written in NodeWebkit/ThreeJS, which shows in real-time what happens on the map.

All inter-process communication was achieved through TCP.
