const express = require('express');
var path = require("path");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const ytdl = require('ytdl-core');
const BASE_PATH = `https://www.youtube.com/watch?v=`;

const app = express();

function save(id, res) {
  youtubeId = id;
  const url = BASE_PATH + youtubeId;
  const moviepath = path.join(__dirname, '/' + youtubeId + '_video.mp4')
  const audiopath = path.join(__dirname, `/${youtubeId}_audio.wav`)
  const mixvideopath = path.join(__dirname, '/' + youtubeId + '.mp4')

  const audio_ytdl = ytdl(url , {quality:'highestaudio'})
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
//         console.log('TCL: command -> command', command)
      })
      .on('error', (error) => console.log("errrrr", error))
      .on('end', () => { console.log("Conmpale"); res.send(`<p>大変長らくお待たせしました。 => </p><a href='https://ytdl.skota11.repl.co/v/${youtubeId}'>動画</a>`); })
      .run()
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/home.html'))
});

app.get('/v/:id', (req, res) => {
  v_path = path.join(__dirname, '/' + req.params.id + '.mp4');
  if (fs.existsSync(v_path)) {
    res.sendFile(v_path);
  } else {
    res.send("NotFoundVideo");
  }
});

app.get('/s/:id', (req, res) => {
  const Id = req.params.id;
  if(ytdl.validateID(Id)){
   save(Id, res); 
  }else{
    res.send("NotId")
  }
});

app.listen(3000, () => {
  console.log('server started');
});
