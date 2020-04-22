# T11 Job Watch - a Watch-Friendly Mobile Manufacturing Job Tracking Application for SAP B1

I put this direction on hold since I found a couple of major issues with TAU, which I reported on the TAU github repo. [TAU 1.1.8 (Tizen Studio 3.7) Toggle looks weird on regular page without a UL-tag list view](https://github.com/Samsung/TAU/issues/972#issue-602494014) and [TAU 1.1.8 (Tizen Studio 3.7) doesn't support number input fields](https://github.com/Samsung/TAU/issues/971#issue-602493349)
I made videos to explin and demo the issues. These issues are not unsurmontable, but definitely raises the alarm that TAU is absolutely not used by anyone, I guess, other than its own developers paid by Samsung. The documentation is pretty unusable and outdated, the examples are only for really a very simple situation, and when you want to use a componehnt other than from the demo, it crashes. I have the [Potemkin Village](https://en.wikipedia.org/wiki/Potemkin_village) feeling, honestly, now that I started using TAU.

I tried **inputmode="numeric"**, and Galaxy Watch browser pays no attention to this standard HTML5 attribute.
I tried the force TAU to vertically align the label with the checkbox, but it didn't work.

 ![Screen Navigation Sketch](t11jobwatchsketch.png)

 ## How I initialized the project
- npm init
- npm install typescript tsify watchify --save-dev
- npx tsc --init
- Tizen Studio to create TAU UI sample app in JobWatch folder using the t11jobwatch folder as workspace

