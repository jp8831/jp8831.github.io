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

        this.element.getAttribute ("d", ["M", startPointX, startPointY, "C", curve].join (" "));
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
        let translate = transform.match (/translate\(([0-9]*\.?[0-9]*),([0-9]*\.?[0-9]*)\)/);
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
        csv = csv.map (line => line.split (","));

        for (let line of csv)
        {
            this.AddVertex ({
                subject : line[0],
                action : line[1],
                object : line[2]
            });
        }
    }

    SaveCSV ()
    {
        let csv = ["subject", "action", "object"].join (",");
        for (let vertex of this.vertices)
        {
            csv += "\n";
            csv += [vertex.subject, vertex.action, vertex.object].join (",");
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
    }

    CreateNode (subject, action, object)
    {
        let node = new SVGGroup ();
        svg.AddChild (node);
        node.element.classList.add ("node");
        
        let nodeRect = new SVGRectangle ();
        node.Add (nodeRect);
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
    
        node.Add (subjectText);
        node.Add (actiontText);
        node.Add (objectText);
    
        nodeRect.SetSize (Math.max (100, subjectText.GetWidth (), actiontText.GetWidth (), objectText.GetWidth ()) + 40, 110);
    
        let previousPoint = new SVGCircle ();
        previousPoint.SetRadius (5);
        previousPoint.position.Set (0, 20);
    
        let nextPoint = new SVGCircle ();
        nextPoint.SetRadius (5);
        nextPoint.position.Set (nodeRect.GetSize ().width, 20);
        
        let previousText = new SVGText ();
        previousText.Set ("Previous");
        previousText.position.Set (10, 25);
    
        let nextText = new SVGText ();
        nextText.Set ("Next");
        nextText.position.Set (nodeRect.GetSize ().width - 45, 25);
    
        node.Add (previousPoint);
        node.Add (nextPoint);
        node.Add (previousText);
        node.Add (nextText);

        this.nodes.push (node);

        return node;
    }

    DeleteNode ()
    {

    }

    ConnectNode ()
    {

    }
}

var svg;
var graph = new EventGraph ();
var editor = new NodeEditor ();

var lastMousePosition = { x : 0, y : 0 };
var panningScreen = false;

window.onload = function ()
{
    svg = new SVG ("svg");
    svg.SetViewBox (0, 0, window.innerWidth, window.innerHeight);
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
                let node = editor.CreateNode (vertex.subject, vertex.action, vertex.object);

                if (lastNode)
                {
                    let transform = node.GetTransform ();
                    transform.translate.x = lastNode.element.getBoundingClientRect ().right + 20;
                    node.SetTransform (transform);
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

function SetEventNodeTransform (eventNode, x, y)
{
    let translate = "translate(" + x + "," + y + ")";
    eventNode.setAttribute ("transform", translate);
}

function StartDrag (event)
{
    event.preventDefault ();

    panningScreen = true;
    UpdateLastMousePosition (event.clientX, event.clientY);

    // draggingElement = event.target;

    // if (draggingElement.classList.contains ("transition-point"))
    // {
    //     let elementRect = draggingElement.getBoundingClientRect ();
    //     let x = elementRect.left + elementRect.width / 2;
    //     let y = elementRect.top + elementRect.height / 2; 
    //     transitionPath = CreateSVGBezierCurve (x, y, lastMousePosition.x, lastMousePosition.y);
    // }
}

function Drag (event)
{
    if (panningScreen === false)
    {
        return;
    }

    let mouseMove = GetMouseMovement (event.clientX, event.clientY);
    UpdateLastMousePosition (event.clientX, event.clientY);

    let viewBox = svg.GetViewBox ();
    viewBox.x += mouseMove.x;
    viewBox.y += mouseMove.y;
    svg.SetViewBox (viewBox.x, viewBox.y, viewBox.width, viewBox.height);

//     if (draggingElement === null)
//     {
//         return;
//     }

//     let viewBox = GetViewBox ();
//     let mouseMove = GetMouseMovement (event.clientX, event.clientY);
//     UpdateLastMousePosition (event.clientX, event.clientY);

//     if (draggingElement === svg)
//     {
//         let viewBox = svg.getAttribute ("viewBox").split (" ");
//         viewBox[0] = Number (viewBox[0]) + mouseMove.x;
//         viewBox[1] = Number (viewBox[1]) + mouseMove.y;
//         svg.setAttribute ("viewBox", viewBox.join (" "));
//     }

//     if (draggingElement.classList.contains ("node-rect"))
//     {
//         let node = draggingElement.parentElement;
//         let x = node.getBoundingClientRect ().left + mouseMove.x + viewBox.x;
//         let y = node.getBoundingClientRect ().top + mouseMove.y + viewBox.y;
//         SetEventNodeTransform (node, x, y);

//         let id = draggingElement.parentElement.id.substr (4);
//         for (let edge of eventGraph.edges)
//         {
//             let curve = GetSVGBezierCurve (edge.path);

//             if (id === edge.from)
//             {
//                 curve.start.x += mouseMove.x;
//                 curve.start.y += mouseMove.y;
//             }
//             else if (id === edge.to)
//             {
//                 curve.end.x += mouseMove.x;
//                 curve.end.y += mouseMove.y;
//             }

//             SetSVGBezierCurve (edge.path, curve.start.x, curve.start.y, curve.end.x, curve.end.y);
//         }
//     }

//     if (draggingElement.classList.contains ("transition-point"))
//     {
//         let elementRect = draggingElement.getBoundingClientRect ();
//         let x = elementRect.left + elementRect.width / 2 + viewBox.x;
//         let y = elementRect.top + elementRect.height / 2 + viewBox.y; 
//         SetSVGBezierCurve (transitionPath, x, y, lastMousePosition.x + viewBox.x, lastMousePosition.y + viewBox.y);
//     }
}

function EndDrag (event)
{
    panningScreen = false;

    // if (draggingElement === null)
    // {
    //     return;
    // }

    // if (draggingElement.classList.contains ("transition-point") && event.target.classList.contains ("transition-point"))
    // {
    //     let fromId = draggingElement.parentElement.id.substr (4);
    //     let toId = event.target.parentElement.id.substr (4);

    //     AddGraphEdge (fromId, toId, transitionPath);

    //     let viewBox = GetViewBox ();

    //     let startRect = draggingElement.getBoundingClientRect ();
    //     let startX = startRect.left + startRect.width / 2 + viewBox.x;
    //     let startY = startRect.top + startRect.height / 2 + viewBox.y;

    //     let endRect = event.target.getBoundingClientRect ();
    //     let endX = endRect.left + endRect.width / 2 + viewBox.x;
    //     let endY = endRect.top + endRect.height / 2 + viewBox.y;

    //     SetSVGBezierCurve (transitionPath, startX, startY, endX, endY);

    //     transitionPath = null;
    // }
    // else if (transitionPath !== null)
    // {
    //     transitionPath.remove ();
    // }

    // draggingElement = null;
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