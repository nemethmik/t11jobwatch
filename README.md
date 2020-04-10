# A Simple Example Web Application Written in TypeScript

## Motivation
The entire project was inspired by Yogesh Jadhaw's [08 Simple Web page and REST API with Typescript](https://youtu.be/Sg91tO8iMnU)
Actually this is a dead simple still powerful Node JS project which was created with **npm init** to create a **package.json** and **tsc --init** for a **tsconfig.json** file.
The accompanying video is [Building and Debugging a Simple Web Application with TypeScript to Get Ready for Tizen Web App Dev](https://youtu.be/McJu1AOaGh8)

## After Cloning from Github
- **npm install** to download node_module packages (only dev packages are used here)
- **npm update** get the latest versions of these tools
- **npm start** compile and build the solution into the **dist** folder
- **npx http-server dist --coors -o -c-1** start the server on the dist folder

## Tools
- [http-server](https://www.npmjs.com/package/http-server) is a brilliant server, and can be run on demand **npx http-server dist --coors -o -c-1** which serves the dist folder contents on port 8080 with cors enabled, opens Chrome browser and disables cashing.
- [reqres.in](https://reqres.in/) is an easy to use free REST server for developers
- **async/await** with **fetch** instead of XMLHttpRequest.
- **In-Line Source Maps** to enable typescript debugging directly in Chrome Dev Tools. BRILLIANT!

