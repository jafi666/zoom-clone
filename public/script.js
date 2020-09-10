const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
  path: '/peer',
  host: '/',
  port: '3030'
});
const peers = {};
const text = $('input');

let myVideStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideStream = stream;
  addVideoStream(myVideo, stream);

  peer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
  });

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });

});

socket.on('user-message', (userId, message) => {
  console.log(userId, message);
  $('.messages').append(`<li class=message><b>${userId}</b><br />${message}</li>`);
  scrollToBottom();
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

peer.on('open', userId => {
  socket.emit('join-room', ROOM_ID, userId);

  $('html').keydown((e) => {
    if (e.which == 13 && text.val().length > 0) {
      socket.emit('message', userId, text.val());
      text.val('');
    }
  });
});

const connectToNewUser = (userId, stream) => {
  console.log('new user', userId);
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });
  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
};

const scrollToBottom = () => {
  const d = $('.main__chat__window');
  d.scrollTop(d.prop('scrollHeight'));
}

const muteUnmute = () => {
  const enabled = myVideStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideStream.getAudioTracks()[0].enabled = false;
    setUnmute();
  } else {
    myVideStream.getAudioTracks()[0].enabled = true;
    setMute();
  }
};

const setMute = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector('.main__mute__button').innerHTML = html;
};

const setUnmute = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector('.main__mute__button').innerHTML = html;
};


const playStop = () => {
  const enabled = myVideStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector('.main__video__button').innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;

  document.querySelector('.main__video__button').innerHTML = html;
};