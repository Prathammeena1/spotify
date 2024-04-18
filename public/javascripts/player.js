const audioPlayer = document.getElementById('audioPlayer');

const customProgressBar = document.querySelector('.currentPositionLineInside'); // Select your custom progress bar element

// Add event listener to update the position of the custom bar when the time updates
audioPlayer.addEventListener('timeupdate', function () {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    document.querySelector('.currentSongTime').innerText = formatTime(currentTime)
    if(duration){
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

window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        playPauseBtn.click()
    }
    if (e.code === 'ArrowRight') {
        skipRight.click()
    }
    if (e.code === 'ArrowLeft') {
        skipLeft.click()
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