# `i18next-to-fluent`

`i18next-to-fluent` is a solution simplifying the migration from [I18next](https://www.i18next.com) to [Fluent](http://projectfluent.org).

## Motivation behind the project

In today's world of high customization, massive A/B testing, and quickly changing requirements, it is preferable to speed up release cycle all the time.

When it comes about conversion optimization of text content, it turns out to be crucial to test as many variants as possible setting up experiments really quickly. All are based on multiple user related parameters. All are in different places on the same web pages, in parallel.

Without granting full control over text content to the direct editors (marketing team, localizers), it immediately becomes unmaintainable and slows the company down.

Being a developer, if you've ever created these phrases first, then those ones for some special ocassion and so on switching between all of them in the source code, you and your colleagues definitely know this feeling.

When I personally started figuring out how to optimize localization management in order to untie the hands of marketing team, I decided:

- to move localization resources out of source code repository
- to find a specification supporting parameterized, multivariant phrases
- to find and provide colleagues a UI developed exactly for localization purposes

What I've ended up is the combination of [Fluent](https://projectfluent.org/) and [Pontoon](https://pontoon.mozilla.org/), both being open source and developed by Mozilla.

Fluent brings a number of notable improvements to the process of localization and, generally speaking, to the way we manage the text content on web applications.

Sharing [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) principle with [ICU MessageFormat](http://userguide.icu-project.org/formatparse/messages), Fluent goes further by providing more readable syntax and usability and by giving localizers even more control over formatting.

> _Read the comparison articles about [feature set](https://github.com/projectfluent/fluent/wiki/Fluent-and-ICU-MessageFormat) and [syntax](https://github.com/projectfluent/fluent/wiki/MessageFormat-vs-Fluent-Syntax) between Fluent and ICU MessageFormat._

At the time I started a migration of one of my projects, it turned out that it would not be easy to say the least. One of the issues was the fact that `i18next`'s nested trees of phrases were simply incompatible with Fluent which supported no more than 1 level of nesting (attributes of messages).

Since it seemed like there was no tool providing complete compatibility layer on the wild, I decided to develop and to publish one by myself.

## Notice

The project is under development right now. There's a number of unsolved issues as well as the lack of documentation. API also may change at any time.

Wait a little bit until the full compatibility is provided. I'm personally interested to stabilize the solution as quickly as possible to set up the migration of commercial projects e.g. [fish.travel](https://fish.travel). Stay tuned!

If you'd like to show your support and point the development to specific edge cases or feature requests, consider reacting on issues with comments or just emoji. This way I will see what's the most expected for the community and focus on solving those issues first.

## Repository structure

- **converter** from `.json` to `.ftl`.

It transforms full-featured (nesting, plurals, references and more) `i18next` localization resources to the Fluent compatible ones.

- **client-side adapter** to provide compatibility layer between your `i18next`-oriented code and Fluent API. It's the right time to remove `i18next` related packages from the list of dependencies.

It basically resolves your old paths to the new ones and allows you to use good old `t('mainPage.header.title')`.

This way it saves you from making lots of code changes since paths to messages will be different. It'll most likely happen if you have previously used nesting heavily (Fluent does not actually support deep nesting at the moment).

- **React bindings** to provide resolving adapter to your components.

- **instructions** about how to set up localization pipeline effectively from scratch: from the workspace for translators to the performant loading of resources at the client side.

## License

`i18next-to-fluent` is [MIT](./LICENSE.md) licensed.
