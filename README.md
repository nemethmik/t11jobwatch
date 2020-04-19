# T11 Job Watch - a Watch-Friendly Mobile Manufacturing Job Tracking Application for SAP B1

Hm, after my initial enthusiasm towards JQM, I found a number of quirks that make JQM as laborious to use as TAU.
- Huge gaps are inserted between input fields, and I don't know how to remove them. It seems as if the space for a label is preserved even when I don't need the label
- Labels are placed above fields.
- When I tried my own CSS classes they were not applied consistently.

The only thing I really like with JQM is the single-page approach with navigations between sections/pages.

 ![Screen Navigation Sketch](./t11jobwatchsketch.png)

 ## How I initialized the project
- npm init
- npm install typescript tsify watchify --save-dev
- npx tsc --init
- Use **Tizen Studio** to create **basic template** app in **JobWatch** folder using the t11jobwatch folder as workspace 
- The project is implemented with [jQuery Mobile 2014 1.4.5](https://jquerymobile.com)
  - [jQuery Mobile + Phonegap Build - How to make a slick app for FREE, 2018](https://youtu.be/bNw7lqNO6tA) is a quick, practical and excellent intro JQM
  - I simply downloaded [JQM 1.4.5](http://jquerymobile.com/resources/download/jquery.mobile-1.4.5.zip) simply clicking on the button [Latest Stable](http://jquerymobile.com/resources/download/jquery.mobile-1.4.5.zip) on JQM home.
    - The zip package containeg jquery.mobile JS and CSS files. It had a demo folder with a number of examples and images, and most importantly the regular jquery JS package in **demos/js/jquery.js**
    - I simply copied the entire contents into the **JobWatch/jquery** folder. I see no reason to break this original structure. I fully respect the decision of the creators of this brilliant library.
