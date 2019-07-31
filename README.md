# `i18next-to-fluent`

`i18next-to-fluent` is a solution simplifying the migration from [I18next](https://www.i18next.com) to [Fluent](http://projectfluent.org).

> **Warning:** the project is under development right now. There's a number of unsolved issues as well as the lack of documentation. API also may change at any time.

> Wait a little bit until the full compatibility is provided. I'm personally interested to stabilize the solution as quickly as possible to set up the migration of commercial projects e.g. [fish.travel](https://fish.travel). Stay tuned!

### The main parts

- **converter** from `.json` to `.ftl`.

It transforms full-featured (nesting, plurals, references and more) `i18next` localization resources to the Fluent compatible ones.

- **client-side adapter** to provide compatibility layer between your `i18next`-oriented code and Fluent API. It's the right time to remove `i18next` related packages from the list of dependencies.

It basically resolves your old paths to the new ones and allows you to use good old `t('mainPage.header.title')`.

This way it saves you from making lots of code changes since paths to messages will be different. It'll most likely happen if you have previously used nesting heavily (Fluent does not actually support deep nesting at the moment).

- **React bindings** to provide resolving adapter to your components.

- **instructions** about how to set up localization pipeline effectively from scratch: from the workspace for translators to the performant loading of resources at the client side.

### License

`i18next-to-fluent` is [MIT](./LICENSE.md) licensed.
