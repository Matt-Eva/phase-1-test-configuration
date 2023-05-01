# Configuring Phase 1 Tests

This is an overview of how to set up tests for phase 1 labs and practice challenges using `jest`and `jest-environment-jsdom`.

**Note:** This approach works, but it may not be the optimal or best-practices way to handle DOM testing using Jest. It may be better to use Testing-Library in addition to Jest. But, this approach will at least allow us to build out tests for the types of labs and challenges we'll see in phase one pretty quickly and easily.

## Installation

**Note:** You do not need to install `json-server` unless the lab or practice challenge requires students to make fetch requests. `json-server` will not be used for testing - it will just be used by students when they run their code.

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
   it("tests a variable",() =>{
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

In order to test whether a student is manipulating the DOM correctly,
we'll need to have them write DOM manipulation inside of functions. This is the current approach that our tests already take.

These functions will also need to be exported from the file in which they are declared.

From there, we simply need to call the function within our test file, then test to see if the DOM has been updated:

index.js:
```
function addHeader(){
  const h1 = document.createElement('h1')
  h1.textContent = "Welcome!"
  document.body.append(h1)
}

export {addHeader}
```

index.test.js:
```
import { addHeader } from "./index.js" 
// remember, we can do this because we used babel to support ECMA modules^^^

describe("it can test DOM manipulation", () =>{
   addHeader()
   it("adds an h1 to the DOM", () =>{
      const noHeader = document.querySelector('h1')
      expect(noHeader).toBe(null)
      addHeader()
      const h1 = document.querySelector('h1')
      expect(h1).not.toBe(null)
      expect(h1.textContent).toBe("Welcome!")
   })
})
```

**Note**: We can get scripts linked to our HTML file to run if we configure JSDOM to run scripts "dangerously", but this should only be used where scripts are coming from trusted sources, as it could expose your entire Node environment to maliciously injected scripts.

### Testing Event Listeners

Testing Event Listeners is similar to testing DOM events - we just need to fire the type of event we want the student to create, then check to see if the behavior we wanted to test for occured:

index.js:
```
function createEventListener() {
   const button = document.getElementById("click-me")
   button.addEventListener("click", () =>{
      console.log("I was clicked!")
   })
}

export { createEventListener }
```

index.test.js
```
import { createEventListener } "./index.js"

describe("can test event listeners", () =>{
   it("runs a console.log when clicked", () =>{
      const logSpy = jest.spyOn(global.console, "log")
      createEventListener()
      const button = document.getElementById("click-me")
      button.click()
      expect(logSpy).toHaveBeenCalledWith("I was clicked!")
   })
})
```

## Testing Fetch

In order to test fetch calls, we'll be availing ourselves of Jest's mock function ability.

**Note:** For POST, PATCH, and DELETE requests, we also won't be able to process whether or not the requests the students write are actually changing the database. We can only check their configuration objects and whether or not the fetch call was successfully made.

I'm most shaky on this solution as an effective way to test. I don't think it would work for a production environment, but it should at least stop gap for our needs.

In order to test fetch, we'll need to use a Jest mock function and modify the global.fetch function to use this function instead.

Ex:
```
global.fetch = jest.fn(() =>
   Promise.resolve({
      json: () => Promise.resolve({ data: 'mock data' }),
   })
);
```

We can set this up in a beforeEach function, then run an afterEach to clear this out:

```
beforeEach(() => {
   global.fetch = jest.fn(() =>
      Promise.resolve({
         json: () => Promise.resolve({ data: 'mock data' }),
      })
   );
});
  
afterEach(() => {
   global.fetch.mockClear();
   delete global.fetch;
});
```

As with some of our current labs, we'll want students to write calls within functions and then return the fetch calls themselves from the functions:

index.js:
```
function fetchData(){
   return fetch("http://localhost:3000/data")
      .then(r => r.json())
      .then(data => {
         // do something with data
         return data
      })
      .catch(error =>{
         console.error(error)
      })
}

export { fetchData }
```

We can then test to see whether or not the exported function calls the fetch request, whether or not it uses the correct url, and whether or not it fetches data. We can also test to see if it has successfuly error handling logic.

Note that to see if it successfully fetches data, we have to have our second then statement return the data in question.

index.test.js:
```
describe('it can test fetch requests', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: 'mock data' }),
        })
      );
    });
  
    afterEach(() => {
      global.fetch.mockClear();
      delete global.fetch;
    });
  
    it('should call the API', async () => {
      await getData();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/data');
    });
  
    it('should return data from the API', async () => {
      const data = await getData();
      expect(data).toEqual({ data: 'mock data' });
    });
  
    it('should log an error if the API call fails', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject('API is down'));
      console.error = jest.fn();
  
      await getData();
      expect(console.error).toHaveBeenCalledWith('API is down');
    });
  });
```

We could also test to see if it manipulates the DOM correctly by adding in DOM querying logic:


index.js:
```
 function getData(){
    return fetch("http://localhost:3000/data")
       .then(r => r.json())
       .then(data => {
          // do something with data
          console.log(data.data)
          const p = document.createElement('p')
          p.textContent= data.data
          document.body.append(p)
          return data
       })
       .catch(error =>{
        console.error(error)
     })
 }
```

index.test.js:
```
it("should update the DOM", async () =>{
        await getData()
        const p = document.querySelector('p')
        expect(p).not.toBe(null)
        expect(p.textContent).toBe("mock data")
})
```

### POST, PATCH, and DELETE

Testing POST, PATCH, and DELETE requests will simply involve testing to see if the students sent up the appropriate configuration object:

index.test.js:
```
expect(global.fetch).toHaveBeenCalledWith('url', configObj)
```

Where `configObj` is any valid config obj for a different type of request.
