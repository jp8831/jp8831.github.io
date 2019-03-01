/************
*    SVG    *
************/

class SVGElementPosition
{
    constructor (element)
    {
        this.element = element;
    }

    Get ()
    {
        return {
            x : Number (this.element.getAttribute ("x")),
            y : Number (this.element.getAttribute ("y"))
        };
    }

    Set (x, y)
    {
        this.element.setAttribute ("x", x);
        this.element.setAttribute ("y", y);
    }
}

class SVGElementCirclePosition
{
    constructor (element)
    {
        this.element = element;
    }

    Get ()
    {
        return {
            x : Number (this.element.getAttribute ("cx")),
            y : Number (this.element.getAttribute ("cy"))
        };
    }

    Set (x, y)
    {
        this.element.setAttribute ("cx", x);
        this.element.setAttribute ("cy", y);
    }
}

class SVGElementStyle
{
    constructor (element)
    {
        this.element = element;
    }

    Get ()
    {
        let properties = {};
        for (let property of this.element.getAttribute ("style").split (";"))
        {
            property = property.split (":");
            let name = property[0].trim ();
            let value = property[1].trim ();
            properties[name] = value;
        }
        return properties;
    }

    Set (properties)
    {
        let style = [];
        for (let name of Object.keys (properties))
        {
            style.push (name + ":" + properties[name]);
        }
        this.element.setAttribute ("style", style.join (";"));
    }
}

class SVGRectangle
{
    constructor ()
    {
        this.element = document.createElementNS ("http://www.w3.org/2000/svg", "rect");
        this.position = new SVGElementPosition (this.element);
        this.style = new SVGElementStyle (this.element);
    }

    GetSize ()
    {
        return {
            width : Number (this.element.getAttribute ("width")),
            height : Number (this.element.getAttribute ("height"))
        };
    }

    SetSize (width, height)
    {
        this.element.setAttribute ("width", width);
        this.element.setAttribute ("height", height);
    }

    GetCornerRadius ()
    {
        return {
            x : Number (this.element.getAttribute ("rx")),
            y : Number (this.element.getAttribute ("ry"))
        };
    }

    SetCornerRadius (x, y)
    {
        this.element.setAttribute ("rx", x);
        this.element.setAttribute ("ry", y);
    }
}

class SVGCircle
{
    constructor ()
    {
        this.element = document.createElementNS ("http://www.w3.org/2000/svg", "circle");
        this.position = new SVGElementCirclePosition (this.element);
        this.style = new SVGElementStyle (this.element);
    }

    GetRadius ()
    {
        return Number (this.element.getAttribute ("r"));
    }

    SetRadius (radius)
    {
        this.element.setAttribute ("r", radius);
    }
}

class SVGLine
{
    constructor ()
    {
        this.element = document.createElementNS ("http://www.w3.org/2000/svg", "line");
    }

    GetStartPoint ()
    {
        return {
            x : Number (this.element.getAttribute ("x1")),
            y : Number (this.element.getAttribute ("y1"))
        };
    }

    SetStartPoint (x, y)
    {
        this.element.setAttribute ("x1", x);
        this.element.setAttribute ("y1", y);
    }

    GetEndPoint ()
    {
        return {
            x : Number (this.element.getAttribute ("x2")),
            y : Number (this.element.getAttribute ("y2"))
        };
    }

    SetEndPoint (x, y)
    {
        this.element.setAttribute ("x2", x);
        this.element.setAttribute ("y2", y);
    }
}

class SVGCurve
{
    constructor ()
    {
        this.element = document.createElementNS ("http://www.w3.org/2000/svg", "path");
    }

    GetInfo ()
    {
        let info = this.element.getAttribute ("d").replace (",", "").split (" ");
        return {
            start : {
                x : Number (info[1]),
                y : Number (info[2])
            },
            end : {
                x : Number (info[8]),
                y : Number (info[9])
            },
            control1 : {
                x : Number (info[4]),
                y : Number (info[5])
            },
            control2 : {
                x : Number (info[6]),
                y : Number (info[7])
            }
        };
    }

    Set (startPointX, startPointY, endPointX, endPointY,
        controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y)
    {
        let curve = [
            [controlPoint1X, controlPoint1Y].join (" "),
            [controlPoint2X, controlPoint2Y].join (" "),
            [endPointX, endPointY].join (" "),
        ].join (", ");

        this.element.setAttribute ("d", ["M", startPointX, startPointY, "C", curve].join (" "));
    }
}

