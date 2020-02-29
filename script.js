const url = "https://api.spotify.com/v1/search?q=tag%3Anew&type=album&limit=50";
let bearer = "";
let idList = [];
let idArray = [];
let albumDatabase = [];
let artistDatabase = {};
let genreList = [];
let postedAlbums = [];
let albumCount = 0;
let loaded = 0;
let storeClick = "";

function getIds(url) {
  return new Promise((resolve, reject) =>
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: bearer
      }
    })
      .then(response => {
        if (response.status !== 200) {
          if (response.status == 404 || 401) {
            resolve(idList);
          } else {
            throw `${response.status}: ${response.statusText}`;
          }
        }
        const r = response.json();
        return r;
      })
      .then(responseJson => {
        let idCount = 0;
        for (let i = 0; i < responseJson.albums.items.length; i++) {
          if (responseJson.albums.items[i] == null) {
            let z = 0;
          } else {
            idList.push(responseJson.albums.items[i].id);
          }
        }
        idCount++;
        if (
          responseJson.albums.next !==
          "https://api.spotify.com/v1/search?query=tag%3Anew&type=album&offset=500&limit=50"
        ) {
          console.log(responseJson.albums.next);
          resolve(getIds(responseJson.albums.next));
        } else {
          resolve(idList);
        }
      })
  );
}

function createIdArray(idList) {
  return new Promise((resolve, reject) => {
    let count = 0;
    let idString = "";
    for (let i = 0; i < idList.length; i++) {
      if (count == 19) {
        idString += `${idList[i]}`;
        idArray.push(idString);
        count = 0;
        idString = "";
      } else {
        idString += `${idList[i]},`;
        count++;
      }
    }
    resolve(idArray);
  });
}

function createAlbumDatabase(idArray, count = 0) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.spotify.com/v1/albums?ids=${idArray[count]}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: bearer
      }
    })
      .then(response => {
        const r = response.json();
        console.log(r);
        return r;
      })
      .then(response => {
        albumDatabase.push(response);
        count++;
        if (count < idArray.length) {
          resolve(createAlbumDatabase(idArray, count));
        } else {
          resolve(albumDatabase);
        }
      });
  });
}

function createArtistStrings(data) {
  let strArr = [];
  let artStr = "";
  let count = 0;
  console.log(data[0].albums[0].artists[0].id);
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].albums.length; j++) {
      let releaseDate = new Date(data[i].albums[j].release_date);
      let releaseMilli = releaseDate.getTime();
      if (data[i].albums[j] === null) {
        let poiuoipu = 0;
      } else {
        for (const artist in data[i].albums[j].artists) {
          if (count == 49) {
            artStr += `${data[i].albums[j].artists[artist].id}`;
            strArr.push(artStr);
            artStr = "";
            count = 0;
          } else {
            artStr += `${data[i].albums[j].artists[artist].id},`;
            count++;
          }
        }
      }
    }
  }
  console.log(strArr);
  return strArr;
}

function getArtists(data, count = 0) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.spotify.com/v1/artists?ids=${data[count]}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: bearer
      }
    })
      .then(response => {
        const r = response.json();
        console.log(r);
        return r;
      })
      .then(response => {
        for (let i = 0; i < response.artists.length; i++) {
          if (artistDatabase.hasOwnProperty(`${response.artists[i].name}`)) {
            let fdsjhf = 0;
          } else {
            artistDatabase[`${response.artists[i].name}`] =
              response.artists[i].genres;
          }
        }
        count++;
        if (count < data.length) {
          resolve(getArtists(data, count));
        } else {
          resolve(artistDatabase);
        }
      });
  });
}

function addGenreData(genreList) {
  console.log("addGenreData Go!");
  console.log(albumDatabase[0].albums[0].genres);
  for (let i = 0; i < albumDatabase.length; i++) {
    for (let j = 0; j < albumDatabase[i].albums.length; j++) {
      for (const artist in albumDatabase[i].albums[j].artists) {
        albumDatabase[i].albums[j].genres.push(
          `${genreList[`${albumDatabase[i].albums[j].artists[artist].name}`]}`
        );
      }
    }
  }
  return albumDatabase;
}

function createGenreList() {
  for (const artist in artistDatabase) {
    for (let j = 0; j < artistDatabase[artist].length; j++) {
      if (genreList.includes(artistDatabase[artist][j]) == false) {
        genreList.push(artistDatabase[artist][j]);
      }
    }
  }
  loaded = 1;
  if (storeClick != "") {
    postedAlbums = [];
    $(".showAlbums").empty();
    displayAlbums(storeClick);
  }
}

