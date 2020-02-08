const url = "https://api.spotify.com/v1/search?q=tag%3Anew&type=album&limit=50";
let bearer = "";
let idList = [];
let idArray = [];
let albumDatabase = [];
let artistDatabase = {};
let genreList = [];
let postedAlbums = [];

function getIds(url) {
    //console.log('getIds GO');
    return new Promise((resolve, reject) => fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': bearer
        }
    }).then(response => {
        //console.log('getIds 1st response GO');
        
        if (response.status !== 200) {
            if (response.status == 404 || 401) {
                resolve(idList);
            }
            else {
                throw `${response.status}: ${response.statusText}`;
            }
            //throw `${response.status}: ${response.statusText}`;
        }
        const r = response.json();
        //console.log(r);
        return r;
    }).then(responseJson => {
        //console.log('getIds 2nd response GO');
        //let idList = [];
        for (let i=0; i<responseJson.albums.items.length; i++) {
            if (responseJson.albums.items[i] == null) {
                let z = 0;
            }
            else {idList.push(responseJson.albums.items[i].id)};
        }
        //console.log(database);
        if (responseJson.albums.next !== null) {
            console.log(responseJson.albums.next);
            resolve(getIds(responseJson.albums.next));
            //resolve();
        } else {
            resolve(idList);
        }
        //resolve(idList);
    }));
}



function createIdArray(idList) {
    return new Promise((resolve, reject) => {
    //console.log('createIdArray GO');
    let count = 0;
    let idString = "";
    for (i = 0; i<idList.length; i++) {
        if (count == 19) {
            idString += `${idList[i]}`;
            idArray.push(idString);
            count = 0;
            idString = "";
        }
        else {
            idString += `${idList[i]},`;
            count ++;
        }
    }
    //console.log(idArray);
    resolve(idArray);
})
}

function createAlbumDatabase(idArray, count = 0) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.spotify.com/v1/albums?ids=${idArray[count]}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': bearer
            }
        }).then(response => {
            const r = response.json();
            console.log(r);
            return r;
        }).then(response => {
            albumDatabase.push(response);
            count++;
            if (count < idArray.length) {
                resolve(createAlbumDatabase(idArray, count));
            }
            else {
                resolve(albumDatabase);
            }
        })
    })
    
}

function createArtistStrings(data) {
    let strArr = [];
    let artStr = '';
    let count = 0;
    //let tot = 0;
    console.log(data[0].albums[0].artists[0].id);
    for (i=0; i<data.length; i++) {
        //console.log('go');
        //tot ++;
        //console.log(tot);
        for (j=0; j<data[i].albums.length; j++) {
            //console.log('Go');
            //console.log(data[i].albums[j].artists);
            //console.log(data[i].albums[j]);
            //console.log(`i=${i} and j=${j}`);
            if (data[i].albums[j] === null) {
                let poiuoipu = 0;
            }
            else {
            for (const artist in data[i].albums[j].artists) {
                //console.log('GO!');
                if (count == 49) {
                    artStr += `${data[i].albums[j].artists[artist].id}`;
                    //console.log(artStr);
                    strArr.push(artStr);
                    artStr = '';
                    count = 0;
                }
                else {
                    artStr += `${data[i].albums[j].artists[artist].id},`;
                    //console.log(artStr);
                    count ++;
                    //console.log(count);
                }
            }}
        }
    }
    console.log(strArr);
    return strArr;
}

function getArtists(data, count = 0) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.spotify.com/v1/artists?ids=${data[count]}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': bearer
            }
        }).then(response => {
            const r =response.json();
            console.log(r);
            //resolve(r);
            return r;
        }).then(response => {
            //console.log(`${response.artists[0].name}`);
            for (i=0; i<response.artists.length; i++) {
                //console.log(response.artists[i].name);
                if (artistDatabase.hasOwnProperty(`${response.artists[i].name}`)) {
                    let fdsjhf = 0;
                }
                else {
                    artistDatabase[`${response.artists[i].name}`] = response.artists[i].genres;
                }
            }
            count ++;
            if (count < data.length) {
                resolve(getArtists(data, count));
            }
            else {
                resolve(artistDatabase);
            }
        })
    })
}

function addGenreData(genreList) {
    console.log('addGenreData Go!');
    console.log(albumDatabase[0].albums[0].genres);
    for (let i=0; i<albumDatabase.length; i++) {
        //console.log(albumDatabase[i]);
        //console.log(albumDatabase[i].albums.length);
        for (let j=0; j<albumDatabase[i].albums.length; j++) {
            //console.log(albumDatabase[i].albums[j].artists);
            for (const artist in albumDatabase[i].albums[j].artists) {
                //console.log(albumDatabase[i].albums[j].artists[artist].name);
                albumDatabase[i].albums[j].genres.push(`${genreList[`${albumDatabase[i].albums[j].artists[artist].name}`]}`);
            }
        }
    }
    return albumDatabase;
}

function createGenreList() {
    for (const artist in artistDatabase) {
        for (j=0; j<artistDatabase[artist].length; j++) {
            if (genreList.includes(artistDatabase[artist][j]) == false) {
                genreList.push(artistDatabase[artist][j]);
            }
        }
    }
}

