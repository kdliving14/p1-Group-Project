// variable for api result of dog breeds
let origDogsList = [];

//const variables to use in functions
const temp = [];

//main forms for displays
const form = document.querySelector("#dogform");
const section = document.querySelector("#app");
const results = document.querySelector("#results");

//api key variable
const config = require("./config.js");
const key = config.API_KEY;

// This is the main fx which loads all the dogs.
function mainGet() {
  const configObj = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": key
    }
  };

  fetch("https://api.thedogapi.com/v1/breeds/", configObj)
    .then((res) => res.json())
    /* setting origDogsList value in an array.*/
    .then((data) => {
      origDogsList = data;
      // console.log(origDogsList);
    });
}

// Calling mainGet() to load all the dogs.
mainGet();

//form event Listener
form.addEventListener("submit", (e) => {
  //prevent refresh
  e.preventDefault();

  //play audio when submit
  // let audio = new Audio("./src/DogBark2.wav");
  // audio.play();

  //values
  const uweight = document.querySelector("#weight").value;
  const uheight = document.querySelector("#height").value;

  //load up temperament array with traits
  const boxes = document.getElementsByName("temp");
  for (var checkbox of boxes) {
    if (checkbox.checked) temp.push(checkbox.value);
  }

  // filtering the weight
  const minMaxWeight = weightConverter(uweight);
  let weightResults = weightFilter(
    origDogsList,
    minMaxWeight[0],
    minMaxWeight[1]
  );

  // filtering the height
  const minMaxHeight = heightConverter(uheight);
  let heightResults = heightFilter(
    weightResults,
    minMaxHeight[0],
    minMaxHeight[1]
  );

  //passing height results to clean data for Temperament Function
  if (temp.length === 0) {
    showResults(heightResults);
  } else {
    cleanData(heightResults);
  }
});

/**
 * Fx returns the average weight of dog
 * @param {*} dogObj - 1 dog object from the origDogsList
 */
function averageWeight(dogObj) {
  // given one dog object: first grab the weight
  const weight = dogObj.weight.imperial;

  // use string.split() => split with white space => turns into an array
  const myArray = weight.split(" ");
  let x = parseInt(myArray[0], 10);
  let y = parseInt(myArray[2], 10);

  // average the 2 numbers:
  const average = (x + y) / 2;
  return average;
}

/**
 * Fx returns the average height of dog
 * @param {*} dogObj - 1 dog object from the origDogsList
 */
function averageHeight(dogObj) {
  // given one dog object: first grab the weight
  const height = dogObj.height.imperial;

  // use string.split() => split with white space => turns into an array
  const myArray = height.split(" ");
  let x = parseInt(myArray[0], 10);
  let y = parseInt(myArray[2], 10);

  // average the 2 numbers:
  const average = (x + y) / 2;
  return average;
}

/**
 * This function returns a list of dogs between the min and max range
 * @param {*} listOfDogs - the list of dogs to filter
 * @param {*} min - a number that represents the min weight
 * @param {*} max - a number that represents the max weight
 */
function weightFilter(listOfDogs, min, max) {
  // return a new list of dogs that satisfy the filter where the weight is between min and max
  const result = listOfDogs.filter((dog) => {
    const avgDogWt = averageWeight(dog);
    if (avgDogWt >= min && avgDogWt <= max) {
      return true;
    }
    return false;
  });
  return result;
}

/**
 * Fx converts a "string" to an array of numbers.
 * @param {*} weight - a string from HTML form (e.g. small, medium, etc.)
 */
function weightConverter(weight) {
  if (weight === "small") {
    return [3, 20];
  } else if (weight === "medium") {
    return [21, 55];
  } else if (weight === "large") {
    return [56, 80];
  } else if (weight === "xlarge") {
    return [81, 180];
  }
  return false;
}

/**
 * This function returns a list of dogs between the min and max range
 * @param {*} listOfDogs - the list of dogs to filter
 * @param {*} min - a number that represents the min height
 * @param {*} max - a number that represents the max height
 */
function heightFilter(listOfDogs, min, max) {
  // return a new list of dogs that satisfy the filter where the weight is between min and max
  const result = listOfDogs.filter((dog) => {
    const avgDogHt = averageHeight(dog);
    if (avgDogHt >= min && avgDogHt <= max) {
      return true;
    }
    return false;
  });
  return result;
}

/**
 * Fx converts a "string" to an array of numbers.
 * @param {*} height - a string from HTML form (e.g. small, medium, etc.)
 */
function heightConverter(height) {
  if (height === "small") {
    return [0, 10];
  } else if (height === "medium") {
    return [11, 20];
  } else if (height === "large") {
    return [21, 40];
  }
  return false;
}

//Temperament temp data (separate from main data)
const breedsData = [];
const breedsTempData = [];

/**
 * Goes through each breed of dog and makes sure their temperaments are a string
 * The data is cleaned because we know that some temperament values are not strings,
 * and are actually undefined. In order to take the data and apply string
 * methods without an error, I need to ensure an undefined didn't slip through the cracks.
 * @param {*} breeds - array of dog objects from height function
 */
const cleanData = (breeds) => {
  breeds.forEach((breed) => {
    if (typeof breed.temperament === "string") {
      breedsData.push(breed);
      breedsTempData.push(breed.temperament.split(", "));
    }
  });
  matchTemperament();
};

//passing functions through matching and counting functions
const matchTemperament = () => {
  const matchResults = arrayMatch(breedsTempData, breedsData, temp);
  breedResultsCount(matchResults); //this is the final result that we want to use to populate the page
};

