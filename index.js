const express = require('express');
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const ytdl = require('ytdl-core');
const BASE_PATH = `https://www.youtube.com/watch?v=`;

const app = express();

function save_highest(id, res) {
  youtubeId = id;
  const url = BASE_PATH + youtubeId;
  const moviepath = path.join(__dirname, '/' + youtubeId + '_video.mp4')
  const audiopath = path.join(__dirname, `/${youtubeId}_audio.wav`)
  const mixvideopath = path.join(__dirname, '/' + youtubeId + '_highest.mp4')

  const audio_ytdl = ytdl(url, { quality: 'highestaudio' })
  audio_ytdl.pipe(fs.createWriteStream(`${youtubeId}_audio.wav`));

  const video_ytdl = ytdl(url, { quality: 'highestvideo' })
  video_ytdl.pipe(fs.createWriteStream(`${youtubeId}_video.mp4`));

  video_ytdl.on('end', () => {
    ffmpeg()
      .addInput(moviepath)
      .addInput(audiopath)
      .output(mixvideopath)
      .outputOptions(['-map 0:v', '-map 1:a', '-c:a aac', '-c:v copy'])
      .on('start', (command) => {
        console.log('TCL: command -> command', command)
      })
      .on('error', (error) => console.log("errrrr", error))
      .on('end', () => {
        console.log("Conmpale");
        res.redirect(`/v/${youtubeId}/highest`);
        delate(youtubeId , 1);
      })
      .run()
  });
}
function sleep(waitSec) {
  return new Promise(function(resolve) {
    setTimeout(function() { resolve() }, waitSec);
  });
}
async function delate(id, mode) {
  await sleep(86400000)
  console.log(`Delate,${id}`)
  if (mode == 1) {
    fs.unlinkSync(path.join(__dirname + `/${id}_video.mp4`))
    fs.unlinkSync(path.join(__dirname + `/${id}_audio.wav`))
    fs.unlinkSync(path.join(__dirname + `/${id}_highest.mp4`))
  } else if (mode == 2) {
    fs.unlinkSync(path.join(__dirname + `/${id}_normal.mp4`))
  } else if (mode == 3) {
    fs.unlinkSync(path.join(__dirname + `/${id}_audio.wav`))
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
});
app.get('/v/:id', (req, res) => {
  res.send("Enter the video quality")
});
app.get('/v/:id/:rank', (req, res) => {
  v_path = path.join(__dirname, '/' + req.params.id + '_' + req.params.rank + '.mp4');
  if (fs.existsSync(v_path)) {
    res.sendFile(v_path);
  } else {
    res.send("We couldn't find the video");
  }
});
app.get('/a/:id', (req, res) => {
  a_path = path.join(__dirname, '/' + req.params.id + '_audio.wav');
  if (fs.existsSync(a_path)) {
    res.sendFile(a_path);
  } else {
    res.send("We couldn't find the audio");
  }
})

app.get('/s/:id/highest', (req, res) => {
  const Id = req.params.id;
  if (ytdl.validateID(Id)) {
    save_highest(Id, res);
  } else {
    res.send("NotYouTubeID")
  }
});
app.get('/s/:id/normal', (req, res) => {
  const youtubeId = req.params.id;
  if (ytdl.validateID(youtubeId)) {
    const url = BASE_PATH + youtubeId;
    const video_ytdl = ytdl(url, { quality: 'highest' })
    video_ytdl.pipe(fs.createWriteStream(`${youtubeId}_normal.mp4`));
    video_ytdl.on('end' , () => {
          res.redirect(`/v/${youtubeId}/normal`);
    delate(youtubeId , 2);
    })
  } else {
    res.send("NotYouTubeID")
  }
});
app.get('/s/:id/audio', (req, res) => {
  const youtubeId = req.params.id;
  if (ytdl.validateID(youtubeId)) {
  const url = BASE_PATH + youtubeId;
  const audio_ytdl = ytdl(url, { quality: 'highestaudio' })
  audio_ytdl.pipe(fs.createWriteStream(`${youtubeId}_audio.wav`));

  audio_ytdl.on('end', () => {
    res.redirect(`/a/${youtubeId}`);
    delate(youtubeId , 3);
  })
  }else {
    res.send("NotYouTubeID")
  }
})

app.listen(3000, () => {
  console.log('server started')
});