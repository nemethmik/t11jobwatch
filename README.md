# Tizen Studio Money Book Sample TSified with Multi-Project Build Support
Here a new improved concept is that the workspace folder may have multiple Tizen Studio applications, so the src folder is separated for each projects.
Here are the applications we have in this repository/workspace:
    - MoneyBook - is plain HTML/CSS app with Indexed DB. The project was completely TSified
    - TAUMobile and TAUWatch are the original TAU sample applications just to keep them at hand.
    - taubasicw - an experimental app with multi-button screen, in-document page navigation and rotary bezel integration 

A caveat was that tsconfig doesn't allow to set outDir to ./ and rootDir to ./src, but it is possible on the command line 
**tsc --rootDir ./src/ --outDir ./** which brilliantly compiles all TS files in the src files and the resulting JS files are automatically directed to the approproate Tizen Studio projects. That's why it is important to make a subfolder under src for each project. _However, watchify outputs only one bundle js_, so watchify need separate npm scripts for each projects, like so **watchify src/MoneyBook/js/test.ts -v -p [tsify --rootDir ./src/MoneyBook --outDir ./MoneyBook] --debug -o MoneyBook/js/bundle.js"**.

I gave a try to use the typescript compiler to compile the projet into a single file, but it supports only amd and system module types for single-file-output optoion, but these are not supported by broswers, only commonjs; so, watchify is the way to go: tsc --module amd --rootDir ./src/MoneyBook --outFile ./MoneyBook/js/bundlets.js

## TAUMobile and TAUWatch Projects
Both of these are the regular TAU UI demo projects created with Tizen Studio. TAU version 1.1.8 included. I keep these projects here as references. They are built directly with Tizen Studio.

## What to do after cloning?
- **npm install** and then **npm update**
- **npm run buildmoneybook** starts watchify and builds the Money Book project
- Thereafter start **Tizen Studio** with t11jobwatch as workspace then import the MoneyBook folder as project, the you can deploy, run, debug the web app on emulator, Galaxy Watch, in Tizen Web Studio or in any regular browsers.

## Installation Steps
- **npm init**
- **npm install typescript watchify tsify --save-dev**
    - No need for copyfiles and browserify
    - http-server can be started on-demand with npx, no need to install
- **npx tsc --init**
- npm install @types/websql --save-dev
    - The app is prepared to work with WebSQL, too.