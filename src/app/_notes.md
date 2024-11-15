# App

## Purpose

The purpose of this file is to setup the herd and any routes, it should take in
the router, builder, loader and all the plugins and tell them how to work
together and when to listen for changes and where they work in the lifecycle.
This will be exposed to the outside world.

## Middleware

The middleware is the main function that will be used to handle the requests. It
will be the entry point for all the plugins and routes.

Middleware should be able to support routers that use the next function or the
next function as part of the context.

## Routes

Routes are the main way to handle the requests. They should be able to support
all the HTTP methods and be able to use the next function or the next function
as part of the context.

The routes exports are always an HTTP method and should return the response.send
function which is either a function provided by the router or during the
normalization of the context it will return a response object.

During normalization of the context the routes will be able to extract the path
params from the URL pattern and add them to the context.params object.
Additionallly we will add a new object that will be the results object which
will return the response.send function or a response object or set the response
object, depending on how the router is setup.