/**
 * loop through list of dog temperaments to find matches
 * @param {*} TempData - array of temeraments per dog
 * @param {*} breedsData - cleaned up dog objects from height function
 * @param {*} userTempInput - user input from form
 */
const arrayMatch = (TempData, breedsData, userTempInput) => {
  let result = [];

  for (let i = 0; i < TempData.length; ++i) {
    for (let j = 0; j < TempData[i].length; ++j) {
      for (let k = 0; k < userTempInput.length; ++k) {
        if (TempData[i][j] === userTempInput[k]) {
          result.push(breedsData[i]);
        }
      }
    }
  }
  return result;
};

/**
 * gives each object a rank according to how many times it had a matching temperament
 * @param {*} matchResults - dog object results from array match function
 */
const breedResultsCount = (matchResults) => {
  const countArr = [];

  //counts the number of attribute matches for each dog
  for (const breed of matchResults) {
    if (countArr.some((obj) => obj.breedName === breed.name)) {
      let index = countArr.findIndex((obj) => obj.breedName === breed.name);
      countArr.at(index).count++;
    } else {
      let countObj = {};
      countObj.breedName = breed.name;
      countObj.count = 1;
      countArr.push(countObj);
    }
  }

  //sorts count array in descending order of occurences
  const sortedCountArr = countArr.sort(function (a, b) {
    return b.count - a.count;
  });

  //organizing final list of dogs by rank
  const finalResults = [];
  for (const obj of sortedCountArr) {
    let index = matchResults.findIndex((breed) => obj.breedName === breed.name);
    finalResults.push(matchResults.at(index));
  }
  //display final results with ranked dog objects
  showResults(finalResults);
};

/**
 * Creates the results page and all elements in the results page
 * @param {*} finalResults - dog objects in order by rank
 */
function showResults(finalResults) {
  //hide form, show results section
  section.hidden = true;
  results.hidden = false;

  //if there are no matches, make error screen
  if (finalResults.length === 0) {
    const result = document.createElement("p");
    result.setAttribute("class", "message");
    const img = document.createElement("img");
    result.innerHTML = `Unfortunately we do not have any dogs that match your criteria, please refresh the page and try again.<br></br>`;
    img.src = "./src/sadDog.jpeg";
    img.setAttribute("class", "sad_dog");
    result.appendChild(img);
    results.appendChild(result);
  }

  //match rank counter for displaying rank
  let counter = 0;

  //make and populate cards for each dog
  finalResults.forEach((dog) => {
    //decrease rank as you go down the list (bigger #)
    counter++;

    //create paragraph element for explanation
    const para = document.createElement("p");
    const paraImg = document.createElement("img");
    const paraDiv = document.querySelector(".para");

    //create elements for cards
    const name = document.createElement("h3");
    const rank = document.createElement("h2");
    const image = document.createElement("img");
    const info = document.createElement("p");
    const moreInfo = document.createElement("p");
    const butnDiv = document.createElement("div");
    const removeBtn = document.createElement("button");
    const likeBtn = document.createElement("button");
    const spacebtn = document.createElement("div");
    const card = document.createElement("div");

    //fill elements
    para.innerHTML = `We're sorry our results didn't met your pupspectations. <br></br>
      Please refresh the page and try again. Your perfect pair is out there!<br></br>`;
    para.setAttribute("class", "message");
    paraImg.src = "./src/sadDog.jpeg";
    paraImg.setAttribute("class", "sad_dog");
    name.textContent = dog.name;
    rank.textContent = `#${counter} Match`;
    image.src = dog.image.url;
    info.innerHTML = `<font size="+1"> Weight: </font> ${dog.weight.imperial} lbs
                 </br> <font size="+1"> Height: </font> ${dog.height.imperial} inches</br>
                 </br> <font size="+1"> Temperament: </font> </br> ${dog.temperament}`;
    moreInfo.innerHTML = `<font size="+1"> Bred for: </font> ${
      dog.bred_for || "N/A"
    }
                   </br> <font size="+1"> Breed Group: </font> ${
                     dog.breed_group || "N/A"
                   }
                   </br> <font size="+1"> Life Span: </font> ${dog.life_span}`;

    //attach css settings
    card.className = "card";
    spacebtn.className = "space";

    //remove button
    removeBtn.innerHTML = "Remove";
    removeBtn.id = "removeBtn";

    //like button
    likeBtn.id = "likeBtn";
    likeBtn.textContent = "♡ Like";

    //attach buttons to div
    butnDiv.appendChild(likeBtn);
    butnDiv.appendChild(spacebtn);
    butnDiv.appendChild(removeBtn);

    //attach elements to card
    card.appendChild(name);
    card.appendChild(rank);
    card.appendChild(image);
    card.appendChild(info);
    card.appendChild(moreInfo);
    card.appendChild(butnDiv);

    //attach card to webpage
    results.appendChild(card);

    //event listener - remove button
    removeBtn.addEventListener("click", () => {
      if (likeBtn.textContent === "\u2665 Unlike") {
        alert("Cannot remove a liked dog.");
      } else {
        results.removeChild(card);
        if (results.querySelectorAll(".card").length === 0) {
          para.appendChild(paraImg);
          paraDiv.appendChild(para);
        }
      }
    });

    //event listener - like button
    likeBtn.addEventListener("click", () => {
      const whiteHeart = "\u{2661} Like";
      const blackHeart = "\u2665 Unlike";
      const like = likeBtn.textContent;
      if (like === whiteHeart) {
        likeBtn.textContent = blackHeart;
      } else {
        likeBtn.textContent = whiteHeart;
      }
    });
  });
}