function getToken() {
  const data = { grant_type: "client_credentials" };
  return new Promise((resolve, reject) => {
    fetch(`https://accounts.spotify.com/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic NWYxNmE2ZjZjZTA2NDBmZTllNTVhNTQ5NTNiOGJlNzY6YWEzMmNhZTEzZjI3NGRjMGE1YWZlNWVmOTVmYWUzYmM="
      },
      body: new URLSearchParams(data)
    })
      .then(res => res.json())
      .then(res => {
        bearer = "Bearer " + res.access_token;
      })
      .then(res => {
        resolve(bearer);
      });
  });
}

function displayGenreKeywords() {
  $(".loading").hide();
  $(
    `<h1>Please select a genre below</h1><p class="instructions">This will display albums associated with that genre, sorted by subgenre</p>`
  ).insertBefore(".keyGenres");
  const keywords = [
    "hip hop",
    "r&b",
    "pop",
    "dance",
    "edm",
    "electronic",
    "trap",
    "rock",
    "metal",
    "punk",
    "folk",
    "country",
    "reggaeton",
    "latin",
    "classical",
    "alternative",
    "indie"
  ];
  for (let i = 0; i < keywords.length; i++) {
    $(".keyGenres").append(`<li class="key">${keywords[i]}</li>`);
  }
  $(".keySearch").append(
    `<p>Or enter your own search term:</p>
       <input id="text" type="text" value="" aria-label="Genre Search">
       <button type="submit" class="submit">Search genres</button>`
  );
  $(".keyGenres").on("click", ".key", function(event) {
    if (loaded == 0) {
      $(".subGenreLoad").replaceWith(
        `<p class="subGenreLoad">Loading... <img src="loader.gif" width="25"/></p>`
      );
      storeClick = $(this).html();
    } else {
      postedAlbums = [];
      $(".showAlbums").empty();
      displayAlbums($(this).html());
    }
  });
  $("form").on("submit", function(event) {
    event.preventDefault();
    if (loaded == 0) {
      $(".subGenreLoad").replaceWith(
        `<p class="subGenreLoad">Loading... <img src="loader.gif" width="25"/></p>`
      );
      storeClick = $("#text").val();
    } else {
      postedAlbums = [];
      $(".showAlbums").empty();
      let userGenre = $("#text")
        .val()
        .toLowerCase();
      displayAlbums(userGenre.replace("'", ""));
      console.log(userGenre);
    }
  });
}

function displayAlbums(keyword = "rock") {
  albumCount = 0;
  const re = new RegExp(keyword.replace("amp;", ""));
  let listFromKeyword = [];
  for (i = 0; i < genreList.length; i++) {
    if (genreList[i].search(re) > -1) {
      listFromKeyword.push(genreList[i]);
    }
  }
  for (p = 0; p < listFromKeyword.length; p++) {
    if (listFromKeyword[p] == keyword.replace("amp;", "")) {
      listFromKeyword.splice(p, 1);
    }
  }
  $(".showAlbums").append(
    `<h2>Select a subgenre to sort by that subgenre</h2><ul class="subGenres"></ul><h2 class="allAlbums">Albums</h2><p class="instructions">Click an albums title to open that album in Spotify</p>`
  );

  for (k = 0; k < listFromKeyword.length; k++) {
    $(".subGenres").append(`<li class="sub">${listFromKeyword[k]}</li>`);
  }

  $(".subGenres").on("click", ".sub", function(event) {
    albumCount = 0;
    postedAlbums = [];
    $(".genreDiv").remove();
    generateAlbumsElement($(this).html());
  });

  listFromKeyword.push(keyword);
  console.log(listFromKeyword);

  for (m = 0; m < listFromKeyword.length; m++) {
    generateAlbumsElement(listFromKeyword[m]);
  }

  if (albumCount == 0) {
    $(".showAlbums").append(`<p class="noResults">No results</p>`);
  }
}

function generateAlbumsElement(genreTerm = "yacht rock") {
  const re = new RegExp(genreTerm.replace("amp;", ""));
  console.log(re);
  console.log(genreTerm);
  let genreClassO = genreTerm.replace("&amp;", "&");
  let genreClassA = genreClassO.replace("&", "n");
  let genreCLassF = genreClassA.replace(/ /g, "-");
  let genreClass = genreCLassF.replace("'", "");
  console.log(genreClass);
  $(".showAlbums").append(
    `<div class="genreDiv">
            <h3 class="genreName">${genreTerm}</h3>
            <div class="${genreClass} albumElements"></div>
        </div>`
  );
  for (i = 0; i < albumDatabase.length; i++) {
    for (j = 0; j < albumDatabase[i].albums.length; j++) {
      for (x = 0; x < albumDatabase[i].albums[j].genres.length; x++) {
        if (albumDatabase[i].albums[j].genres[x].search(re) > -1) {
          if (postedAlbums.indexOf(albumDatabase[i].albums[j].id) == -1) {
            $(`.${genreClass}`).append(
              `<div class="albumElement">
                            <img src="${albumDatabase[i].albums[j].images[1].url}" alt="${albumDatabase[i].albums[j].name} by ${albumDatabase[i].albums[j].artists[0].name}">
                            <a class="album" href="${albumDatabase[i].albums[j].uri}">${albumDatabase[i].albums[j].name}</a>
                            <p class="artist">${albumDatabase[i].albums[j].artists[0].name}</p>
                            </div>`
            );
            albumCount++;
            postedAlbums.push(albumDatabase[i].albums[j].id);
          }
        }
      }
    }
  }
}

async function createInitialDatabase() {
  startButton();
  await getToken();
  const start = await getIds(url);
  const idStrings = await createIdArray(start);
  const dataB = await createAlbumDatabase(idStrings);
  const artistStrings = createArtistStrings(dataB);
  const artistGenres = await getArtists(artistStrings);
  const finalDatabase = addGenreData(artistGenres);
  createGenreList();
}

function startButton() {
  $(".loading").on("click", "button", function(event) {
    displayGenreKeywords();
  });
}

$(createInitialDatabase);
