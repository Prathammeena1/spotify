const audioPlayer = document.getElementById('audioPlayer');

const customProgressBar = document.querySelector('.currentPositionLineInside'); // Select your custom progress bar element

// Add event listener to update the position of the custom bar when the time updates
audioPlayer.addEventListener('timeupdate', function () {
  const currentTime = audioPlayer.currentTime;
  const duration = audioPlayer.duration;
  document.querySelector('.currentSongTime').innerText = formatTime(currentTime)
  if (duration) {
    document.querySelector('.totalSongTime').innerText = formatTime(duration)
  }
  if (currentTime.toString() === duration.toString()) {
    pause(playPauseBtn)
  }

  // Calculate the percentage of progress
  const progress = (currentTime / duration) * 100;

  // Update the position of the draggable element
  draggableElement.style.left = progress + '%';
  followDot(draggableElement)
  playPause()
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  return formattedTime;
}



// Get draggable element and progress bar elements
// Get draggable element and progress bar elements
const draggableElement = document.getElementById('draggableElement');
const progressBar = document.querySelector('.progressBarOutLine');

// Function to update position
function updatePosition(x) {
  const percentage = draggableElement.style.left
  audioPlayer.currentTime = Number(percentage.slice(0, -1)) * audioPlayer.duration / 100;
}

// Event listener for mouse down on draggable element
draggableElement.addEventListener('mousedown', (e) => {
  e.preventDefault(); // Prevent default dragging behavior
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

// Function to handle mouse move event
function onMouseMove(e) {
  updatePosition(e.pageX);
}

// Function to handle mouse up event
function onMouseUp() {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}





const playPauseBtn = document.getElementById('playPauseBtn');

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    audioPlayer.src = `/stream/${card.dataset.fileName}`;
    audioPlayer.play();
    showDets(card)
    playPause()
    var skipRight = document.querySelector('#skipRight')
    skipRight.addEventListener('click', function () {
      const percentage = Number(draggableElement.style.left.slice(0, -1))
      audioPlayer.currentTime = (percentage + 2) * audioPlayer.duration / 100;
    })

    var skipLeft = document.querySelector('#skipLeft')
    skipLeft.addEventListener('click', function () {
      const percentage = Number(draggableElement.style.left.slice(0, -1))
      audioPlayer.currentTime = (percentage - 2) * audioPlayer.duration / 100;
    })
  })
})



function playPause() {
  playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      play(playPauseBtn)
    } else {
      audioPlayer.pause();
      pause(playPauseBtn)
    }
  });
}

document.addEventListener('keydown', e => {
  const searchSongForPlaylist = document.querySelectorAll('.searchSongForPlaylist input') // Replace 'searchBar' with the actual ID of your search bar input element
  if (document.activeElement !== searchSongForPlaylist[0]) {
    if (e.code === 'Space') {
      if (audioPlayer.paused) {
        audioPlayer.play();
        play(playPauseBtn)
      } else {
        audioPlayer.pause();
        pause(playPauseBtn)
      }
    }
    if (e.code === 'ArrowRight') {
      skipRight.click()
    }
    if (e.code === 'ArrowLeft') {
      skipLeft.click()
    }
  }



})


function showDets(card) {
  document.querySelector('#currentSongImg').src = card.querySelector('.songImg').src
  document.querySelector('#currentSongName').innerText = card.querySelector('.songName').innerText
  document.querySelector('#currentArtistName').innerText = card.querySelector('.artistName').innerText
}

function play(elem) {
  elem.classList.remove('ri-play-fill')
  elem.classList.add('ri-pause-mini-line')
  elem.classList.remove('ml-1')
}
function pause(elem) {
  elem.classList.add('ri-play-fill')
  elem.classList.remove('ri-pause-mini-line')
  elem.classList.add('ml-1')
}



function makeDraggable(element) {
  let isDragging = false;

  // Function to handle mouse down event
  function handleMouseDown(event) {
    isDragging = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  // Function to handle mouse move event
  function handleMouseMove(event) {
    if (!isDragging) return;
    const progressBarRect = element.parentElement.getBoundingClientRect();
    const newPosition = event.clientX - progressBarRect.left - element.offsetWidth / 2;
    const newPositionPercent = Math.min(Math.max(0, newPosition / progressBarRect.width), 1) * 100;
    element.style.left = newPositionPercent + '%';
  }

  // Function to handle mouse up event
  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    followDot(element)
  }

  // Add event listener to the draggable element
  element.addEventListener('mousedown', handleMouseDown);
}

