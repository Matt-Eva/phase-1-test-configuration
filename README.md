# Configuring Phase 1 Tests

This is an overview of how to set up tests for phase 1 labs and practice challenges using `jest`and `jest-environment-jsdom`.

## Installation

Note: You do not need to install `json-server` unless the lab or practice challenge requires students to make fetch requests. `json-server` will not be used for testing - it will just be used by students when they run their code.

To install Jest and other necessary tools:

`npm install --save-dev jest jest-environment-jsdom @babel/plugin-transform-modules-commonjs`

To install json-server:

`npm install --save-dev json-server`.

## Configurating Jest

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