# A remake of the Tizen News Feed sample application with TypeScript and optionally watchify/tsify

## When cloned how to start the project?

## Initialization Steps
- npm init
    - package name: (t11jobwatch) 10newsfeedts
    - version: (1.0.0) 
    - description: A remake of the Tizen News Feed sample application with TypeScript and optionally watchify/tsify
    - entry point: (index.js) 
    - test command: test
    - git repository: (https://github.com/nemethmik/t11jobwatch.git) 
    - keywords: TypeScript Tizen 
    - author: Miklos Nemeth
    - license: (ISC) MIT
- npm install typescript copyfiles tsify watchify --save-dev
    - Since created this project on Mac, where it's terribly difficult to install tsc globally. Anyhow eventually **tsify** is going to be used for the project which doesn't require tsc only typescript.
    - **npx tsc -v** to test typescript version 
- **npx tsc --init** to create tsconfig.json
- Open Tizen Studio, 
    - Select t11jobwatch as the workspace folder
    - Create project **newsfeedts** in the t11jobwatch folder
        - This folder is going to be the **outDir** for tsc/tsify
    - The gigantic node_modules folder in the workspace wasn't a problem for Tizen Studio, since it was outside of the project. 
- After this step I made a commit since everything worked fine on my watch.
