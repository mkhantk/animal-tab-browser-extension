chrome.runtime.sendMessage({ type: "getNextImages" }, (response) => {
  if (!response.success) {
    console.log(response.message);
    console.log("error");
  } else {
    displayImage(response.nextImage);
    console.log(response.message);
    console.log("success");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const animal = localStorage.getItem("animal");

  // fetchImages(animal);
  if (!animal) {
    document.body.style.backgroundColor = "black";
    document.body.style.color = "green";
    document.body.innerHTML =
      "Please choose between dog or cat before opening a new tab. Thanks!";
    document.body.style.fontSize = "20px";
  }

  // chrome.runtime.sendMessage({ type: "getNextImages" }, (response) => {
  //   if (response.success) {
  //     displayImage(response.nextImage);
  //     console.log(response.message);
  //   } else {
  //     console.error(response.message);
  //   }
  // });

  // console.log(API_ACCESS_KEY);
});

function displayImage(image) {
  //before completely loading the image, add loading

  const imageElement = document.createElement("img");
  imageElement.src = image;
  imageElement.alt = "";
  document.body.appendChild(imageElement);

  imageElement.onload = () => {
    console.log("image laoded successfully");
    document.querySelector(".loading").style.display = "none";
    imageElement.style.display = "block";
  };

  imageElement.onerror = () => {
    console.error("falied to load image");
  };
}
