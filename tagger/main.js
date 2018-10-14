/**********
* Classes *
**********/

class Dataset
{
    constructor ()
    {
        this.columnNames = [];
        this.list = [];
    }

    Push ()
    {
        if (arguments.length <= 0)
        {
            throw "No element to add.";
        }

        if (arguments.length > this.columnNames.length)
        {
            throw "Elements are more than categories.";
        }

        let element = {};

        for (let i = 0; i < arguments.length; i++)
        {
            element[this.columnNames[i]] = arguments[i];
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
        if (category in this.columnNames)
        {
            throw "Category is already exists.";
        }

        this.columnNames.push (category);
    }

    RemoveCategory (category)
    {
        if (!(category in this.columnNames))
        {
            throw "Category is not exists.";
        }

        this.columnNames.splice (this.columnNames.indexOf (category));

        for (let element of this.list)
        {
            delete element[category];
        }
    }

    CountCategories ()
    {
        return this.columnNames.count;
    }

    Select ()
    {}

    Filter ()
    {}

    ToCSV ()
    {
        let csv = this.columnNames.join (",") + "\n";

        for (let element of this.list)
        {
            for (let category of this.columnNames)
            {
                if (this.columnNames.indexOf (category) > 0)
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

class SubtitlesReader
{
    static ReadVTT (text)
    {
        // Replace CRLF to LF
        let parsed = text.replace (/\r\n/g, '\n').split ("\n\n").slice (1);
        // Split cues by info
        parsed = parsed.map (cue => { return cue.split ('\n').slice (1); });
    
        // Merge text in cues
        parsed = parsed.map (cue => { return [cue[0], cue.slice (1).map (t => t.trim ()).join (' ')]; });
        // Filter cue has invalid text
        parsed = parsed.filter (cue => cue[1] && (cue[1] !== "&nbsp;"));
    
        parsed.forEach(cue => {
            // Convert time text to seconds
            cue[0] = cue[0].split ("-->").map ((text) => {
                let seconds = 0;
    
                text.trim ().split (":").reverse ().forEach ((val, i) =>
                {
                    seconds += Number (val) * Math.pow (60, i);
                });
    
                return Math.round ((seconds + Number.EPSILON) * 1000) / 1000;
            });
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
}

class VideoPlayer
{
    constructor (elementId)
    {
        this.element = document.getElementById (elementId);
    }

    Play ()
    {
        if (this.IsPlaying ())
        {
            return;
        }

        this.element.play ();
    }

    PlayFromFile (file)
    {
        this.element.src = URL.createObjectURL (file);
        this.Play ();
    }

    SetPlayTime (time)
    {
        this.element.currentTime = time;
    }

    IsPlaying ()
    {
        return !this.element.paused;
    }

    IsEnded ()
    {
        return this.element.ended;
    }

    AddSubtitlesTrack (name)
    {
        if (this.GetTrackCount () > 0)
        {
            this.GetLastTrack ().mode = "disabled";
        }

        let track = this.element.addTextTrack ("subtitles", name);
        track.mode = "showing";
    }

    AddSubtitlesTrackCue (startTime, endTime, text)
    {
        if (this.GetTrackCount () > 0)
        {
            this.GetLastTrack ().addCue (new VTTCue (startTime, endTime, text));
        }
    }

    GetTrackCount ()
    {
        return this.element.textTracks.length;
    }

    GetLastTrack ()
    {
        return this.element.textTracks[this.element.textTracks.length - 1];
    }
}

class View
{
    constructor (viewElement)
    {
        this.element = viewElement;
    }

    Update () {}

    Clear ()
    {
        while (this.element.firstChild)
        {
            this.element.removeChild (this.element.firstChild);
        }
    }

    AttachTo (parentElement)
    {
        parentElement.appendChild (this.element);
    }
}

class TableHeaderView extends View
{
    constructor (viewElement)
    {
        super (viewElement);
    }

    Update (headerNames)
    {
        this.Clear ();

        let container = document.createElement ("tr");
        this.element.appendChild (container);

        for (let name of headerNames)
        {
            let nameElement = document.createElement ("th");
            nameElement.setAttribute ("scope", "col");
            nameElement.innerHTML = name;
            container.appendChild (nameElement);
        }
    }
}

class TableBodyView extends View
{
    constructor (viewElement)
    {
        super (viewElement);
    }

    Update (headerNames, dataList)
    {
        this.Clear ();

        for (let data of dataList)
        {
            let container = document.createElement ("tr");
            this.element.appendChild (container);

            for (let name of headerNames)
            {
                let dataElement = document.createElement ("td");
                dataElement.innerHTML = name in data ? data[name] : "";
                container.appendChild (dataElement);
            }
        }
    }
}

class TableView extends View
{
    constructor (viewElement)
    {
        super (viewElement);
        this.headerView = new TableHeaderView (viewElement.getElementsByTagName ("thead")[0]);
        this.bodyView = new TableBodyView (viewElement.getElementsByTagName ("tbody")[0]);
    }

    Update (dataset)
    {
        this.Clear ();
        this.headerView.Update (dataset.columnNames);
        this.bodyView.Update (dataset.columnNames, dataset.list);
    }

    Clear ()
    {
        this.headerView.Clear ();
        this.bodyView.Clear ();
    }

    ForEach (callback = (elements, index) => {})
    {
        for (let i = 0; i < this.bodyView.element.children.length; i++)
        {
            callback (this.bodyView.element.children[i].children, i);
        }
    }
}

class TagElementView extends View
{
    constructor (viewElement)
    {
        super (viewElement);
    }

    Update (name, values, styles)
    {
        this.Clear ();

        let viewContainer = document.createElement ("div");
        viewContainer.setAttribute ("class", "col");
        this.element.appendChild (viewContainer);

        let headContainer = document.createElement ("div");
        headContainer.setAttribute ("class", "row justify-content-between align-items-center no-gutters");
        viewContainer.appendChild (headContainer);

        let nameContainer = document.createElement ("div");
        nameContainer.setAttribute ("class", "col-auto");
        headContainer.appendChild (nameContainer);

        let nameElement = document.createElement ("h3");
        nameElement.innerHTML = name;
        nameContainer.appendChild (nameElement);

        let editButtonContainer = document.createElement ("div");
        editButtonContainer.setAttribute ("class", "col-auto");
        headContainer.appendChild (editButtonContainer);

        let editButtonElement = document.createElement ("button");
        editButtonElement.innerHTML = "Edit";
        editButtonElement.setAttribute ("class", "btn btn-sm btn-outline-dark");
        editButtonElement.setAttribute ("type", "button");
        editButtonContainer.appendChild (editButtonElement);

        let bodyContainer = document.createElement ("div");
        bodyContainer.setAttribute ("class", "row no-gutters");
        viewContainer.appendChild (bodyContainer);

        for (let i = 0; i < values.length; i++)
        {
            let buttonContainer = document.createElement ("div");
            buttonContainer.setAttribute ("class", "col-auto mr-1 mb-1");
            bodyContainer.appendChild (buttonContainer);

            let buttonElement = document.createElement ("button");
            buttonElement.setAttribute ("class", "btn");
            buttonElement.setAttribute ("type", "button");
            buttonElement.innerHTML = values[i];
            buttonElement.style.color = styles[i]["text color"];
            buttonElement.style.backgroundColor = styles[i]["button color"];
            buttonElement.onclick = () => { Tag (name, values[i]); };
            buttonContainer.appendChild (buttonElement);
        }
    }
}

/*******************
* Global Variables *
*******************/

var defaultTagElements = [{
    "name" : "character_emotion",
    "values" : ["happy", "anticipation", "trust", "surprise", "sad", "anger", "disgust", "fear", "nuetral"],
    "view styles" : [{"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#43a047"},
                        {"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#ffa000"},
                        {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
                        {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
                        {"text color" : "#FFFFFF", "button color" : "#6c757d"}]
},
{
    "name" : "viewer_emotion",
    "values" : ["happy", "anticipation", "trust", "surprise", "sad", "anger", "disgust", "fear", "nuetral"],
    "view styles" : [{"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#43a047"},
                        {"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#ffa000"},
                        {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
                        {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
                        {"text color" : "#FFFFFF", "button color" : "#6c757d"}]
}];

var dataset = new Dataset ();
var tagElements = [];

var videoPlayer;
var tagElementViews = [];
var tableView;

var fileType;

/**********
* Program *
**********/

window.onload = () =>
{
    videoPlayer = new VideoPlayer ("video-player");
    tableView = new TableView (document.getElementById ("dataset-table"));

    for (let element of defaultTagElements)
    {
        AddTagElement (element["name"], element["values"], element["view styles"]);
    }

    document.getElementById ("video-file-modal-button").onclick = () =>
    {
        document.getElementById ("file-input-modal").getElementsByClassName ("modal-title")[0].innerHTML = "Load video file";
        document.getElementById ("local-file-name").value = "";
        document.getElementById ("local-file-input").value = "";

        fileType = "video";
    };

    document.getElementById ("subtitles-file-modal-button").onclick = () =>
    {
        document.getElementById ("file-input-modal").getElementsByClassName ("modal-title")[0].innerHTML = "Load subtitles file";
        document.getElementById ("local-file-name").value = "";
        document.getElementById ("local-file-input").value = "";

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
            videoPlayer.PlayFromFile (file);
        }
        else if (fileType === "subtitles")
        {
            let reader = new FileReader ();

            reader.onload = (event) =>
            {
                let vtt = SubtitlesReader.ReadVTT (event.target.result);

                dataset = new Dataset ();
                dataset.PushCategory ("time");
                dataset.PushCategory ("text");

                videoPlayer.AddSubtitlesTrack ("Subtitles");  

                for (let cue of vtt)
                {
                    dataset.Push (cue["start_time"], cue["text"]);
                    videoPlayer.AddSubtitlesTrackCue (cue["start_time"], cue["end_time"], cue["text"]);
                }

                tagElements = [];
                tagElementViews = [];
                while (document.getElementById ("tag-elements").firstChild)
                {
                    document.getElementById ("tag-elements").removeChild (document.getElementById ("tag-elements").firstChild);
                }

                for (let element of defaultTagElements)
                {
                    AddTagElement (element["name"], element["values"], element["view styles"]);
                }

                tableView.Update (dataset);
                tableView.ForEach ((elements, index) => {
                    elements[dataset.columnNames.indexOf ("text")].onclick = () =>
                    {
                        videoPlayer.SetPlayTime (dataset.list[index]["time"]);
                    };
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
};

function AddTagElement (name, values, viewStyles)
{
    let element = {};
    element["name"] = name;
    element["values"] = values;
    element["view styles"] = viewStyles;
    tagElements.push (element);

    let view = new TagElementView (document.createElement ("div"));
    view.element.setAttribute ("class", "row no-gutters");
    view.AttachTo (document.getElementById ("tag-elements"));
    view.Update (element["name"], element["values"], element["view styles"]);
    tagElementViews.push (view);

    dataset.PushCategory (name);
    tableView.Update (dataset);
}

function Tag (name, value)
{
    if (videoPlayer.IsEnded () || videoPlayer.GetTrackCount () <= 0)
    {
        return;
    }

    if (videoPlayer.GetLastTrack ().activeCues.length <= 0)
    {
        return;
    }

    let activeCue = videoPlayer.GetLastTrack ().activeCues[0];

    for (let i = 0; i < dataset.Count (); i++)
    {
        if (dataset.At (i)["text"] === activeCue.text)
        {
            dataset.At (i)[name] = value;

            break;
        }
    }

    tableView.Update (dataset);
    tableView.ForEach ((elements, index) => {
        elements[dataset.columnNames.indexOf ("text")].onclick = () =>
        {
            videoPlayer.SetPlayTime (dataset.list[index]["time"]);
        };
    });
}
