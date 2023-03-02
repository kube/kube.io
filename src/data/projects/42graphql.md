---
title: 42 GraphQL
description: GraphQL Façade of the 42 REST API
github: https://github.com/kube/42graphql
index: 10
---

**42 GraphQL** was a Façade of the 42 REST API, using [GraphQL](http://graphql.org/).

42 REST API was very slow and not easily understable.

The idea here was to wrap it in a [GraphQL Schema](https://github.com/kube/42GraphQL/tree/master/src/Schema), and cache resources in a Redis cache for faster responses.

GraphQL permits to reduce heavily number of REST API calls, as server response maps the client query, which resulted in a really fast API.

This was done without access to the database, only upon the public REST API.
