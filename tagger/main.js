/*******************
* Global Variables *
*******************/

var loadedVideos = {};
var loadedSubtitles = {};

var taggedData = {
    "time" : [],
    "text" : [],
    "character_emotion" : [],
    "viewer_emotion" : []
};

/*********
* Events *
*********/

window.onload = function ()
{
    document.getElementById ("read-video-button").addEventListener ("click", ClickReadVideoButton);
    document.getElementById ("read-subtitles-button").addEventListener ("click", ClickReadSubtitlesButton);

    document.getElementById ("video-file-input").addEventListener ("change", ChangeVideoFileInput);
    document.getElementById ("subtitles-file-input").addEventListener ("change", ChangeSubtitlesFileInput);

    document.getElementById ("save-csv-button").addEventListener ("click", ClickSaveCSVButton);
};

function ClickReadVideoButton ()
{
    document.getElementById ("video-file-input").click ();
}

function ClickReadSubtitlesButton ()
{
    document.getElementById ("subtitles-file-input").click ();
}

// Fires when select file
function ChangeVideoFileInput (fileInput)
{
    document.getElementById ("video-file-name").value = fileInput.target.files[0].name;

    let video = document.getElementById ("video-play");
    let fileURL = URL.createObjectURL (fileInput.target.files[0]);

    video.src = fileURL;
    video.play ();
}

// Fires when select file
function ChangeSubtitlesFileInput (fileInput)
{
    let file = fileInput.target.files[0];

    document.getElementById ("subtitles-file-name").value = file.name;

    let reader = new FileReader ();
    reader.onload = function (event) {
        let vtt = ParseVTT (event.target.result);

        let video = document.getElementById ("video-play");
        let track = video.addTextTrack ("subtitles", "Subtitles");

        taggedData["time"] = [];
        taggedData["text"] = [];
        taggedData["character_emotion"] = [];
        taggedData["viewer_emotion"] = [];

        for (cue of vtt)
        {
            taggedData["time"].push (cue["start_time"]);
            taggedData["text"].push (cue["text"]);
            taggedData["character_emotion"].push (null);
            taggedData["viewer_emotion"].push (null);

            track.addCue (new VTTCue (cue["start_time"], cue["end_time"], cue["text"]));
        }

        track.mode = "showing";

        DisplayData (taggedData);
    };

    reader.readAsText (file);
}

function ClickEmotionButton (category, emotion)
{
    let video = document.getElementById ("video-play");
    
    if (video.ended)
    {
        return;
    }

    let active = video.textTracks[0].activeCues[0];
    
    if (!active)
    {
        return;
    }

    for (let i = 0; i < taggedData["text"].length; i++)
    {
        if (taggedData["text"][i] === active.text)
        {
            taggedData[category][i] = emotion;
            DisplayData (taggedData);
            
            break;
        }
    }
}

function ClickSaveCSVButton ()
{
    let csv = ToCSV (taggedData);

    let link = document.getElementById ("csv-file-download");
    link.setAttribute ("href", encodeURI ("data:text/csv;charset=utf-8," + csv));
    link.setAttribute ("download", document.getElementById ("csv-file-name").value + ".csv");

    link.click ();
}

function ClickTableText (time)
{
    let video = document.getElementById ("video-play");
    video.currentTime = time;
}

/************
* Functions *
************/

function ParseVTT (text)
{
    // Split text by cue
    let parsed = text.split ("\n\n").slice (1);
    // Split cues by info
    parsed = parsed.map (cue => { return cue.split ('\n').slice (1); });

    // Merge text in cues
    parsed = parsed.map (cue => { return [cue[0], cue.slice (1).map (t => t.trim ()).join (' ')]; });
    // Filter cue has invalid text
    parsed = parsed.filter (cue => cue[1] && (cue[1] !== "&nbsp;"));

    // Convert time text to number
    parsed.forEach(cue => {
        // Split start time and end time
        let splits = cue[0].split ("-->");
        // Convert text to seconds
        cue[0] = splits.map (text => Text2Seconds (text));
    });

    let result = [];

    parsed.forEach (cue => {
        let startTime = cue[0][0];
        let endTime = cue[0][1];

        // Split text by character
        let splits = cue[1].split ('-').filter (text => text);

        for (split of splits)
        {
            result.push ({"start_time" : startTime, "end_time" : endTime, "text" : split});
        }
    });

    return result;
}

function Text2Seconds (text)
{
    let result = 0;

    text = text.trim ();
    text.split (":").reverse ().forEach ((val, i) => {
        result += Number (val) * Math.pow (60, i);
    });

    return result;
}

function ToCSV (data)
{
    let count = data["time"].length;
    let content = "time, text, character_emotion, viewer_emotion\n";

    for (let i = 0; i < count; i++)
    {
        content += data["time"][i];
        content += "," + data["text"][i];
        content += "," + (!data["character_emotion"][i] ? "" : data["character_emotion"][i]);
        content += "," + (!data["viewer_emotion"][i] ? "" : data["viewer_emotion"][i]);
        content += "\n";
    }

    return content;
}

function DisplayData (data)
{
    let table = document.getElementById ("data-table");

    while (table.firstChild)
    {
        table.removeChild (table.firstChild);
    }

    let dataCount = data["time"].length;

    for (let i = 0; i < dataCount; i++)
    {
        let time = document.createElement ("td");
        time.innerHTML = Seconds2Text (data["time"][i]);

        let text = document.createElement ("td");
        text.innerHTML = (data["text"][i]);
        text.onclick = function () {ClickTableText (data["time"][i])};

        let characterEmotion = document.createElement ("td");
        characterEmotion.innerHTML = (data["character_emotion"][i] === null ? "" : Capitalize (data["character_emotion"][i]));

        let viewerEmotion = document.createElement ("td");
        viewerEmotion.innerHTML = (data["viewer_emotion"][i] === null ? "" : Capitalize (data["viewer_emotion"][i]));

        let row = document.createElement ("tr");
        row.appendChild (time);
        row.appendChild (text);
        row.appendChild (characterEmotion);
        row.appendChild (viewerEmotion);

        table.appendChild (row);
    }
}

function IsCueTextValid (cue)
{
    let text = cue.text;
    return (text !== undefined && text !== null && text !== '' && text !== "&nbsp;");
}

function MergeLines (cue)
{
    cue.text = cue.text.split ('\n').join (' ');
}

function Seconds2Text (time)
{
    time = Math.round (Number (time));

    let hours = Math.floor (time / 3600);
    let minuetes = Math.floor (time / 60 % 60);
    let seconds = Math.floor (time % 3600 % 60);

    return hours + "시간" + minuetes + "분" + seconds + "초";
}

function Capitalize (word)
{
    return word[0].toUpperCase () + word.substr (1);
}