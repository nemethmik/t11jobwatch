# T11 Job Watch React Application Development Experiment for Tizen Studio

This is another failed and dead-end experiemnt. Tizen Studio simply is reluctant to work with the articats of the build process of CRA, unfortunately.
I'll keep this branch for memento.

## The initial steps to make a working CRA + Tizen Studio colocation

- The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
- Then a Tizen News Feed sample project was created in the build subfolder.
- The Tizen Studio created files config.xml, index.html, icon.png, and the other technical files (.project, .tproject, LICENSE.APLv2, NOTICE, version.txt) are moved from the build folder to the public folder.
- The Tizen Studio created css/style.css and js/app.js are moved to the src React folder.
  - Simply moving app app.js wasn't enough.
- index.tsx is changed to use the container element from the index.html as React DOM root.
- The main content from index.html was moved into App.tsx
- App.css, index.css, logo.svg were deleted.


## Available Scripts
- `yarn start`
- `yarn test`
- `yarn build`
