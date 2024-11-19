<div style="text-align: center;">
  <h1>Herd JS</h1>
  <img height="250px" src="./static/logo.png" alt="Herd JS Logo" />
</div>

**Amber.js** is a module federation plugin for Fresh and Deno, inspired by the
concept of Jurassic Park amber. This plugin allows seamless sharing of
components between independent Fresh applications by setting up a federated
component ecosystem. The producer app exposes specified components, and the
consumer app dynamically imports these components via friendly aliases.

---

## Features

- **Easy Federation**: Share components across Fresh apps with minimal setup.
- **Dynamic Imports**: Components are loaded on-demand in the consumer app,
  reducing bundle size.
- **Alias Mapping**: Use simple aliases to reference remote components,
  abstracting away the URL routing.

---

## Getting Started

### Producer App Setup

In the producer Fresh app, install **Amber.js** and configure it to expose the
components you want to share.

1. **Install the Plugin**
   ```typescript
   import { start } from "$fresh/server.ts";
   import { createFederationPlugin } from "./federation_plugin.ts"; // Path to Amber.js plugin

   await start({
     plugins: [createFederationPlugin(["header", "footer", "sidebar"])],
   });
   ```

2. **Serve Components**

   This configuration will expose components at:
   - `https://producer-server.com/federation/header`
   - `https://producer-server.com/federation/footer`
   - `https://producer-server.com/federation/sidebar`

### Consumer App Setup

In the consumer Fresh app, install **Amber.js** and set up the alias
configuration for the remote components.

1. **Install the Plugin**
   ```typescript
   import { extractDNA } from "@amber-js/amber";

   // Sets up the barebones federation
   extractDNA();

   // Sets up the barebones federation
   extractDNA();

   // Sets up the barebones federation
   extractDNA();

   // Sets up the barebones federation
   extractDNA();
   ```

2. **Import Components by Alias**

   Use aliases to load and render components dynamically.

   ```typescript
   import { useEffect, useState } from "preact/hooks";

   export default function DynamicComponentLoader(
     { alias }: { alias: string },
   ) {
     const [Component, setComponent] = useState<preact.ComponentType | null>(
       null,
     );

     useEffect(() => {
       async function loadComponent() {
         const module = await import(`/_federation/${alias}`);
         setComponent(() => module.default);
       }
       loadComponent();
     }, [alias]);

     return Component ? <Component /> : <div>Loading...</div>;
   }
   ```

   **Usage Example**:
   ```typescript
   <DynamicComponentLoader alias="Header" />;
   ```

### API

- **Producer Plugin**: `createFederationPlugin(paths: string[])`
  - **`paths`**: An array of component names to expose, e.g.,
    `["header", "footer"]`.

- **Consumer Plugin**:
  `createFederationAliasPlugin(aliasMap: Record<string, string>)`
  - **`aliasMap`**: An object mapping aliases to URLs, e.g.,
    `{ "Header": "https://producer-server.com/federation/header" }`.

---

## License

Amber.js is open-source software licensed under the MIT License.

---

### Additional Notes

- **Caching**: Add caching headers in production to reduce load times.
- **Security**: Limit component exposure to only those intended for federation.
- **Error Handling**: Ensure error handling for cases when components are not
  available.
