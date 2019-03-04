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

        return csv;
    }
}

/********************
*    Node Editor    *
********************/

class NodeLinkPoint
{
    constructor (node, svg)
    {
        this.node = node;
        this.svg = svg;
    }
}

class Node
{
    constructor (id, svg)
    {
        this.id = id;
        this.svg = svg;

        this.prevLinkPoint = new NodeLinkPoint (this, this.svg);
        this.nextLinkPoint = new NodeLinkPoint (this, this.svg);
    }
}

class NodeEditor
{
    constructor (svg, graph)
    {
        this.graph = graph;

        this.nodes = [];
        this.links = [];

        this.lastMousePosition = { x : 0, y : 0 };
        this.dragTarget = null;

        this.svg = svg;

        this.svg.SetViewBox (0, 0, window.innerWidth, window.innerHeight);
        this.svg.AddLayer ("nodes");

        this.svg.element.onmousedown = (event) => { event.preventDefault (); this.StartDrag (event.target, event.clientX, event.clientY); };
        this.svg.element.onmousemove = (event) => { event.preventDefault (); this.Drag (event.clientX, event.clientY); };
        this.svg.element.onmouseup = (event) => { event.preventDefault (); this.EndDrag (event.target, event.clientX, event.clientY); };
        this.svg.element.onmouseleave = (event) => { event.preventDefault (); this.EndDrag (event.target, event.clientX, event.clientY); };
        this.svg.element.onmousewheel = (event) => { event.preventDefault (); this.Zoom (event.wheelDelta); };
    }

    CreateNode (id, subject, action, object)
    {
        let node = new Node (id, new SVGGroup ());
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
        previousPoint.element.classList.add ("link-point", "previous");
        previousPoint.SetRadius (5);
        previousPoint.position.Set (0, 20);
    
        let nextPoint = new SVGCircle ();
        nextPoint.element.classList.add ("link-point", "next");
        nextPoint.SetRadius (5);
        nextPoint.position.Set (nodeRect.GetSize ().width, 20);

        node.prevLinkPoint.svg = previousPoint;
        node.nextLinkPoint.svg = nextPoint;
        
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

    ConnectNode (from, destination)
    {
        let link = { svg : new SVGCurve (), previous : from, next : destination };
        this.svg.AddChild (link.svg);
        this.links.push (link);
        link.svg.element.classList.add ("link");

        let fromTranslate = from.svg.GetTransform ().translate;
        let fromLinkPoint = from.nextLinkPoint.svg.position.Get ();

        let startX = fromTranslate.x + fromLinkPoint.x;
        let startY = fromTranslate.y + fromLinkPoint.y;

        let destTranslate = destination.svg.GetTransform ().translate;
        let destLinkPoint = destination.prevLinkPoint.svg.position.Get ();

        let endX = destTranslate.x + destLinkPoint.x;
        let endY = destTranslate.y + destLinkPoint.y;

        link.svg.Set (startX, startY, endX, endY, startX, endY, endX, startY);
        this.graph.AddEdge ({ prev : from.id, next : destination.id});
    }

    FindNodeFromElement (element)
    {
        for (let node of this.nodes)
        {
            if (node.svg.element === element)
            {
                return node;
            }
        }

        return null;
    }

    StartDrag (target, mouseX, mouseY)
    {
        this.lastMousePosition.x = mouseX;
        this.lastMousePosition.y = mouseY;

        if (target.classList.contains ("background"))
        {
            this.dragTarget = this.svg;
        }
        else if (target.classList.contains ("link-point") && target.classList.contains ("next"))
        {
            let node = this.FindNodeFromElement (target.parentElement);
            this.dragTarget = node.prevLinkPoint;
        }
        else if (target.parentElement.classList.contains ("node"))
        {
            this.dragTarget = this.FindNodeFromElement (target.parentElement);
        }
    }

    EndDrag (target, mouseX, mouseY)
    {
        if (this.dragTarget === null)
        {
            return;
        }

        this.lastMousePosition.x = mouseX;
        this.lastMousePosition.y = mouseY;
    
        if (target.classList.contains ("link-point") && target.classList.contains ("previous"))
        {
            let destinationNode = this.FindNodeFromElement (target.parentElement);
            this.ConnectNode (this.dragTarget.node, destinationNode);
        }

        this.dragTarget = null;
    }

    Drag (mouseX, mouseY)
    {
        if (this.dragTarget === null)
        {
            return;
        }

        let mouseMoveX = mouseX - this.lastMousePosition.x;
        let mouseMoveY = mouseY - this.lastMousePosition.y;

        this.lastMousePosition.x = mouseX;
        this.lastMousePosition.y = mouseY;

        if (this.dragTarget.constructor === SVG)
        {
            let viewBox = this.svg.GetViewBox ();
            viewBox.x -= mouseMoveX;
            viewBox.y -= mouseMoveY;
            this.svg.SetViewBox (viewBox.x, viewBox.y, viewBox.width, viewBox.height);
        }
        else if (this.dragTarget.constructor === Node)
        {
            let moveNode = this.dragTarget;
            let transform = moveNode.svg.GetTransform ();
            transform.translate.x += mouseMoveX;
            transform.translate.y += mouseMoveY;

            moveNode.svg.SetTransform (transform);

            for (let link of this.links)
            {
                if (moveNode === link.previous)
                {
                    let fromTranslate = moveNode.svg.GetTransform ().translate;
                    let fromLinkPoint = moveNode.nextLinkPoint.svg.position.Get ();

                    let startX = fromTranslate.x + fromLinkPoint.x;
                    let startY = fromTranslate.y + fromLinkPoint.y;

                    let curve = link.svg.GetInfo ();

                    let endX = curve.end.x;
                    let endY = curve.end.y;

                    link.svg.Set (startX, startY, endX, endY, startX, endY, endX, startY);
                }
                else if (moveNode === link.next)
                {
                    let toTranslate = moveNode.svg.GetTransform ().translate;
                    let toLinkPoint = moveNode.prevLinkPoint.svg.position.Get ();

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

    Zoom (wheelDelta)
    {
        let direcion = Math.sign (wheelDelta);

        let viewBox = this.svg.GetViewBox ();
        let aspectRatio = viewBox.width / viewBox.height;
    
        viewBox.width += 100 * aspectRatio * direcion;
        viewBox.height += 100 * direcion;
    
        this.svg.SetViewBox (viewBox.x, viewBox.y, viewBox.width, viewBox.height);
    }
}

window.addEventListener ("load", function ()
{
    var svg = new SVG ("svg");
    var graph = new EventGraph ();
    var editor = new NodeEditor (svg, graph);

    window.addEventListener ("resize", function ()
    {
        let viewBox = svg.GetViewBox ();
        svg.SetViewBox (viewBox.x, viewBox.y, window.innerWidth, window.innerHeight);
    });

    document.getElementById ("local-file-input").addEventListener ("change", function (event)
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
    });

    document.getElementById ("read-csv-button").addEventListener ("click", function ()
    {
        document.getElementById ("local-file-input").click ();
    });

    document.getElementById ("save-csv-button").addEventListener ("click", function ()
    {
        let csv = graph.SaveCSV ();
        let download = document.getElementById ("file-download");
        download.setAttribute ("href", encodeURI ("data:text/csv;charset=utf-8," + csv));
        download.setAttribute ("download", "result.csv");
        download.click ();
    });
});