function getToken() {
    const data = {grant_type: "client_credentials"};
    return new Promise((resolve, reject) => {
        fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic NWYxNmE2ZjZjZTA2NDBmZTllNTVhNTQ5NTNiOGJlNzY6YWEzMmNhZTEzZjI3NGRjMGE1YWZlNWVmOTVmYWUzYmM="
            },
            body: new URLSearchParams(data)
        }).then(res=>res.json())
        .then(res=>{
            bearer = 'Bearer ' + res.access_token;
          }).then(res=> {
              resolve(bearer);
          })
    })
}

function displayGenreKeywords() {
    /*
    Display list of genre keywords.
    On click, executes displayAlbums with that keyword as input.
    */
   $('.loading').hide();
   $('.keyGenres').append(`<h1>Please select a genre keyword below</h1>`);
   const keywords = ['hip hop', 'r&b', 'rap', 'pop', 'dance', 'edm', 'rock', 'indie', 'metal', 'punk', 'folk', 'country', 'christian', 'electronic', 'reggaeton', 'latin', 'classical', 'alternative', 'trap']
   for (i=0; i<keywords.length; i++) {
       $('.keyGenres').append(
           `<li class="key">${keywords[i]}</li>`
       );
   }
   $('.keyGenres').on('click', '.key', function(event) {
       postedAlbums = [];
       $('.showAlbums').empty();
       displayAlbums($(this).html());
   })
}

function displayAlbums(keyword = 'rock') {
    /*
    Sort through genre list with keyword, create list of genres that have that keyword.
    For each genre in list, executes generateAlbumsElement using that genreTerm.
    Make sure to eliminate doubles.
    Displays all album elements that were generated.
    */
   const re = new RegExp(keyword);
   let listFromKeyword = [];
   for (i=0; i<genreList.length; i++) {
       if (genreList[i].search(re) > -1) {
           listFromKeyword.push(genreList[i]);
       }
   }
   for (p=0; p<listFromKeyword.length; p++) {
       if (listFromKeyword[p] == keyword) {
           listFromKeyword.splice(p, 1);
       }
   }
   $('.showAlbums').append(
       `<h2>Select a subgenre to sort by that subgenre</h2>`
   );
   listFromKeyword.push(keyword);
   console.log(listFromKeyword);
   
   for (m=0; m<listFromKeyword.length; m++) {
       generateAlbumsElement(listFromKeyword[m]);
       
   }
   
}

function generateAlbumsElement(genreTerm = 'yacht rock') {
    /*
    Search through albumDatabase for albums with genreTerm.
    Create HTML element that displays genreTerm as header with albums and links below.
    */
    const re = new RegExp(genreTerm);
    let genreClassA = genreTerm.replace('&', 'n');
    let genreCLassF = genreClassA.replace(' ', '-');
    let genreClass = genreCLassF.replace(' ', '-');
    console.log(genreClass);
    $('.showAlbums').append(
        `<div class="genreDiv ${genreClass}">
            <h2 class="genreName">${genreTerm}</h2>
        </div>`
    )
    for (i=0; i<albumDatabase.length; i++) {
        for (j=0; j<albumDatabase[i].albums.length; j++) {
            for (x=0; x<albumDatabase[i].albums[j].genres.length; x++) {
                //console.log(albumDatabase[i].albums[j].genres[x]);
                if (albumDatabase[i].albums[j].genres[x].search(re) > -1) {
                    //console.log(albumDatabase[i].albums[j].name);
                    //const id = new RegExp(albumDatabase[i].albums[j].id);
                    if (postedAlbums.indexOf(albumDatabase[i].albums[j].id) == -1) {
                        $(`.${genreClass}`).append(
                            `<img src="${albumDatabase[i].albums[j].images[1].url}">
                            <a class="album" href="${albumDatabase[i].albums[j].uri}">${albumDatabase[i].albums[j].name}</a>
                            <p class="artist">${albumDatabase[i].albums[j].artists[0].name}</p>`
                        );
                        postedAlbums.push(albumDatabase[i].albums[j].id);
                    }
                    
                }
            }
        }
    }
    //console.log(postedAlbums);
}

function clickSubGenre() {
    $('.showAlbums').on('click', '.genreName', function(event) {
        postedAlbums = [];
        $('.showAlbums').empty();
        generateAlbumsElement($(this).html());
    })
}

async function createInitialDatabase() {
    await getToken();
    const start = await getIds(url);
    const idStrings = await createIdArray(start);
    const dataB = await createAlbumDatabase(idStrings);
    console.log(dataB);
    const artistStrings = createArtistStrings(dataB);
    console.log(artistStrings);
    const artistGenres = await getArtists(artistStrings);
    console.log(artistGenres);
    const finalDatabase = addGenreData(artistGenres);
    console.log(finalDatabase);
    createGenreList();
    console.log(genreList);
    displayGenreKeywords();
    clickSubGenre();
    //displayAlbums();
    //generateAlbumsElement();

    
}

$(createInitialDatabase);