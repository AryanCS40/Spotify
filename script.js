console.log("hello world");
let currentsong=new Audio();
let songs;
let currfolder;


function sectominsec(seconds){
    if(isNaN(seconds)|| seconds<0){
        return "00:00"
    }
    const minutes = Math.floor(seconds/60);
    const remainingseconds = Math.floor(seconds%60);

    const formatminutes = String(minutes).padStart(2,'0');
    const formatseconds = String(remainingseconds).padStart(2,'0');

    return `${formatminutes}:${formatseconds}`;
}

async function getsongs(folder)
{
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
     songs =[];
 for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if(element.href.endsWith(".mp3")){
        songs.push(element.href.split(`/${folder}/`)[1])
    }
 }
  // show all the songs in the playlist
    let songUl = document.querySelector(".songslist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
       songUl.innerHTML = songUl.innerHTML + `<li> <i class="fa-solid fa-music"></i> 
                        <div class="info">
                            <div>${song.replaceAll("%20"," ")} </div>      
                        </div>`
                    }


    // Attach event listener to each song
Array.from (document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click",e=> {
        console.log(e.querySelector(".info").firstElementChild.innerHTML)
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
})    
}

const playMusic=(track, pause=false)=>{
    currentsong.src =`/${currfolder}/` + track;
     if(!pause){
        currentsong.play()
         play.src = "pause.svg";
    }
     document.querySelector(".songinfo").innerHTML= decodeURI(track)
     document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}

// display albums function
async function displayAlbums(){
let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let imagecontainer = document.querySelector(".imagecontainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
    if(e.href.includes("/songs")){
    let folder = e.href.split("/").slice(-2)[0]

    // metadata of folders
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
    let response = await a.json();
        imagecontainer.innerHTML = imagecontainer.innerHTML + `<div data-folder = "${folder}" class="cards">
                        <button class="greenbtn">
                            <i class="fa-solid fa-circle-play"></i>
                        </button>
                        <div class="upper">
                            <img src="/songs/${folder}/cover.jpg" alt="cover_image">
                        </div>
                        <div class="lower">
                          <h3>${response.Artist}</h3>                         
                          <p>${response.Description}</p>  
                        </div>                      
                    </div>`
}
}
    //load the playlist
    Array.from(document.getElementsByClassName("cards")).forEach(e=>{
    e.addEventListener("click", async item=>{
         await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]); 
         }
    )
    }
)} 

async function main() {  
    // get all the songs
     await getsongs("songs/ncs");
    playMusic(songs[0], true)

// display all the albums
 await displayAlbums();

//  Attach an event listener to play
play.addEventListener("click", ()=>{
    if(currentsong.paused){
        currentsong.play();
        play.src = "pause.svg";       
    }
    else{
        currentsong.pause()
        play.src = "play.svg";
    }
})

// listen for time update event
currentsong.addEventListener("timeupdate", ()=>{
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${sectominsec(currentsong.currentTime)} / ${sectominsec(currentsong.duration)}`

    document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%";
})
// listener in seekbar
document.querySelector(".seekbar").addEventListener("click", e=>{
    let percent =  (e.offsetX / e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = ((currentsong.duration)*percent)/100;
})
 
// Add event listener on hamburger

 document.querySelector(".menu").addEventListener("click", ()=>{
        document.querySelector(".left").style.left="0";
       
 })
// Add event listener on cross
 document.querySelector(".cross").addEventListener("click", ()=>{
        document.querySelector(".left").style.left="-120%";
    
 })

// Add event listener on previous
previous.addEventListener("click",()=>{
    console.log("previous clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
     if((index-1)>=0){
    playMusic(songs[index-1])
     }
})
// Add event listener on next
next.addEventListener("click",()=>{
    console.log("next clicked")
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if((index+1) < songs.length){
    playMusic(songs[index+1])
    }
})
// add event listener on volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    console.log("Setting volume",e.target.value,"/ 100")
    currentsong.volume = parseInt(e.target.value)/100;
})

}

main();