class SVGText
{
    constructor ()
    {
        this.element = document.createElementNS ("http://www.w3.org/2000/svg", "text");
        this.position = new SVGElementPosition (this.element);
    }

    Get ()
    {
        return this.element.innerHTML;
    }

    Set (content)
    {
        this.element.innerHTML = content;
    }

    GetWidth ()
    {
        return Number (this.element.getBoundingClientRect ().width);
    }
}

class SVGGroup
{
    constructor ()
    {
        this.element = document.createElementNS ("http://www.w3.org/2000/svg", "g");
        this.SetTransform ({
            translate : {
                x : 0,
                y : 0
            },
            rotate : 0,
            scale : {
                x : 1,
                y : 1
            }
        });
    }

    Add (child)
    {
        this.element.appendChild (child.element);
    }

    Delete (child)
    {
        if (child.parentElement !== this.element)
        {
            return;
        }
        this.element.parentElement.appendChild (child.element);
    }

    GetTransform ()
    {
        let transform = this.element.getAttribute ("transform");
        let translate = transform.match (/translate\((-?[0-9]*\.?[0-9]*),(-?[0-9]*\.?[0-9]*)\)/);
        let rotate = transform.match (/rotate\(([0-9]*\.?[0-9]*)\)/);
        let scale = transform.match (/scale\(([0-9]*\.?[0-9]*),([0-9]*\.?[0-9]*)\)/);
        return {
            translate : {
                x : Number (translate[1]),
                y : Number (translate[2])
            },
            rotate : Number (rotate[1]),
            scale : {
                x : Number (scale[1]),
                y : Number (scale[2])
            }
        };
    }

    SetTransform (transform)
    {
        this.element.setAttribute ("transform", [
            `translate(${transform.translate.x},${transform.translate.y})`,
            `rotate(${transform.rotate})`,
            `scale(${transform.scale.x},${transform.scale.y})`
        ].join (" "));
    } 
}

class SVG
{
    constructor (id)
    {
        this.id = id;
        this.element = document.getElementById (id);
        this.backgroundElement = this.element.getElementsByClassName ("background")[0];

        this.children = [];
        this.layers = {};

        this.AddLayer ("default");
    }

    AddChild (child, layerName = "default")
    {
        this.children.push (child);
        this.layers[layerName].Add (child);
    }

    FindChild (element)
    {
        let found = this.children.find (shape => shape.element === element);
        return found ? found : null;
    }

    AddLayer (name)
    {
        if (Object.keys (this.layers).includes (name))
        {
            return;
        }

        this.layers[name] = new SVGGroup ();
        this.element.appendChild (this.layers[name].element);
    }

    DeleteLayer (name)
    {
        if (Object.keys (this.layers).includes (name) === false)
        {
            return;
        }

        this.layers[name].element.remove ();
        delete this.layers[name];
    }

    GetViewBox ()
    {
        let viewBox = this.element.getAttribute ("viewBox").split (" ").map (value => Number (value));
        return {
            x : viewBox[0],
            y : viewBox[1],
            width : viewBox[2],
            height : viewBox[3]
        };
    }

    SetViewBox (x, y, width, height)
    {
        this.element.setAttribute ("viewBox", [x, y, width, height].join (" "));
        this.backgroundElement.setAttribute ("x", x);
        this.backgroundElement.setAttribute ("y", y);
    }

    AddEventListner (type, listner)
    {
        this.element.addEventListener (type, listner);
    }

    RemoveEventListner (type, listner)
    {
        this.element.removeEventListener (type, listner);
    }
}

/********************
*    Event Graph    *
********************/

class EventGraph
{
    constructor ()
    {
        this.vertices = [];
        this.edges = [];
    }

    AddVertex (vertex)
    {
        this.vertices.push (vertex);
    }

    DeleteVertex ()
    {

    }

    AddEdge (edge)
    {
        this.edges.push (edge);
    }

    DeleteEdge ()
    {

    }

    ReadCSV (csv)
    {
        csv = csv.split ("\n").slice (1);
        csv = csv.map (line => line.trim ().split (","));
        csv.forEach((element, index) => {
            this.AddVertex ({
                id : index,
                subject : element[0],
                action : element[1],
                object : element[2]
            });
        });
    }

