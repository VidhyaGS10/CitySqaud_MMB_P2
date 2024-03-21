let speech;
let input;
let textReply;

let on;
let startButton;
let mic;
let fft;
let amp;
let sound;

let waveform;

let responses = [];

setup = () => {
    createCanvas(displayWidth, displayHeight);
    responses.push("Say hello!");
    textFont("Georgia");
    on = false;
    amp = new p5.Amplitude();
    amp.setInput(mic);

    //////the start button
    startButton = createButton('Click the button to begin')

        .size(400, 60)
        .style('font-size', '20px')
        .style('color', '#F4EAED')
        .style('background-color', "#0C8BB0")
        .style('text-align', 'center')
        .style('transition-duration', '0.4s')
        .style('border', '2px #44C1DB')
        .mouseOver(() => (startButton.style('background-color', "#735D72"), (startButton.style('border', '4px #F4EAED'))))
        .mouseOut(() => (startButton.style('background-color', "#0C8BB0"), (startButton.style('border', '2px #17151D'))))
        .position((windowWidth / 2) - 200, windowHeight / 3, 'relative')
        .mousePressed(turnOn);

      let bot = new RiveScript();
    
      speech = new p5.Speech(voiceReady); // speech synthesis object
      speech.onLoad = voicesLoaded;
      function voiceReady(){
        console.log(speechRec.voices);
      }
  
/////connect the rive object to the script files
     
bot.loadFile([
  "./brain/begin.rive",
  "./brain/greeting.rive",
  "./brain/test.rive",
  "./brain/brain.rive"
]).then(loading_done).catch(loading_error);
  
    function loading_done() {
     console.log("Bot has finished loading!");
      // replies must be sorted
      bot.sortReplies();
      // RiveScript remembers user data by their username and can tell
      // multiple users apart.
      let username = "local-user";
      bot.reply(username, "hello").then(function(reply) {
      console.log("The bot says: " , reply);
 
      });
      setTimeout("console.log('pauseBetween')", 2000);
    }
  
    function loading_error(_err, _filename, _lineno) {
    console.log("Error when loading files: " +_err);
    }
 

    //////////// Create a Speech Recognition object with callback
    speechRec = new p5.SpeechRec('en-US', gotSpeech);
    //////////// "Continuous recognition" (as opposed to one time only)
    let continuous = true;
    ///////////// If you want to try partial recognition (faster, less accurate)
    let interimResults = false;
    ///////////// This must come after setting the properties
    speechRec.start(continuous, interimResults);

    function voicesLoaded(){
      speech.listVoices();
      //talk.setVoice('Google US English');
      speech.setVoice('Google US English');
      // talk.setVoice('Google हिन्दी');
      //talk.setVoice('Google 普通话（中国大陆）');
      talkinterrupt = false;
      //talk.speak("What's up");
      speech.setPitch(1.1);
      speech.setRate(0.9);
      speech.speak('Click the button to begin!'); // say something
      
      }
    function gotSpeech(){
      if (speechRec.resultValue){
        input = speechRec.resultString;
        console.log(input);
        reply = bot.reply("local-user", input).then(function(reply) 
        {  
            speech.speak(reply); 
            console.log(reply);
         }
        )
        textReply = bot.reply("local-user", input).then(respond);
        }
      }
    
    
  respond = (response) => {
    responses.push(response);
    responses.splice(0,1); //super important to replace each line of bot text
  }
}
/////////END OF SETUP

mouseClicked = () => {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
  }
}

  turnOn = () => {
    
    on = true;
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT(0.5, 1024); ////(sample accuracy 0.1 - 1.0, size); 
    fft.setInput(mic);
    startButton.style('display', 'none');
}


  
draw = () => {
 background(244,234, 237);
    
 if (on) {
    waveform = fft.waveform();
    level = mic.getLevel();
       
    botVoice();
    botText();
    humanVoice();
    humanText();
      
    }
     //////KEEPS IT SNAPPY IF LEFT RUNNING, PREVENTING MEMORY LEAK?
    spectrum = null;
    waveform = null;
  }
 

humanText = () => { /////HUMAN VOICE

    textSize(60);
    noStroke();
    fill(12,139,176, 100);
    textAlign(CENTER);
    text(input, width/2, height/2);
}

humanVoice = () => {

    ///////HUMAN ELLIPSE
    stroke(200, 50);
    strokeWeight(20);
    fill(12,139,176, 100);
    //draw ellipse in the middle of canvas
    //use value of level for the width and height of ellipse
    ellipse(width / 2, height- height / 3, level * width * 2, level * width * 2);
}

botText = () => {///////BOT VOICE

    textSize(60);
    noStroke();
    fill(115,93,114, 100);
    textAlign(CENTER);
    for (let i = 0; i < responses.length; i++) {
      text(responses[i], width/2, height/3);
  }
}

botVoice =() => { ///////BOT WAVEFORM
    fill(255,192,152,200);
    stroke(115,93,114, 100);
    strokeWeight(20);
    beginShape();
      for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length, 0, width);
        let y = map(waveform[i], -1, 1, height/3, 0);
        vertex(x, y);
    }
    endShape();
}




