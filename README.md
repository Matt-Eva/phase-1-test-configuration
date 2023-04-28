# Configuring Phase 1 Tests

This is an overview of how to set up tests for phase 1 labs and practice challenges using `jest`and `jest-environment-jsdom`.

## Installation

Note: You do not need to install `json-server` unless the lab or practice challenge requires students to make fetch requests. `json-server` will not be used for testing - it will just be used by students when they run their code.

To install Jest and other necessary tools:

`npm install --save-dev jest jest-environment-jsdom @babel/plugin-transform-modules-commonjs`

To install json-server:

`npm install --save-dev json-server`.

## Configuring Jest

Jest can be configured to use either `jsdom` or `node`. 

For labs and challenges that require interacting with the DOM, use `jsdom`. Otherwise `node` is fine.

To configure Jest, run `npx jest --init`. You will be given a list of options:

 - Would you like to use Jest when running "test" script in "package.json"?: `YES`
 - Would you like to use Typescript for the configuration file?: `NO`
 - Choose the environment that will be use for testing
    - Choose either `node` or `jsdom`
 - Do you want Jest to add coverage reports?
    - (Not sure what to pick for this one yet - just defaulting to `NO`)
 - Which provider should be used to instrument code for coverage?
    - I've been setting it up to use `babel`. Haven't tested it with `v8` yet.
 - Automatically clear mock calls, instances, contexts and results before every test?
    - I've been setting this to `YES`. Haven't experimented with `NO` yet.

After giving answers to all these options, you should see a new `jest.config.js` file created.

If you examine this file, you can see what the `testEnvironment` is set to. If you chose to use `jsdom` for example, you should see `testEnvironment: "jsdom"`.

## Configuring Modules

Jest doesn't work with ECMA modules - `import x from "y"` - and `module.exports` doesn't work with the browser. (Fun!)

In order to use ECMA modules with Jest, we need to do some additional confugiration.

First, we need to create a .babelrc file: `touch .babelrc`

Next, we need to add the following to that file:

```
{
    "env": {
      "test": {
        "plugins": ["@babel/plugin-transform-modules-commonjs"]
      }
    }
}
```

And we should be good to go!

## Testing Basic JavaScript

For just testing JavaScript, we can set the Jest testing environment to `node` when we're first configuring Jest.

Note: We can still test plain JavaScript if we set the testing environment to `jsdom`.

From there, we can just export the code we want to test from our JS file:

```
const myVar = "Hello, world!"

export { myVar }
```

And import it into our test file:

```
import { myVar } from "./my-js.js"

describe("It can test plain JS", () =>{
   test("Testing a variable",() =>{
      expect(myVar).toBe("Hello, world!")
   })
})
```

Note: From the looks of it, the `it` function is just an alias for the `test` function. We'll need to decide which one we want to use in our test files so we can be consistent.

## Testing the DOM

### Testing HTML Files

Let's say we want to write some tests where students are writing HTML in an HTML file.

First, we're going to need to import the `fs` module and the `path` module

```
import fs from "fs"
import path from "path"
```

Then, we'll need to use these two modules to give us access to the html in our HTML file as a string:

```
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8')
```

From here, we need to give the virtual DOM created by JSDOM that jest is using the content of this html:

```
document.documentElement.innerHTML = html
```

Now we can test HTML:

```
describe('query DOM', () =>{
    it('has a button', () =>{
        const button = document.querySelector('button')
        expect(button).not.toBe(null)
    })
)
```

### Testing CSS

If we want to test css that is linked to our HTML file, JSDOM will not load it even if it's add to the `<head>` of our HTML file.

Instead, we have to load the css separately:

```
const css = fs.readFileSync(path.resolve(__dirname, './styles.css'), 'utf-8')
```

Then we need to update our virtual DOM:

```
const style = document.createElement('style')
style.innerHTML = css
document.head.append(style)
```

We can get the styles of a specific dom element by using the `window.getComputedStyle` method:

```
const button = document.getElementById("click-me")
const styles = window.getComputedStyle(button)
```

This will give us all the styles for that element. Individual styles can be accessed using `.` notation: `styles.color`

And now we can test CSS:

```
it('can query CSS', () =>{
   const button = document.getElementById("click-me")
   const styles = window.getComputedStyle(button)
   expect(styles.color).toBe('blue')
   })
```

**Note**: If we want to test whether a student has added a css link to their html file, we can query select for the following: `document.head.querySelector("link[rel='stylesheet'][href='./styles.css']")`.

### Testing DOM Manipulation