    SaveCSV ()
    {
        let csv = ["id", "subject", "action", "object", "previous", "next"].join (",");
        for (let vertex of this.vertices)
        {
            csv += "\n";

            let prevIds = [];
            let nextIds = [];
            for (let edge of this.edges)
            {
                if (edge.next === vertex.id && prevIds.includes (edge.prev) === false)
                {
                    prevIds.push (edge.prev);
                }
                else if (edge.prev === vertex.id && nextIds.includes (edge.next) === false)
                {
                    nextIds.push (edge.next);
                }
            }

            csv += [vertex.id, vertex.subject, vertex.action, vertex.object, prevIds.join (" "), nextIds.join (" ")].join (",");
        }

        let download = document.getElementById ("file-download");
        download.setAttribute ("href", encodeURI ("data:text/csv;charset=utf-8," + csv));
        download.setAttribute ("download", download.value + ".csv");
        download.click ();
    }
}

/********************
*    Node Editor    *
********************/

class NodeEditor
{
    constructor ()
    {
        this.svg;
        this.nodes = [];
        this.links = [];
    }

    CreateNode (id, subject, action, object)
    {
        let node = {};
        node.id = id;
        node.svg = new SVGGroup ();
        this.svg.AddChild (node.svg, "nodes");
        node.svg.element.classList.add ("node");
        
        let nodeRect = new SVGRectangle ();
        node.svg.Add (nodeRect);
        nodeRect.SetCornerRadius (5, 5);
    
        let subjectText = new SVGText ();
        subjectText.Set (subject);
        subjectText.position.Set (20, 50);
    
        let actiontText = new SVGText ();
        actiontText.Set (action);
        actiontText.position.Set (20, 70);
    
        let objectText = new SVGText ();
        objectText.Set (object);
        objectText.position.Set (20, 90);
    
        node.svg.Add (subjectText);
        node.svg.Add (actiontText);
        node.svg.Add (objectText);
    
        nodeRect.SetSize (Math.max (100, subjectText.GetWidth (), actiontText.GetWidth (), objectText.GetWidth ()) + 40, 110);
    
        let previousPoint = new SVGCircle ();
        previousPoint.element.classList.add ("link-point");
        previousPoint.SetRadius (5);
        previousPoint.position.Set (0, 20);
    
        let nextPoint = new SVGCircle ();
        nextPoint.element.classList.add ("link-point");
        nextPoint.SetRadius (5);
        nextPoint.position.Set (nodeRect.GetSize ().width, 20);

        node.prevLinkPoint = previousPoint;
        node.nextLinkPoint = nextPoint;
        
        let previousText = new SVGText ();
        previousText.Set ("Previous");
        previousText.position.Set (10, 25);
    
        let nextText = new SVGText ();
        nextText.Set ("Next");
        nextText.position.Set (nodeRect.GetSize ().width - 45, 25);
    
        node.svg.Add (previousPoint);
        node.svg.Add (nextPoint);
        node.svg.Add (previousText);
        node.svg.Add (nextText);

        this.nodes.push (node);

        return node;
    }

    DeleteNode ()
    {

    }

    ConnectNode (from, to)
    {
        let link = { svg : new SVGCurve (), previous : from, next : to };
        this.svg.AddChild (link.svg);
        this.links.push (link);
        link.svg.element.classList.add ("link");

        let fromTranslate = from.svg.GetTransform ().translate;
        let fromLinkPoint = from.nextLinkPoint.position.Get ();

        let startX = fromTranslate.x + fromLinkPoint.x;
        let startY = fromTranslate.y + fromLinkPoint.y;

        let toTranslate = to.svg.GetTransform ().translate;
        let toLinkPoint = to.prevLinkPoint.position.Get ();

        let endX = toTranslate.x + toLinkPoint.x;
        let endY = toTranslate.y + toLinkPoint.y;

        link.svg.Set (startX, startY, endX, endY, startX, endY, endX, startY);
        graph.AddEdge ({ prev : from.id, next : to.id});
    }
}

var svg;
var graph = new EventGraph ();
var editor = new NodeEditor ();

var lastMousePosition = { x : 0, y : 0 };
var panningScreen = false;
var connectingNode = null;
var draggingNode = null;

