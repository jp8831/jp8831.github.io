/**********
* Classes *
**********/

class Dataset
{
    constructor ()
    {
        this.categories = [];
        this.list = [];
    }

    Push ()
    {
        if (arguments.length <= 0)
        {
            throw "No element to add.";
        }

        if (arguments.length > this.categories.length)
        {
            throw "Elements are more than categories.";
        }

        let element = {};

        for (let i = 0; i < arguments.length; i++)
        {
            element[this.categories[i]] = arguments[i];
        }

        this.list.push (element);
    }
    
    Pop ()
    {
        if (this.list.length <= 0)
        {
            return null;
        }

        return this.list.pop ();
    }

    Count ()
    {
        return this.list.length;
    }

    At (index)
    {
        if (index < 0 || index >= this.list.length)
        {
            throw "Index is out of range.";
        }

        return this.list[index];
    }

    PushCategory (category)
    {
        if (category in this.categories)
        {
            throw "Category is already exists.";
        }

        this.categories.push (category);
    }

    RemoveCategory (category)
    {
        if (!(category in this.categories))
        {
            throw "Category is not exists.";
        }

        this.categories.splice (this.categories.indexOf (category));

        for (let element of this.list)
        {
            delete element[category];
        }
    }

    CountCategories ()
    {
        return this.categories.count;
    }

    Select ()
    {}

    Filter ()
    {}

    ToCSV ()
    {
        let csv = this.categories.join (",") + "\n";

        for (let element of this.list)
        {
            for (let category of this.categories)
            {
                if (this.categories.indexOf (category) > 0)
                {
                    csv += ",";
                }

                csv += (!element[category] ? "" : element[category]);
            }

            csv += "\n";
        }

        return csv;
    }
}

class BootstrapTable
{
    constructor ()
    {
        this.id;
        this.headers = [];
    }

    Show (dataset, preprocessings)
    {
        let header = this.GetTableHeader ();
        let headerRow = header.querySelector ("tr");

        if (!headerRow)
        {
            headerRow = document.createElement ("tr");
            header.appendChild (headerRow);
        }

        this.headers = dataset.categories;

        for (let name of this.headers)
        {
            let node = document.createElement ("th");
            node.setAttribute ("scope", "col");
            node.innerHTML = Capitalize (name);

            headerRow.appendChild (node);
        }

        let body = this.GetTableBody ();

        for (let element of dataset.list)
        {
            let rowNode = document.createElement ("tr");

            for (let name of this.headers)
            {
                let node = document.createElement ("td");

                if (name in element)
                {
                    let value = element[name];
                    let preprocessing = preprocessings[name];

                    node.innerHTML = !value ? "" : (!preprocessing ? value : preprocessing (value)); 
                }

                rowNode.appendChild (node);
            }

            body.appendChild (rowNode);
        }
    }

    AddEventListenerAt (index, header, eventName, listener)
    {
        if (!header in this.headers)
        {
            throw "No such header \"{}\"".format (header);
        }

        let rows = this.GetTableBody ().querySelectorAll ("tr");

        if (index >= rows.length || rows.length <= 0)
        {
            throw "Index is out of range.";
        }

        let target = rows[index].querySelectorAll ("td")[this.headers.indexOf (header)];
        target.addEventListener (eventName, listener);
    }

    Change (index, header, value)
    {
        if (!header in this.headers)
        {
            throw "Header not exists.";
        }

        let contents = this.GetTableBody ().querySelectorAll ("tr");

        if (contents.length <= 0)
        {
            return;
        }

        contents[index].childNodes[this.headers.indexOf (header)].innerHTML = value;
    }

    ClearTable ()
    {
        if (this.header)
        {
            while (this.header.firstChild)
            {
                this.header.removeChild (this.header.firstChild);
            }
        }

        if (this.body)
        {
            while (this.body.firstChild)
            {
                this.body.removeChild (this.body.firstChild);
            }
        }
    }

    SetTableId (id)
    {
        if (this.id)
        {
            throw "Table id is already assigned.";
        }

        this.id = id;
        this.table = document.getElementById (id);

        if (!this.table)
        {
            throw "Getting table is failed.";
        }
    }

    GetTableHeader ()
    {
        if (!this.table)
        {
            throw "No table";
        }

        if (!this.header)
        {
            let header = this.table.querySelector ("thead");

            if (!header)
            {
                header = document.createElement ("thead");
                this.table.appendChild (header);
            }

            this.header = header;
        }

        return this.header;
    }

    GetTableBody ()
    {
        if (!this.table)
        {
            throw "No table";
        }

        if (!this.body)
        {
            let body = this.table.querySelector ("tbody");

            if (!body)
            {
                body = document.createElement ("tbody");
                this.table.appendChild (body);
            }

            this.body = body;
        }

        return this.body;
    }
}

class Tagger
{
    constructor ()
    {
        
    }
}

/*******************
* Global Variables *
*******************/

var loadedVideos = {};
var loadedSubtitles = {};

var dataset = new Dataset ();
var table = new BootstrapTable ();


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

    table.SetTableId ("data-table");
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

        dataset = new Dataset ();
        dataset.PushCategory ("time");
        dataset.PushCategory ("text");
        dataset.PushCategory ("character_emotion");
        dataset.PushCategory ("viewer_emotion");

        for (let cue of vtt)
        {
            dataset.Push (cue["start_time"], cue["text"]);
            track.addCue (new VTTCue (cue["start_time"], cue["end_time"], cue["text"]));
        }

        track.mode = "showing";

        table.ClearTable ();
        table.Show (dataset, { "time" : Seconds2Text});
        dataset.list.forEach ((value, index) => {
            let whenClick = function () { document.getElementById ("video-play").currentTime = value["time"] };
            table.AddEventListenerAt (index, "text", "click", whenClick);
        });
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

    let trackCount = video.textTracks.length;
    let lastTrack = video.textTracks[trackCount - 1];

    if (trackCount > 1)
    {
        let prevTrack = video.textTracks[trackCount - 2];
        prevTrack.mode = "disabled";
    }
    
    let active = lastTrack.activeCues[0];
    
    if (!active)
    {
        return;
    }

    for (let i = 0; i < dataset.Count (); i++)
    {
        if (dataset.At (i)["text"] === active.text)
        {
            dataset.At (i)[category] = emotion;
            table.Change (i, category, emotion);
            
            break;
        }
    }
}

function ClickSaveCSVButton ()
{
    let csv = dataset.ToCSV ();

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

    parsed.forEach(cue => {
        // Convert time text to seconds
        cue[0] = cue[0].split ("-->").map (text => Text2Seconds (text));
        // Remove ',' in text
        cue[1] = cue[1].replace (/,/g, "");
    });

    let result = [];

    parsed.forEach (cue => {
        let startTime = cue[0][0];
        let endTime = cue[0][1];

        // Split text by character
        let splits = cue[1].split ('-').filter (text => text);

        for (let split of splits)
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