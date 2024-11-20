<div style="text-align: center;">
  <h1>Calamoose Labs Presents</h1>
  <img height="250px" src="./static/logo.png" alt="Logo" />
</div>

**Internal App** is a module federation plugin for Deno, inspired by the
concept of module federation, micro frontends, and microservices. This middleware allows seamless sharing of
components between independent applications by setting up a federated gateway. As well as providing a 
federated gateway for backend services.

---

## Features

- **Easy Federation**: Share components across apps with minimal setup.
- **Dynamic Imports**: Components are loaded on-demand in the consumer app,
  reducing bundle size.
- **Alias Mapping**: Use simple aliases to reference remote components,
  abstracting away the URL routing.

---

## Getting Started

### Producer/Gateway Setup

To create a producer app or gateway, you need to set up the configuration for the remote components.

1. **Step One**
   ```typescript
   console.log("Step One");
   ```

2. **Step Two**
   ```typescript
   console.log("Step Two");
   ```


### Consumer Setup

To consume the producer app, you need to set up the alias configuration for the remote components.

1. **Step One**
   ```typescript
   console.log("Step One");
   ```

2. **Step Two**
   ```typescript
   console.log("Step Two");
   ```

### API


---

## License

Internal App is open-source software licensed under the MIT License.

