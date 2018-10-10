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
            node.innerHTML = name;

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
                    let preprocessing = preprocessings ? preprocessings[name] : null;

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
        this.categories = this.GetDefaultCategories ();
        this.view = null;
    }

    UpdateView ()
    {
        if (!this.view)
        {
            throw "View is not assigned.";
        }

        while (this.view.firstChild)
        {
            this.view.removeChild (this.view.firstChild);
        }

        for (let categoryName in this.categories)
        {
            let row = document.createElement ("div");
            row.setAttribute ("class", "row py-2 no-gutters");
            row.style.maxWidth = "100%";
            
            this.view.appendChild (row);

            let header = document.createElement ("h3");
            header.setAttribute ("class", "col-12");
            header.innerHTML = categoryName;

            row.appendChild (header);

            let group = document.createElement ("div");
            group.setAttribute ("class", "btn-group btn-group-sm");
            group.setAttribute ("role", "group");

            row.appendChild (group);

            for (let info of this.categories[categoryName])
            {
                let button = document.createElement ("button");
                button.setAttribute ("type", "button");
                button.setAttribute ("class", "btn");
                button.innerHTML = info["element"];
                button.style.color = "white";
                button.style.backgroundColor = info["color"];
                button.onclick = function () { ClickEmotionButton (categoryName, info["element"]); };

                group.appendChild (button);
            }
        }
    }

    AddCategory (name, elements)
    {
        this.categories[name] = [];
        dataset.PushCategory (name);
        
        for (let element of elements)
        {
            this.categories[name].push ({"element" : element, "color" : "#6c757d"});
        }

        console.log (dataset);

        this.UpdateView ();
        table.ClearTable ();
        table.Show (dataset);
    }

    RemoveCategory ()
    {
        throw "Not implemented.";
    }

    EditCategory ()
    {
        throw "Not implemented.";
    }

    GetDefaultCategories ()
    {
        return {
            "character_emotion" : [{"element" : "happy", "color" : "#43a047"}, {"element" : "anticipation", "color" : "#43a047"},
                                    {"element" : "trust", "color" : "#43a047"}, {"element" : "surprise", "color" : "#ffa000"}, 
                                    {"element" : "sad", "color" : "#d32f2f"}, {"element" : "anger", "color" : "#d32f2f"},
                                    {"element" : "disgust", "color" : "#d32f2f"}, {"element" : "fear", "color" : "#d32f2f"},
                                    {"element" : "nuetral", "color" : "#6c757d"}],
            "viewer_emotion" : [{"element" : "happy", "color" : "#43a047"}, {"element" : "anticipation", "color" : "#43a047"},
                                    {"element" : "trust", "color" : "#43a047"}, {"element" : "surprise", "color" : "#ffa000"}, 
                                    {"element" : "sad", "color" : "#d32f2f"}, {"element" : "anger", "color" : "#d32f2f"},
                                    {"element" : "disgust", "color" : "#d32f2f"}, {"element" : "fear", "color" : "#d32f2f"},
                                    {"element" : "nuetral", "color" : "#6c757d"}]
        };
    }
}

/*******************
* Global Variables *
*******************/

var loadedVideos = {};
var loadedSubtitles = {};

var tagger = new Tagger ();
var dataset = new Dataset ();
var table = new BootstrapTable ();

// test
var fileType;
var files = {};

/**********
* Program *
**********/

window.onload = () =>
{
    tagger.view = document.getElementById ("categories-view");
    tagger.UpdateView ();

    table.SetTableId ("data-table");

    document.getElementById ("video-file-modal-button").onclick = () =>
    {
        let modal = document.getElementById ("file-input-modal");
        modal.querySelector (".modal-title").innerHTML = "Load video file";

        fileType = "video";
    };

    document.getElementById ("subtitles-file-modal-button").onclick = () =>
    {
        let modal = document.getElementById ("file-input-modal");
        modal.querySelector (".modal-title").innerHTML = "Load subtitles file";

        fileType = "subtitles";
    };

    document.getElementById ("local-file-browse-button").onclick = () =>
    {
        document.getElementById ("local-file-input").click ();
    };

    document.getElementById ("local-file-input").onchange = (event) =>
    {
        document.getElementById ("local-file-name").value = event.target.files[0].name;
    }

    document.getElementById ("local-file-upload-button").onclick = () =>
    {
        let file = document.getElementById ("local-file-input").files[0];

        if (fileType === "video")
        {
            let video = document.getElementById ("video-play");
            video.src = URL.createObjectURL (file);
            video.play ();
        }
        else if (fileType === "subtitles")
        {
            let reader = new FileReader ();

            reader.onload = (event) =>
            {
                let vtt = ParseVTT (event.target.result);

                let video = document.getElementById ("video-play");

                if (video.textTracks.length > 0)
                {
                    video.textTracks[video.textTracks.length - 1].mode = "disabled";
                }

                let track = video.addTextTrack ("subtitles", "Subtitles");

                dataset = new Dataset ();
                dataset.PushCategory ("time");
                dataset.PushCategory ("text");
                
                for (let categoryName in tagger.categories)
                {
                    dataset.PushCategory (categoryName);
                }

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
    };

    document.getElementById ("save-dataset-button").onclick = () =>
    {
        let download = document.getElementById ("save-file-download");
        download.setAttribute ("href", encodeURI ("data:text/csv;charset=utf-8," + dataset.ToCSV ()));
        download.setAttribute ("download", document.getElementById ("save-file-name").value + ".csv");
        download.click ();
    }

    document.getElementById ("add-category-button").onclick = () =>
    {
        tagger.AddCategory ("test", ["elem1", "elem2", "elem3"]);
    };

    document.getElementById ("remove-category-button").onclick = () =>
    {

    };

    document.getElementById ("edit-category-button").onclick = () =>
    {

    };
};

function ClickEmotionButton (category, emotion)
{
    let video = document.getElementById ("video-play");
    
    if (video.ended || (video.textTracks.length <= 0))
    {
        return;
    }

    let active = video.textTracks[video.textTracks.length - 1].activeCues[0];
    
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

function Seconds2Text (time)
{
    time = Math.round (Number (time));

    let hours = Math.floor (time / 3600);
    let minuetes = Math.floor (time / 60 % 60);
    let seconds = Math.floor (time % 3600 % 60);

    return hours + "시간" + minuetes + "분" + seconds + "초";
}