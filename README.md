# Tizen Studio Money Book Sample TSified with Multi-Project Build Support
Here a new improved concept is that the workspace folder may have multiple Tizen Studio projects, so the src folder is separated for each projects.
At the moment only MoneyBook is the only project we have in this workspace.
The caveat is that tsconfig doesn't allow to set outDir to ./ and rootDir to ./srcs, but it is possible on the command line 
**tsc --rootDir ./src/ --outDir ./** which brilliantly compiles all TS files in the src files and the resulting JS files are automatically directed to the approproate Tisen Studio projects. That's why it is important to make a subfolder under src for each project. However, watchify outputs only one bundle js, so watchify need separate npm scripts for each projects, like so **watchify src/MoneyBook/js/test.ts -v -p [tsify --rootDir ./src/MoneyBook --outDir ./MoneyBook] --debug -o MoneyBook/js/bundle.js"**.
 
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