/**********
* Classes *
**********/

class Dataset
{
    constructor ()
    {
        this.columnNames = [];
        this.rows = [];
    }

    PushRow ()
    {
        if (arguments.length > this.CountColumns ())
        {
            throw "Elements are more than column length.";
        }

        let row = [];
        this.rows.push (row);

        for (let i = 0; i < this.CountColumns (); i++)
        {
            row.push (i < arguments.length ? arguments[i] : null);
        }
    }
    
    PopRow ()
    {
        if (this.CountRows () <= 0)
        {
            return null;
        }

        return this.rows.pop ();
    }

    PushColumn (name, fill = null)
    {
        /*
        if (this.columnNames.includes (name))
        {
            return;
        }
        */

        this.columnNames.push (name);
        for (let row of this.rows)
        {
            row.push (fill);
        }
    }

    PopColumn ()
    {
        if (this.CountColumns () <= 0)
        {
            return null;
        }

        this.columnNames.pop ();

        return this.rows.map ((row) => row.pop ());
    }

    RemoveColumn (name)
    {
        for (let row of this.rows)
        {
            row.splice (this.GetColumnIndex (name), 1);
        }
        this.columnNames.splice (this.GetColumnIndex (name), 1);
    }

    GetColumnIndex (name)
    {
        return this.columnNames.indexOf (name);
    }
    
    GetValue (rowIndex, columnIndex)
    {
        return this.rows[rowIndex][columnIndex];
    }

    SetValue (rowIndex, columnIndex, value)
    {
        this.rows[rowIndex][columnIndex] = value;
    }

    CountRows ()
    {
        return this.rows.length;
    }

    CountColumns ()
    {
        return this.columnNames.length;
    }

    ForEachRow (callback = (values, index) => {})
    {
        if (this.CountRows () <= 0)
        {
            return;
        }

        this.rows.forEach (callback);
    }

    ForEachColumn (rowIndex, callback = (value, index) => {})
    {
        if ((this.CountRows () <= 0) || (this.CountColumns () <= 0))
        {
            return;
        }

        this.rows[rowIndex].forEach (callback);
    }

    Select ()
    {}

    Filter ()
    {}

