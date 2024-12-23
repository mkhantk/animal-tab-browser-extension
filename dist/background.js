import { API_ACCESS_KEY } from "./config.js";

console.log("background is loaded");

// Cache management variables
let currentAnimal = null;
let currentImage = 0;
let imageLimit = 2;

// Preload images function
async function preloadImages(animal) {
  const apiUrl = `https://api.unsplash.com/photos/random?client_id=${API_ACCESS_KEY}&query=${animal}&count=10&orientation=landscape`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    // Cache new images
    const newImages = data.map((image) => image.urls.raw);
    const cache = await caches.open("image-cache");

    await Promise.all(
      newImages.map(async (url) => {
        await cache.add(url);
      })
    );

    console.log("Images preloaded successfully!");
    return { success: true, message: "PRELOADING SUCCESS" };
  } catch (error) {
    console.error("Error preloading images:", error);
    return { success: false, message: "PRELOADING FAILED" };
  }
}

// Listener for incoming messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      // Handle preloadImages
      if (message.type === "preloadImages") {
        currentAnimal = message.category;
        currentImage = 0;

        // Clear previous cache
        await caches.delete("image-cache");

        const result = await preloadImages(currentAnimal);
        sendResponse(result);
        return;
      }

      // Handle reset
      if (message.type === "reset") {
        currentAnimal = null;
        currentImage = 0;
        await caches.delete("image-cache");
        sendResponse({ success: true, message: "Reset successful" });
        return;
      }

      // Handle getNextImages
      if (message.type === "getNextImages") {
        const cache = await caches.open("image-cache");
        const cacheKeys = await cache.keys();

        console.log("Cache keys:", cacheKeys);

        // Fetch more images if near limit
        if (currentImage >= cacheKeys.length - imageLimit) {
          console.log("Fetching more images...");
          await preloadImages(currentAnimal);
          await manageCache();
        }

        // Validate cache availability
        if (currentImage < cacheKeys.length) {
          const request = cacheKeys[currentImage];
          const cacheResponse = await cache.match(request);

          console.log("Cache Response:", cacheResponse);

          if (cacheResponse) {
            const imageUrl = request.url; // Get image URL
            currentImage++;

            sendResponse({
              success: true,
              nextImage: imageUrl,
              message: "Image fetched successfully",
            });
          } else {
            throw new Error("Cache fetch failed.");
          }
        } else {
          console.warn("No more images available");
          sendResponse({ success: false, message: "No more images" });
        }

        return;
      }

      // Handle test message
      if (message.type === "test") {
        sendResponse({ success: true, message: "Test successful" });
        return;
      }

      // Default response
      sendResponse({ success: false, message: "Invalid message type" });
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({ success: false, message: "Internal error" });
    }
  })();

  // Return true to indicate async handling
  return true;
});

async function manageCache() {
  const cache = await caches.open("image-cache");
  const keys = await cache.keys();

  // Keep only the latest 10 images
  if (keys.length > 10) {
    for (let i = 0; i < keys.length / 2; i++) {
      await cache.delete(keys[i]); // Remove old entries
    }
    currentImage = keys.length / 2; // Reset index
  }
}