// Make the element draggable within the progress bar
makeDraggable(draggableElement);


function followDot(elem) {
  document.querySelector('.currentPositionLineInside').style.left = -100 + Number(elem.style.left.slice(0, -1)) + '%'
}






function volumeAdjust() {
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePercentage = document.getElementById('volumePercentage');

  volumeSlider.addEventListener('input', function () {
    const volumeValue = volumeSlider.value;
    // Set CSS custom property for value
    volumePercentage.textContent = `${volumeValue}%`;
    volumeSlider.style.setProperty('--value', `${volumeValue}%`); // Divide by 100 to get a value between 0 and 1

    // Set thumb color to transparent if value is 0
    if (volumeValue == 0) {
      volumeSlider.style.setProperty('--thumb-color', 'transparent');
    } else {
      volumeSlider.style.removeProperty('--thumb-color');
    }
    audioPlayer.volume = volumeSlider.value / 100;

  });
  volumeSlider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = 2; // Adjust volume by 1%
      let volumeValue = parseInt(volumeSlider.value);
      if (e.key === 'ArrowUp') {
        volumeValue = Math.min(volumeValue + step, 100);
      } else {
        volumeValue = Math.max(volumeValue - step, 0);
      }
      volumeSlider.value = volumeValue;
      updateVolume(volumeValue);
    }
  });
  function updateVolume(volumeValue) {
    // Here you can update the volume of your audio player
    // For demonstration, I'm logging the volume value
    audioPlayer.volume = volumeValue / 100
  }


  audioPlayer.addEventListener('volumechange', function () {
    const volumeValue = Math.round(audioPlayer.volume * 100); // Convert volume to percentage
    volumeSlider.value = volumeValue;


    volumePercentage.textContent = `${volumeValue}%`;
    volumeSlider.style.setProperty('--value', `${volumeValue}%`); // Divide by 100 to get a value between 0 and 1

    // Set thumb color to transparent if value is 0
    if (volumeValue == 0) {
      volumeSlider.style.setProperty('--thumb-color', 'transparent');
    } else {
      volumeSlider.style.removeProperty('--thumb-color');
    }


  });
}


volumeAdjust()



const homeBtn = document.querySelector('.home')
const homePage = document.querySelector('.showHome')
const playlistPage = document.querySelector('.showPlayListDets')
function offALL() {
  homePage.style.display = 'none'
  playlistPage.style.display = 'none'
}

function showHome() {
  homePage.style.display = 'block'
}

const playlistImage = playlistPage.querySelector('.showPlayListDetsTopLeft img')
const playlistName = playlistPage.querySelector('.showPlayListDetsTopLeftC')
const playlistContent = playlistPage.querySelector('.playlistContent')

function showPlayListDets(playlistId) {
  fetch(`/find/playlist/${playlistId}`).then(raw => raw.json()).then((data) => {
    var noSongClutter = `<div class="w-full h-full flex justify-center items-center min-h-[56vh]">
              <h1 class="text-4xl text-zinc-500">Add some songs <i class="ri-add-line"></i></h1>
            </div>`
    var songClutter = ``


    if (data.music.length == 0) {
      playlistContent.innerHTML = noSongClutter
    } else {
      data.music.forEach((song) => {
        songClutter += `<div data-file-name="${song.audio}" onclick="playSongOfPlaylist(this,event)" class="songs relative bg-gradient-to-bl from-zinc-800 to-zinc-950 p-2 rounded-md flex items-center justify-between my-1">
            <div class="flex items-center gap-2">
              <div class=" h-8 w-8">
                <img class="songImg h-full w-full object-cover"
                src="/uploads/${song.image}"
                alt="">
                </div>
                 <div>
                  <div class="songName text-sm text-zinc-400">
                    ${song.songName}
                    </div>
                    <div class="artistName text-xs capitalize text-zinc-400">${song.artistName}</div>
                  </div>
                    <div>
                      <span class="absolute right-[3%] top-[50%] translate-y-[-50%]" href="/deleteSongFromPlaylist/${playlistId}/${song._id}"><i class="deleteSong ri-delete-bin-line text-zinc-400"></i></a>
                    </div>
                 </div>
                </div>`
      })
      playlistContent.innerHTML = songClutter
    }

    playlistImage.setAttribute('src', `/images/${data.image}`)
    playlistName.innerText = data.name
    playlistName.dataset.playlistId = playlistId
    playlistPage.style.display = 'initial'
  })
}

