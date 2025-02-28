# Film Grain Effect Generator

[View Demo](https://jashior.github.io/grain/)

A web-based tool that allows users to add animated film grain effects to their images. Perfect for creating vintage or artistic photo effects right in your browser.

## Features

- Drag and drop image upload
- Real-time animated film grain effect
- Adjustable grain intensity
- Download capability to save the result
- Responsive design that works on all devices
- No server required - runs entirely in the browser

## Usage

1. Visit the website
2. Upload an image by either:
   - Dragging and dropping an image onto the upload area
   - Clicking the upload area to select an image from your device
3. Adjust the grain intensity using the slider
4. Click the "Download Result" button to save your image with the grain effect

## Technical Details

The application uses HTML5 Canvas to create the grain effect. It overlays a semi-transparent noise layer on top of your image, which is animated in real-time. When downloading, the current state of the grain effect is merged with your original image.

## Running Locally

Simply open `index.html` in a modern web browser. No server or build process is required.

## Browser Support

Works in all modern browsers that support HTML5 Canvas and JavaScript ES6+:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use this project however you'd like! 
