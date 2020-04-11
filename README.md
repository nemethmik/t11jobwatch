# A Simple Example Web Application to Experiment with Browserify, Watchify and TSify for TypeScript Projects

## Motivation
The entire project was inspired by Yogesh Jadhav's [CarbonRider's 09 Typescript JQuery and Browserify](https://youtu.be/R87Gesz9ALc)
Actually this is a brilliantly clean still powerful Node JS project which was created with **npm init** to create a **package.json** and **tsc --init** for a **tsconfig.json** file.
The accompanying video is [Using TypeScript Debugging Source Maps with Browserify, TSify and Watchify](https://youtu.be/pvw4qx97njU)

## After Cloning from Github
- **npm install** to download node_module packages (only dev packages are used here)
- **npm update** get the latest versions of these tools
- **npm start** compile and build the solution with the original build script into the **dist** folder
- **npm run bundlets** or **npm run watchifyts**
- **npx http-server dist --coors -o -c-1** start the server on the dist folder

## Sources
- [CarbonRider's 09 Typescript JQuery and Browserify](https://youtu.be/R87Gesz9ALc)
- [Using TypeScript Debugging Source Maps with Browserify, TSify and Watchify](https://youtu.be/pvw4qx97njU)
- [browserify.org/](http://browserify.org/)
- [An Intro To Using npm and ES6 Modules for Front End Development](https://wesbos.com/javascript-modules/)
- [watchify](https://www.npmjs.com/package/watchify)
- [tsify](https://www.npmjs.com/package/tsify)
- [Keep original typescript source maps after using browserify](https://stackoverflow.com/a/24346425)

## Tools
- [http-server](https://www.npmjs.com/package/http-server) is a brilliant server, and can be run on demand **npx http-server dist --coors -o -c-1** which serves the dist folder contents on port 8080 with cors enabled, opens Chrome browser and disables cashing.
- [reqres.in](https://reqres.in/) is an easy to use free REST server for developers
- **async/await** with **fetch** instead of XMLHttpRequest.
- **In-Line Source Maps** to enable typescript debugging directly in Chrome Dev Tools. BRILLIANT!
