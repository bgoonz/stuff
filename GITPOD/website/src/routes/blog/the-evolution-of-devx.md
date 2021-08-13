---
author: pawlean, mikenikles
date: Thu, 05 Aug 2021 11:00:00 UTC
excerpt: For our first DevX Digest, we explore the evolution of developer experience in the IDE world.
image: evolution-of-devx.jpg
slug: the-evolution-of-devx
subtitle:
teaserImage: evolution-of-devx.jpg
title: DevX Digest 01 - The evolution of DevX 🌱
type: digest
---

<script context="module">
  export const prerender = true;
</script>

Welcome to **DevX Digest - the place to hear all about Developer Experience**, brought to you by Pauline Narvas [(@paulienuh)](https://twitter.com/paulienuh) and Mike Nikles [(@mikenikles)](https://twitter.com/mikenikles) from Gitpod. You’re reading the first ever newsletter from us 🎉!

## What is DevX?

When we’ve asked folks what they think developer experience (DevX) is, the answers vastly differ. For some, it’s good documentation; it’s a language, it’s the best framework, it’s how quickly you can go from idea to execution with minimal headaches…

No matter how you define developer experience, it is crucial to get it right; a good (or bad) experience could be the make or break relationship developers have with a tool. On top of that, the industry is saturated with choice on which tool is best to use - it is so overwhelming. How can we pick the right one?

It’s strange how even though we recognise how important developer experience is, it’s still an area that just isn’t talked about often. Redmonk gave this a name, [“developer experience gap”](https://redmonk.com/sogrady/2020/10/06/developer-experience-gap/):

> “...developers are forced to borrow time from writing code and redirect it towards managing the issues associated with highly complex, multi-factor developer toolchains held together in places by duct tape and baling wire.”

## DevX in the IDE world

To illustrate how DevX has evolved to become a more seamless, joyful, efficient experience, let’s talk about the integrated development environment (IDE).

A few years ago there were two approaches for devs, either use a fully-integrated development environment (IDE) that would be a fat application equipped with everything a developer could possibly need. Examples of this are Eclipse, Jetbrains’ IDEs or Apple’s Xcode. On the other end of the spectrum we would find developers who find all this tooling too heavy weight and slow. Those devs would cheer for the lightness and flexibility of command lines paired with text editors, such as sublime but also vi or emacs.

Has this changed? Yes, that is the short answer to that. You can see that another IDE, namely Visual Studio Code, has since taken over.

## VS Code takes over - Why is that?

Classic heavy-weight IDEs, such as Eclipse, were the trailblazers that paved the way for many important DevX improvements. What made it a fantastic experience for developers was how they could vastly customise environments using their extensible plugin system. But they often went a bit too far, by adding tools and abstractions that slowed down the overall experience and ignoring powerful tools like CLIs that were contributed by the various language communities.

[Sven Efftinge](https://twitter.com/svenefftinge) and [Erich Gamma](https://twitter.com/erichgamma) recently talked about this very topic during DevX Conf ([YouTube video](https://www.youtube.com/watch?v=JiBUDS9odA8)). Erich led the original development of the Eclipse IDE. He co-authored the book **“Design Patterns: Elements of Reusable Object-Oriented Software”** and currently works at Microsoft, where he is the VS Code Dev Lead. Their conversation gave an interesting insight on the history of these IDEs, design decisions made at the time and how that has changed over time influenced by developer experience.

One thing we know that is certain is that things change.

Eclipse was designed to run extensions on the same process as the core. At the time, this single process architecture made sense. In the spirit of moving fast, this was the quickest way to integrate extensions to the core.

![Source: Stackoverflow Surveys 2015-2019 (professional developers)](../../../static/images/blog/the-evolution-of-devx/source.png)
_Source: Stackoverflow Surveys 2015-2019 (professional developers)_

However, the more Eclipse grew, including its extensions, the downsides became more apparent. This complex architecture’s side effects often led to slow start-up times, a bloated IDE and extensions depending on specific versions. The mindset of loading everything in the same process implied that every extension had to be written in Java, but what about other languages?

Over time slow and bloated software can leave folks wondering if there are alternatives - something that could relieve the pain of those downsides!

And then... VS Code enters the chat.

JSON-RPC, the Language Server Protocol (LSP), API-driven, a multi-process architecture (extensions not part of the ‘core’) leading to faster start-up times, less bloat and leaner. The pain points and limitations developers had experienced from Eclipse, VS Code was developed to reduce. It is no wonder that today, VS Code is the most used IDE.

## Less is better

For those extreme power users, upon the first inspection, the VS Code extension model may seem limited in some way in comparison to the one from Eclipse, but that can be a good thing. What’s the saying again? Simplicity is better! This simplicity is deliberate, of course. Often, it is the simpler designs that extend the lifespan of software for years to come.

It’s interesting how the mindset from Eclipse to VS Code has shifted, which has massively been led by the experience of developers.

## Let’s look at challenges developers face today

With this in mind, the next question is, what are some pain points developers have today? And what is next to help with those pain points?

Speaking personally, despite massive leaps to VS Code, I still think of roaring loud fans, a burning hot laptop, especially if you were like me -- hanging on to dear life to old tech. Sound familiar? My six-year-old Macbook Pro fits this description.

VS Code with all my extensions ran slow despite it being relatively light compared to other IDEs; my laptop couldn’t handle it. I wasn’t able to start writing code immediately when the creative juices started flowing! Don’t even get me started on the uphill battle of getting the correct developer environment setup (_e.g. cloning, installing dependencies on an old, bloated piece of hardware_)... At that point, it just wasn’t worth it. So what is the solution?

## What’s next for developer experience?

Tech has constantly been talking about the power of the cloud in recent years. As Chris Aniszczyk describes in his post, ["Cloud Native predictions for 2021 and beyond."](https://www.aniszczyk.org/2021/01/19/cloud-native-predictions-for-2021-and-beyond/):

> “The future will hold that the development lifecycle (code, build, debug) will happen mostly in the cloud versus your local Emacs or VSCode setup. You will end up getting a full dev environment setup for every pull request, pre-configured and connected to their deployment to aid your development and debugging needs.”

Sounds like a dream, huh? The next generation of IDEs is already here! You can do this right now with Gitpod and GitHub Codespaces beta. The constant innovation excites me the most about tech in general; it’s truly magical to see how developer experience will continue to shape our tool kit as developers. As long as we can imagine it, it is possible and isn’t that exciting?

## Join us for the ride!

We hope to highlight DevX further and bring to you curated content about what truly makes for great developer experiences! Over the next few months, we’ll be sharing best practices and frameworks that continue to spark dialogue across four different areas:

1. Develop
1. Collaborate
1. Test, build & deploy
1. Run

## DevX newsletter is community-driven

Another thing about Gitpodders is that we’re all driven by community feedback, and this newsletter is no exception! Please send us your thoughts, feedback and help us drive this conversation. We may even feature some of your takes and comments in future newsletters!

Come and hang out with us over on [our Discord channel](https://gitpod.io/chat).
