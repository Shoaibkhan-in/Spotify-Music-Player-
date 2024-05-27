
let songs;
let currentSong = new Audio();
let currFolder;

function secondsToMinuteSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00 ";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');


    return `${formattedMinutes}:${formattedSeconds}`
}

async function getSongs(folder) {
    currFolder=folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Play the first song of the playlist
    
    //show all the songs in the playlist

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML=""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
    <img class="invert" src="img/music.svg" alt="">
    <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div>Song Artist</div>
    </div>
    <div class="playnow">
        <span>Play Now</span>
    <img class="invert" src="img/play.svg" alt="">
</div>
</li>`;
    }

    // attach an event listener to each song


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    //let audio = new Audio("/songs/"+track)
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-1)[0]
            
            //get the meta data of the folder 
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div> `

        }
    }
    //load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })


}





async function main() {


    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums();

    // attach an event listener to play, next or previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for time update events 
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinuteSeconds(currentSong.currentTime)} / ${secondsToMinuteSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    //add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    //Add event listener for closing hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add an event listener to previous and next buttons

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0)
            playMusic(songs[index - 1])
    })

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length)
            playMusic(songs[index + 1])
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })


    document.querySelector(".volume>img").addEventListener("click", e=>{
    if(e.target.src.includes("img/volume.svg")){
        e.target.src=e.target.src.replace("img/volume.svg", "img/mute.svg")
        currentSong.volume=0;
        document.querySelector(".range").getElementsByTagName("input")[0].value=0
    }
    else{
        e.target.src=e.target.src.replace("img/mute.svg", "img/volume.svg")
        currentSong.volume=.40;
        document.querySelector(".range").getElementsByTagName("input")[0].value=40
    }

    })
    
}

main()