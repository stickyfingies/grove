# The Grove

Welcome to The Grove, a browser-based ~~MMO~~RPG.

***(ALPHA - under development!)***

---

## Host Technologies

- node.js   (*server*)
- express   (*server*)
- mongoose  (*server*)
- electron  (*app*)

## Client Technologies

- TypeScript
- THREE.js
- cannon.js

## Building and Running

These instructions assume you will be using Yarn as your package manager.  If you elect to use NPM instead, the instructions will be similar; consult the NPM docs if necessary.  You can install all dependencies by running `yarn` in the root directory.

The game source code is bundled using Webpack, cand can be built by opening a terminal in the project's root directory and running `yarn build` or `npm build`.

There are two ways of hosting the game: in the web browser (through a web server), or as a native application (through electron).

**Running the App:**

Electron requires no setup, and can be ran by executing `yarn app` in the project's root directory.

**Running the Server:**

Starting the web server requires a MongoDB database connection to connect with user accounts.  Create a file named `.env` in the project's root directory.  It should follow this structure:

```ini
DB_USER=joemama
DB_PASS=supersecure123
DB_HOST=my.mongo.url/grove
```

Once all the environment values have been set, the server can be started by running `yarn server`.  Check the console for database connection status; a success message will appear when the connection is established.

## License

- The Grove is copyright 2021 by Hybrid Alpaca Game Studios. All images, story, and game are copyright of Hybrid Alapca Game Studios.
Copying or redistributing this game or content without the consent of Hybrid Alpaca Game Studios is illegal and unlawful.

 -  Most images are not owned by Hybrid Alpaca Game Studios.
 
## Contributors

- Seth Traman:              Lead Developer, CEO Hybrid Alapca Game Studios
- Nate Goldsborough:        Developer, Marketing, General Maintenance, CEO Artifex Inc.
- Casimir Kash:             Developer, Graphics, Beta Testing
- Hunter Sokolis:           Developer, Graphics, Humor Support
- Gavin Montheye:           PR
- KJ Avakian:               Developer
- Jasper Burns:             Storyline
- William VanDerLaan:       Beta Testing, Logos
