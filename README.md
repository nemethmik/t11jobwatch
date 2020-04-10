# Simple real-time job reporting watch application (React/Tizen)

## Original Version with deploy.cmd Branch
In the original version I adapted the concepts from rovale, and the build process was totalli CLI with a deploy.cmd. This version was not at all compatible with Tizen Studio, the compatibility with which is terribly important for debuggability especially on real watch. Now I have a Galaxy Watch and I want Tizen Studio compatibility.
So, I backup this original version into this branch, and I restart the project in the main branch. 

## Motivation
This is an experimental project to use React and TypeScript to develop Tizen Web watch applications.
What is great with TAU style shhets that it works quite reasonably on mobile devices, too, so with some careful approach the same application can work fine on both Galaxy Watch and any mobile phone.
The simple pure JS jquery with the TAU CSS could be absolutely a viable alternative, but for moderately more complex mobile applications, a warehousingh solution, for example, React/TypeScript is beneficial.

## Getting Started
I created two projects the first with Tizen Studio, the second with [Create React App](https://github.com/facebook/create-react-app) TypeScript. Then I combined the two together.
I learned a number of tricks from [rovale/react-tizen-watch](https://github.com/rovale/react-tizen-watch), his work was pioneering, but I made a number of things differently.
- Ronald used only the TAU CSS files, I kept the entire TAU library
- Ronald used Redux and plain JS, I use hooks and TypeScript
- Ronald basically kept the React index.html, I kept the Tizen Studio index.html

Since I installed yarn, both npm and yarn can be used on my suystem.

Here are the key points:
- New projects can be created with **Tizen Web VSC extension**. Tizen Studio is not working any more, since we have node_modules and when Tizen Studio is started, it tries to compile all folders in the workspace.
- Quick testing as if it were a mobile application, simply run **npm start**  
- Deploy and test on emulator
  - Start emulator with
    - **em-cli list-vm**
    - **em-cli launc -n vmname**
  - Run my **deploy.cmd** in terminal window. I became a kind of Tizen CLI expert.
  - Unfortunately, I found no way to start Chrome to debug the application running on the emulator.
- Debug application with Tizen Web Simulator (Google Chrome)
  - npm run build
  - serve -s build
  - Tizen Web: Run Web Simulator
  - http://localhost:5000 in Web Simulator and Ctrl + Shift I to open Dev Tools for debugging
  - Unfortunately the Web Simulator tends to break, then simply use Google Chrome to debug.