    ToCSV ()
    {
        let csv = this.columnNames.join (",");
        for (let row of this.rows)
        {
            csv += "\n";
            csv += row.join (",");
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
    
        parsed.forEach(cue =>
        {
            // Convert time text to seconds
            cue[0] = cue[0].split ("-->").map ((text) =>
            {
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
    
        parsed.forEach (cue =>
        {
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

    Pause ()
    {
        if (!this.IsPlaying ())
        {
            return;
        }

        this.element.pause ();
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
        if (this.CountTracks () > 0)
        {
            this.GetLastTrack ().mode = "disabled";
        }

        let track = this.element.addTextTrack ("subtitles", name);
        track.mode = "showing";
    }

    AddSubtitlesTrackCue (startTime, endTime, text)
    {
        if (this.CountTracks () > 0)
        {
            this.GetLastTrack ().addCue (new VTTCue (startTime, endTime, text));
        }
    }

    CountTracks ()
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

    Update (rows)
    {
        this.Clear ();

        for (let row of rows)
        {
            let container = document.createElement ("tr");
            this.element.appendChild (container);

            for (let value of row)
            {
                let dataElement = document.createElement ("td");
                dataElement.innerHTML = value;
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
        this.bodyView.Update (dataset.rows);
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
        headContainer.setAttribute ("class", "row justify-content-between align-items-center mb-1 no-gutters");
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
        editButtonElement.setAttribute ("data-toggle", "modal");
        editButtonElement.setAttribute ("data-target", "#edit-tag-element-modal");
        editButtonElement.onclick = () => { WhenEditTagElement (name); };
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

class FocusView extends View
{
    constructor (viewElement)
    {
        super (viewElement);
    }

    Update (dataset, focusIndex)
    {
        this.Clear ();

        dataset.ForEachColumn (focusIndex, (value) =>
        {
            let valueElement = document.createElement ("input");
            valueElement.setAttribute ("class", "form-control");
            valueElement.setAttribute ("type", "text");
            valueElement.setAttribute ("readonly", "");
            valueElement.value = value;
            this.element.appendChild (valueElement);
        });
    }
}

/*******************
* Global Variables *
*******************/

const defaultTagElements = [
    {
        "name" : "start_time",
        "taggable" : false
    },
    {
        "name" : "end_time",
        "taggable" : false
    },
    {
        "name" : "text",
        "taggable" : false
    },
    {
        "name" : "character_emotion",
        "taggable" : true,
        "values" : ["happy", "anticipation", "trust", "surprise", "sad", "anger", "disgust", "fear", "nuetral"],
        "view" : null,
        "view styles" : [
            {"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#43a047"},
            {"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#ffa000"},
            {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
            {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
            {"text color" : "#FFFFFF", "button color" : "#6c757d"}
        ]
    },
    {
        "name" : "viewer_emotion",
        "taggable" : true,
        "values" : ["happy", "anticipation", "trust", "surprise", "sad", "anger", "disgust", "fear", "nuetral"],
        "view" : null,
        "view styles" : [
            {"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#43a047"},
            {"text color" : "#FFFFFF", "button color" : "#43a047"}, {"text color" : "#FFFFFF", "button color" : "#ffa000"},
            {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
            {"text color" : "#FFFFFF", "button color" : "#d32f2f"}, {"text color" : "#FFFFFF", "button color" : "#d32f2f"},
            {"text color" : "#FFFFFF", "button color" : "#6c757d"}
        ]
    }
];

const EFocusMode = Object.freeze ({
    Stack : 1,
    Auto : 2
});

var dataset;
var tagElements = [];
var editingTagElementName;

var focusIndex;
var isLoopFocusIndex = true;
var focusMode;
var focusView;

var videoPlayer;
var tableView;

/**********
* Program *
**********/

window.onload = () =>
{
    //
    // Initialization
    //

    videoPlayer = new VideoPlayer ("video-player");
    tableView = new TableView (document.getElementById ("dataset-table"));
    focusView = new FocusView (document.getElementById ("focus-row"));

    CreateNewDataset ();
    SetFocusMode (EFocusMode.Auto);

    //
    // Loading files
    //
    
    document.getElementById ("video-file-modal-button").onclick = () =>
    {
        SetModalTitle ("file-input-modal", "Load video file");

        ResetInputElement ("local-file-name");
        ResetInputElement ("local-file-input");

        document.getElementById ("local-file-upload-button").onclick = () =>
        {
            videoPlayer.PlayFromFile (GetFile ("local-file-input"));
        };
    };

    document.getElementById ("subtitles-file-modal-button").onclick = () =>
    {
        SetModalTitle ("file-input-modal", "Load subtitles file");

        ResetInputElement ("local-file-name");
        ResetInputElement ("local-file-input");

        document.getElementById ("local-file-upload-button").onclick = () =>
        {
            let reader = new FileReader ();

            reader.onload = (event) =>
            {
                CreateNewDataset ();
                videoPlayer.AddSubtitlesTrack ("Subtitles"); 

                let vtt = SubtitlesReader.ReadVTT (event.target.result);

                for (let cue of vtt)
                {
                    dataset.PushRow (cue["start_time"], cue["end_time"], cue["text"]);
                    videoPlayer.AddSubtitlesTrackCue (cue["start_time"], cue["end_time"], cue["text"]);
                }

                focusView.Update (dataset, focusIndex);

                tableView.Update (dataset);
                tableView.ForEach ((elements, index) =>
                {
                    elements[dataset.GetColumnIndex ("text")].onclick = () =>
                    {
                        videoPlayer.SetPlayTime (dataset.GetValue (index, dataset.GetColumnIndex ("start_time")));
                        SetFocusIndex (index);
                        focusView.Update (dataset, focusIndex);
                    };
                });
            };

            reader.readAsText (GetFile ("local-file-input"));
        };
    };

    document.getElementById ("local-file-browse-button").onclick = () =>
    {
        document.getElementById ("local-file-input").click ();
    };

    document.getElementById ("local-file-input").onchange = (event) =>
    {
        document.getElementById ("local-file-name").value = event.target.files[0].name;
    };

    //
    //  Dataset
    //

    document.getElementById ("save-dataset-modal-button").onclick = () =>
    {
        let isAllTagged = true;
        for (let i = 0; i < dataset.CountRows (); i++)
        {
            if (!dataset.rows[i].every ((value) => { return value != null; }))
            {
                isAllTagged = false;
                break;
            }
        }

        SetModalTitle ("save-dataset-modal", "Save dataset" + (isAllTagged ? "" : " (Not all tagged)"));
    }

    document.getElementById ("save-dataset-button").onclick = () =>
    {
        let download = document.getElementById ("save-file-download");
        download.setAttribute ("href", encodeURI ("data:text/csv;charset=utf-8," + dataset.ToCSV ()));
        download.setAttribute ("download", document.getElementById ("save-file-name").value + ".csv");
        download.click ();
    };

    document.getElementById ("load-dataset-modal-button").onclick = () =>
    {
        SetModalTitle ("file-input-modal", "Load dataset file");
        
        ResetInputElement ("local-file-name");
        ResetInputElement ("local-file-input");

        document.getElementById ("local-file-upload-button").onclick = () =>
        {
            let reader = new FileReader ();

            reader.onload = (event) =>
            {
                CreateNewDataset ();
                videoPlayer.AddSubtitlesTrack ("Subtitles");

                let csv = event.target.result.split ("\n").slice (1);
                csv = csv.map (value => value.split (","));

                for (let line of csv)
                {
                    let startTime = Number (line[0]);
                    let endTime = Number (line[1]);
                    let text = line[2];

                    dataset.PushRow (startTime, endTime, text);
                    videoPlayer.AddSubtitlesTrackCue (startTime, endTime, text);
                }

                for (let i = 0; i < dataset.CountRows (); i++)
                {
                    for (let j = 3; j < csv[i].length; j++)
                    {
                        dataset.SetValue (i, j, csv[i][j]);
                    }
                }

                focusView.Update (dataset, focusIndex);

                tableView.Update (dataset);
                tableView.ForEach ((elements, index) =>
                {
                    elements[dataset.GetColumnIndex ("text")].onclick = () =>
                    {
                        videoPlayer.SetPlayTime (dataset.GetValue (index, dataset.GetColumnIndex ("start_time")));
                        SetFocusIndex (index);
                        focusView.Update (dataset, focusIndex);
                    };
                });
            };

            reader.readAsText (GetFile ("local-file-input"));
        };
    };
    
    //
    // Fcous bar
    //

    document.getElementById ("tag-mode-stack-button").onclick = () =>
    {
        SetFocusMode (EFocusMode.Stack);
    };

    document.getElementById ("tag-mode-auto-button").onclick = () =>
    {
        SetFocusMode (EFocusMode.Auto);
    };

    document.getElementById ("previous-row-button").onclick = () =>
    {
        SetFocusIndex (focusIndex - 1);
        focusView.Update (dataset, focusIndex);
    };

    document.getElementById ("next-row-button").onclick = () =>
    {
        SetFocusIndex (focusIndex + 1);
        focusView.Update (dataset, focusIndex);
    };

    //
    //  Tag Elements
    //

    document.getElementById ("add-tag-element-button").onclick = () =>
    {
        AddTagElement ("New tag element", true, [], []);
    };

    document.getElementById ("add-tag-element-value-button").onclick = () =>
    {
        let valueEditContainer = document.getElementById ("tag-element-value-edit");

        let valueEditCol = document.createElement ("div");
        valueEditCol.setAttribute ("class", "col-auto mr-1 mb-1");
        valueEditContainer.appendChild (valueEditCol);

        let editElement = document.createElement ("input");
        editElement.setAttribute ("class", "form-control");
        editElement.setAttribute ("type", "text");
        valueEditCol.appendChild (editElement);
    };

    document.getElementById ("edit-tag-element-button").onclick = () =>
    {
        let tagElement;
        for (const element of tagElements)
        {
            if (element["name"] == editingTagElementName)
            {
                tagElement = element;
                break;
            }
        }
    
        let values = [];
        let styles = tagElement["view styles"];

        const edits = document.getElementById ("tag-element-value-edit");
        for (let i = 0; i < edits.childElementCount; i++)
        {
            let value = edits.children[i].firstElementChild.value;
            if (!value)
            {
                continue;
            }

            values.push (edits.children[i].firstElementChild.value);

            if (i >= styles.length)
            {
                styles.push ({"text color" : "#FFFFFF", "button color" : "#6c757d"});
            }
        }
    
        tagElement["name"] = document.getElementById ("tag-element-name-edit").value;
        tagElement["values"] = values;
        tagElement["view styles"] = styles;
        tagElement["view"].Update (tagElement["name"], tagElement["values"], tagElement["view styles"]);

        dataset.columnNames[dataset.GetColumnIndex (editingTagElementName)] = tagElement["name"];
        tableView.Update (dataset);
    };

    //
    //  Keyboard Events
    //

    document.addEventListener ("keydown", (event) =>
    {
        let isShowingModal = document.getElementById ("file-input-modal").classList.contains ("show") ||
            document.getElementById ("save-dataset-modal").classList.contains ("show") ||
            document.getElementById ("edit-tag-element-modal").classList.contains ("show");
        
        if (isShowingModal)
        {
            return;
        }
        
        switch (event.code)
        {
            case "Space":
            {
                event.preventDefault ();

                if (videoPlayer.IsPlaying ())
                {
                    videoPlayer.Pause ();
                }
                else
                {
                    videoPlayer.Play ();
                }

                break;
            }

            case "ArrowLeft":
            {
                event.preventDefault ();

                SetFocusIndex (focusIndex - 1);
                focusView.Update (dataset, focusIndex);

                break;
            }

            case "ArrowRight":
            {
                event.preventDefault ();

                SetFocusIndex (focusIndex + 1);
                focusView.Update (dataset, focusIndex);
                
                break;
            }
        }
    });
};

function GetFile (fileInputElementId)
{
    return document.getElementById (fileInputElementId).files[0];
}

function ResetInputElement (elementId)
{
    document.getElementById (elementId).value = "";
}

function SetModalTitle (modalId, title)
{
    document.getElementById (modalId).getElementsByClassName ("modal-title")[0].innerHTML = title;
}

function CreateNewDataset ()
{
    dataset = new Dataset ();
    tagElements = [];
    SetFocusIndex (0);

    while (document.getElementById ("tag-elements").firstChild)
    {
        document.getElementById ("tag-elements").removeChild (document.getElementById ("tag-elements").firstChild);
    }

    for (let element of defaultTagElements)
    {
        AddTagElement (element["name"], element["taggable"], element["values"], element["view styles"]);
    }
}

function AddTagElement (name, taggable, values, viewStyles)
{
    dataset.PushColumn (name);

    let element = {};
    element["name"] = name;
    element["taggable"] = taggable;

    if (taggable)
    {
        let view = new TagElementView (document.createElement ("div"));
        view.element.setAttribute ("class", "row align-items-center mb-2 no-gutters");
        view.AttachTo (document.getElementById ("tag-elements"));

        element["values"] = values;
        element["view"] = view;
        element["view styles"] = viewStyles;

        element["view"].Update (element["name"], element["values"], element["view styles"]);
    }
    tagElements.push (element);
    tableView.Update (dataset);
}

function Tag (name, value)
{
    if (focusMode === EFocusMode.Stack)
    {
        dataset.SetValue (focusIndex, dataset.GetColumnIndex (name), value);

        let allTagged = true;
        dataset.ForEachColumn (focusIndex, (value) =>
        {
            if (value === null)
            {
                allTagged = false;
            }
        });

        if (allTagged)
        {
            SetFocusIndex (focusIndex + 1);
        }

        focusView.Update (dataset, focusIndex);
    }
    else if (focusMode === EFocusMode.Auto)
    {
        if (!videoPlayer.IsPlaying ())
        {
            return;
        }
    
        if (videoPlayer.GetLastTrack ().activeCues.length <= 0)
        {
            return;
        }
    
        let activeCue = videoPlayer.GetLastTrack ().activeCues[0];
    
        for (let i = 0; i < dataset.CountRows (); i++)
        {
            if (dataset.GetValue (i, dataset.GetColumnIndex("text")) === activeCue.text)
            {
                dataset.SetValue (i, dataset.GetColumnIndex (name), value);
    
                break;
            }
        }
    }

    tableView.Update (dataset);
    tableView.ForEach ((elements, index) =>
    {
        elements[dataset.GetColumnIndex ("text")].onclick = () =>
        {
            videoPlayer.SetPlayTime (dataset.GetValue (index, dataset.GetColumnIndex ("start_time")));
            SetFocusIndex (index);
            focusView.Update (dataset, focusIndex);
        };
    });
}

function SetFocusMode (mode)
{
    focusMode = mode;

    switch (mode)
    {
        case EFocusMode.Stack:
        {
            document.getElementById ("tag-mode-stack-button").classList.add ("active");
            document.getElementById ("tag-mode-auto-button").classList.remove ("active");
            break;
        }

        case EFocusMode.Auto:
        {
            document.getElementById ("tag-mode-stack-button").classList.remove ("active");
            document.getElementById ("tag-mode-auto-button").classList.add ("active");
            break;
        }
    }
}

function SetFocusIndex (index)
{
    if (dataset.CountRows () <= 0)
    {
        focusIndex = 0;
        return;
    }

    let count = dataset.CountRows ();
    if (isLoopFocusIndex)
    {
        focusIndex = index % count + (index < 0 ? count : 0);
    }
    else
    {
        focusIndex = Math.min (Math.max (index, 0), count);
    }
}

function WhenEditTagElement (name)
{
    editingTagElementName = name;

    let modalTitle = "Edit " + name;
    SetModalTitle ("edit-tag-element-modal", modalTitle);

    document.getElementById ("tag-element-name-edit").value = name;

    let tagElement;
    for (const element of tagElements)
    {
        if (element["name"] == name)
        {
            tagElement = element;
            break;
        }
    }

    let valueEditContainer = document.getElementById ("tag-element-value-edit");
    while (valueEditContainer.firstChild)
    {
        valueEditContainer.removeChild (valueEditContainer.firstChild);
    }

    for (const value of tagElement["values"])
    {
        let valueEditCol = document.createElement ("div");
        valueEditCol.setAttribute ("class", "col-auto mr-1 mb-1");
        valueEditContainer.appendChild (valueEditCol);

        let editElement = document.createElement ("input");
        editElement.setAttribute ("class", "form-control");
        editElement.setAttribute ("type", "text");
        editElement.value = value;
        valueEditCol.appendChild (editElement);
    }
}