// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById("user-image");
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById("image-input");
const form = document.getElementById('generate-meme');
const submitButton = document.querySelector('[type="submit"]');
const clearButton = document.querySelector('[type="reset"]');
const readButton = document.querySelector('[type="button"]');
const textTop = document.getElementById("text-top");
const textBottom = document.getElementById("text-bottom");
const voiceSelect = document.getElementById("voice-selection");
const synth = window.speechSynthesis;
const volumeImg = document.querySelector('#volume-group img');
const volumeSlider = document.querySelector('#volume-group input');
let volume = 1; 

//Populate voice selector when voices load in
synth.onvoiceschanged = function() {
  let voices = synth.getVoices();
  voiceSelect.remove(0);
  for(let i = 0; i < voices.length; i++) {
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
  
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }
  
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.disabled=false; 
};


// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // Clear the canvas context, fill canvas context with black 
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0, canvas.width, canvas.height);
  
  // Draw image to canvas with correct dimensions
  let dim = getDimensions(canvas.width, canvas.height, img.width, img.height); 
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height); 
  
  //toggle relevant buttons 
  submitButton.disabled=false; 
  clearButton.disabled=true; 
  readButton.disabled=true; 
});

// Fires whenever the user uploads a new image file 
imageInput.addEventListener('change', () => {
  // Load the selected image to the image object
  let imageFile = imageInput.files[0]; 
  let imageURL = URL.createObjectURL(imageFile); 
  img.src = imageURL; 
});

// Fires whenever the user submits meme form
form.addEventListener('submit', (event) => {

  // Add top/bottom text to canvas 
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black'; 
  ctx.lineWidth = '2';
  ctx.font = '40pt Impact'; 
  ctx.textAlign = 'center';
  let x = canvas.width / 2; 
  ctx.fillText(textTop.value, x, 60); 
  ctx.strokeText(textTop.value, x, 60); 
  ctx.fillText(textBottom.value, x, canvas.height - 20);
  ctx.strokeText(textBottom.value, x, canvas.height - 20);

  //toggle relevant buttons 
  submitButton.disabled=true; 
  clearButton.disabled=false; 
  readButton.disabled=false; 
  
  //Don't reset form 
  event.preventDefault(); 
}); 

// Fires whenever user clicks clear button
clearButton.addEventListener('click', () => {
  //clear canvas 
  ctx.clearRect(0, 0, canvas.width, canvas.height); 

  //toggle relevant buttons 
  submitButton.disabled=false; 
  clearButton.disabled=true; 
  readButton.disabled=true; 
});

// Fires whenever user clicks read text button
readButton.addEventListener('click', () => {
  //Speak text using selected voice 
  let voices = synth.getVoices();
  let combinedText = textTop.value + " " + textBottom.value; 
  let utterThis = new SpeechSynthesisUtterance(combinedText);
  let selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
  utterThis.volume = volume;
  synth.speak(utterThis);
}); 

// Fires on any input into the volume slider
volumeSlider.addEventListener('input', () => {
  //Update volume value of spoken text 
  volume = Number(volumeSlider.value) / 100; 

  //Update icon depending on volume range
  if(volumeSlider.value >= 67 && volumeSlider.value <= 100)
    volumeImg.src="icons/volume-level-3.svg"; 
  else 
    if(volumeSlider.value >= 34 && volumeSlider.value <= 66)
      volumeImg.src="icons/volume-level-2.svg"; 
      else 
        if(volumeSlider.value >= 1 && volumeSlider.value <= 33)
          volumeImg.src="icons/volume-level-1.svg"; 
        else
          volumeImg.src="icons/volume-level-0.svg";
}); 
/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
