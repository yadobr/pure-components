---

# PureComponents

A lightweight, dependency-free JavaScript library for building reusable UI components with pure JavaScript. PureComponents enables developers to create modular, performant components with minimal overhead, ideal for projects that don’t require heavy frameworks.

## Features

- **Lightweight & Dependency-Free**: Built with vanilla JavaScript, no external dependencies.
- **Event Handling**: Supports dynamic interactions like scroll-to-bottom callbacks and overlays for `.overlay` elements.
- **Flexible**: Easily integrates with existing DOM structures for seamless UI enhancements.

## Installation

Install PureComponents via npm:

```bash
npm install pure-components
```

Or include it directly in your HTML via a CDN (if available, e.g., unpkg):

```html
<script src="https://unpkg.com/pure-comps@latest/dist/pure-components.umd.js"></script>
```

## Dev mode

```bash
npm run dev
```

## Build

```bash
npm run buld
```

## Usage

### 1. Creating a Component

PureComponents creates component instances for all blocks of a specified type on the page.

```javascript
import { PureComponents } from 'pure-comps';

// Initialize a component for elements with class 'my-block'
const myBlock = new PureComponents('.my-block');
```

Or pass a DOM node directly:

```javascript
const element = document.querySelector('.my-block');
const myBlock = new PureComponents(element);
```

### 2. Data Exchange Between Components

Register slots and blocks to enable signal-based communication:

```javascript
// Register a slot to listen for signals
myBlock.registerSlot('mySlot', (data) => {
  console.log('Received data:', data);
});

// Send data to another block
otherBlock.send('mySlot', { message: 'Hello from PureComponents!' });
```

### 3. Scroll-to-Bottom Callback

Trigger a callback when the user scrolls to the bottom of the page:

```javascript
PureComponents.onScrollEnd(() => {
  console.log('Reached the bottom of the page!');
});
```

### 4. Adding Overlays

Create overlays for elements with the `.overlay` class:

```javascript
PureComponents.createOverlay(); // Applies overlay to all .overlay elements
```

### Example

```html
<div class="my-block">My Component</div>
<div class="overlay">Overlay Content</div>

<script type="module">
  import { PureComponents } from 'pure-comps';

  const block = new PureComponents('.my-block');
  block.registerSlot('dataSlot', (data) => console.log(data));
  PureComponents.onScrollEnd(() => console.log('Scrolled to bottom!'));
  PureComponents.createOverlay();
</script>
```

## API Reference

- `new PureComponents(elementOrSelector)`: Creates a component instance for a DOM node or selector.
- `registerSlot(slotName, callback)`: Registers a slot to receive signals.
- `send(slotName, data)`: Sends data to registered slots.
- `onScrollEnd(callback)`: Triggers a callback when scrolling to the page's end.
- `createOverlay()`: Adds overlays to all elements with the `.overlay` class.

## Contributing

We welcome contributions! To get started:

1. Fork the repository.
2. Create a feature branch: `git checkout -b my-feature`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin my-feature`.
5. Open a Pull Request.

Please ensure your code follows the project's coding style and includes tests.

## License

MIT License. See [LICENSE](LICENSE) for more details.

## Contact

For issues or suggestions, open an issue on [GitHub](https://github.com/your-username/pure-comps) or reach out on [X](https://x.com/your-profile).

---

### Notes
- Replace `your-username` and `your-profile` with your actual GitHub username and X handle.
- If you plan to publish to a CDN, ensure you host the UMD build on a service like unpkg or jsDelivr and update the CDN link.
- If your project has specific build instructions or additional dependencies, add them to the `README.md`.
- You can expand the API Reference section with more methods as your library grows.

Let me know if you need adjustments or additional sections (e.g., a "Development Setup" section for contributors)!