window.onload = function ()
{
    svg = new SVG ("svg");
    svg.SetViewBox (0, 0, window.innerWidth, window.innerHeight);
    svg.AddLayer ("nodes");
    svg.AddEventListner ("mousedown", StartDrag);
    svg.AddEventListner ("mousemove", Drag);
    svg.AddEventListner ("mouseup", EndDrag);
    svg.AddEventListner ("mouseleave", EndDrag);

    editor.svg = svg;

    document.getElementById ("local-file-input").onchange = function (event)
    {
        let reader = new FileReader ();
        reader.onload = function (event) {
            graph.ReadCSV (event.target.result);

            let lastNode;
            for (let vertex of graph.vertices)
            {
                let node = editor.CreateNode (vertex.id, vertex.subject, vertex.action, vertex.object);

                if (lastNode)
                {
                    let transform = node.svg.GetTransform ();
                    transform.translate.x = lastNode.svg.element.getBoundingClientRect ().right + 20;
                    node.svg.SetTransform (transform);
                }

                lastNode = node;
            }
        };
        reader.readAsText (event.target.files[0]);
    };

    document.getElementById ("read-csv-button").onclick = function ()
    {
        document.getElementById ("local-file-input").click ();
    }

    document.getElementById ("save-csv-button").onclick = function ()
    {
        graph.SaveCSV ();
    }
}

window.onresize = function ()
{
    let viewBox = svg.GetViewBox ();
    svg.SetViewBox (viewBox.x, viewBox.y, window.innerWidth, window.innerHeight);
}

/****************
*    Dragging    *
****************/

function StartDrag (event)
{
    event.preventDefault ();

    if (event.target.classList.contains ("background"))
    {
        panningScreen = true;
        UpdateLastMousePosition (event.clientX, event.clientY);
    }
    else if (event.target.classList.contains ("link-point"))
    {
        for (let node of editor.nodes)
        {
            if (node.svg.element === event.target.parentElement)
            {
                connectingNode = node;
                break;
            }
        }
    }
    else if (event.target.parentElement.classList.contains ("node"))
    {
        for (let node of editor.nodes)
        {
            if (node.svg.element === event.target.parentElement)
            {
                UpdateLastMousePosition (event.clientX, event.clientY);
                draggingNode = node;
            }
        }
    }
}

function Drag (event)
{
    event.preventDefault ();

    if (panningScreen)
    {
        let mouseMove = GetMouseMovement (event.clientX, event.clientY);
        UpdateLastMousePosition (event.clientX, event.clientY);

        let viewBox = svg.GetViewBox ();
        viewBox.x += mouseMove.x;
        viewBox.y += mouseMove.y;
        svg.SetViewBox (viewBox.x, viewBox.y, viewBox.width, viewBox.height);
    }
    else if (draggingNode !== null)
    {
        let mouseMove = GetMouseMovement (event.clientX, event.clientY);
        UpdateLastMousePosition (event.clientX, event.clientY);

        let transform = draggingNode.svg.GetTransform ();
        transform.translate.x += mouseMove.x;
        transform.translate.y += mouseMove.y;

        draggingNode.svg.SetTransform (transform);

        for (let link of editor.links)
        {
            if (draggingNode === link.previous)
            {
                let fromTranslate = draggingNode.svg.GetTransform ().translate;
                let fromLinkPoint = draggingNode.nextLinkPoint.position.Get ();

                let startX = fromTranslate.x + fromLinkPoint.x;
                let startY = fromTranslate.y + fromLinkPoint.y;

                let curve = link.svg.GetInfo ();

                let endX = curve.end.x;
                let endY = curve.end.y;

                link.svg.Set (startX, startY, endX, endY, startX, endY, endX, startY);
            }
            else if (draggingNode === link.next)
            {
                let toTranslate = draggingNode.svg.GetTransform ().translate;
                let toLinkPoint = draggingNode.prevLinkPoint.position.Get ();

                let endX = toTranslate.x + toLinkPoint.x;
                let endY = toTranslate.y + toLinkPoint.y;

                let curve = link.svg.GetInfo ();

                let startX = curve.start.x;
                let startY = curve.start.y;

                link.svg.Set (startX, startY, endX, endY, startX, endY, endX, startY);
            }
        }
    }
}

function EndDrag (event)
{
    panningScreen = false;
    draggingNode = null;

    if (event.target.classList.contains ("link-point") && connectingNode !== null)
    {
        for (let node of editor.nodes)
        {
            if (node.svg.element === event.target.parentElement)
            {
                editor.ConnectNode (connectingNode, node);
                break;
            }
        }

        connectingNode = null;
    }
}

/***********************
*    Mouse Position    *
***********************/

function UpdateLastMousePosition (x, y)
{
    lastMousePosition.x = x;
    lastMousePosition.y = y;
}

function GetMouseMovement (x, y)
{
    return { x : x - lastMousePosition.x, y : y - lastMousePosition.y };
}