homeBtn.addEventListener('click', () => {
  offALL()
  showHome()
})

document.querySelectorAll('.playlist').forEach((elem) => {
  elem.addEventListener('click', () => {
    offALL()
    showPlayListDets(elem.dataset.playlistId)
  })
})

function playSongOfPlaylist(card, event) {
  if (event.target.classList.contains('deleteSong')) {

    

  } else {
    audioPlayer.src = `/stream/${card.dataset.fileName}`;
    audioPlayer.play();
    showDets(card)
    playPause()
    play(playPauseBtn)
    var skipRight = document.querySelector('#skipRight')
    skipRight.addEventListener('click', function () {
      const percentage = Number(draggableElement.style.left.slice(0, -1))
      audioPlayer.currentTime = (percentage + 2) * audioPlayer.duration / 100;
    })

    var skipLeft = document.querySelector('#skipLeft')
    skipLeft.addEventListener('click', function () {
      const percentage = Number(draggableElement.style.left.slice(0, -1))
      audioPlayer.currentTime = (percentage - 2) * audioPlayer.duration / 100;
    })
  }

}


const searchSong = (elem) => {
  if (elem.value.trim() !== "") {
    fetch(`/searchSong/${elem.value}`).then(raw => raw.json())
      .then(data => {
        var clutter = ""
        data.songs.forEach(song => {
          clutter += `<div data-file-name="${song.audio}" onclick="play(document.querySelector(' #playPauseBtn'))"
            class="searchedSong relative w-full h-fit mt-2 bg-gradient-to-bl from-zinc-800 to-zinc-950 p-2 rounded-lg flex items-center gap-2 flex-shrink-0">
            <div class="h-[2.5vw] w-[2.5vw] rounded-md overflow-hidden">
              <img src="/uploads/${song.image}" alt="" class="songImg h-full w-full object-cover">
            </div>
            <div>
              <div class="songName text-sm truncate-lines-2">${song.songName}</div>
              <div class="artistName text-zinc-400 text-xs truncate-lines-2">${song.artistName}</div>
            </div>
            <div class="addSong absolute right-[2%] top-[50%] translate-y-[-50%] opacity-0">
              <i data-song-id="${song._id}" onclick="addSongToPlayList(this)" class="ri-add-line text-2xl"></i>
            </div>
          </div>`
        })
        document.querySelector('.showSearchSong').innerHTML = clutter
        playSongFromSearch()
      })
  }
}


function playSongFromSearch() {
  document.querySelectorAll('.searchedSong').forEach(card => {
    card.addEventListener('click', () => {
      audioPlayer.src = `/stream/${card.dataset.fileName}`;
      audioPlayer.play();
      showDets(card)
      playPause()
      var skipRight = document.querySelector('#skipRight')
      skipRight.addEventListener('click', function () {
        const percentage = Number(draggableElement.style.left.slice(0, -1))
        audioPlayer.currentTime = (percentage + 2) * audioPlayer.duration / 100;
      })

      var skipLeft = document.querySelector('#skipLeft')
      skipLeft.addEventListener('click', function () {
        const percentage = Number(draggableElement.style.left.slice(0, -1))
        audioPlayer.currentTime = (percentage - 2) * audioPlayer.duration / 100;
      })
    })
  })
}

function addSongToPlayList(elem) {
  const dataToSend = {
    songId: elem.dataset.songId,
    playlistId: playlistName.dataset.playlistId
  };
  fetch('/addSongToPlaylist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const songDets = data.music[data.music.length - 1]
      console.log(songDets)
      addSongOfPlaylistToUi(songDets, data.music.length)
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });

}




function addSongOfPlaylistToUi(song, length) {

  var songClutter = `<div class="songs bg-gradient-to-bl from-zinc-800 to-zinc-950 p-2 rounded-md flex items-center justify-between my-1">
            <div class="flex items-center gap-2">
              <div class="songImg h-8 w-8">
                <img class="h-full w-full object-cover"
                src=""
                alt="">
                </div>
                <div>
                  <div class="songName text-sm text-zinc-400">
                    song name
                    </div>
                    <div class="artistName text-xs capitalize text-zinc-400">artist name</div>
                    </div>
                    <div>
                      <span class="deleteSong opacity-0"><i class="ri-delete-bin-line text-zinc-400"></i></span>
                      </div>
                      </div>
                      </div>`

  if (length == 0) {
    playlistContent.innerHTML = songClutter
  } else {
    playlistContent.innerHTML += songClutter
  }
}