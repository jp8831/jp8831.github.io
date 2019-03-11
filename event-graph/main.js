/************
*    SVG    *
************/

class SVGElement
{
    constructor (name)
    {
        if (new.target === SVGElement)
        {
            throw Error ("Cannot create an instance of SVGElement.");
        }

        this.element = name ? document.createElementNS ("http://www.w3.org/2000/svg", name) : null;
    }

    Attribute (name, value)
    {
        if (name === undefined)
        {
            return;
        }

        if (value === undefined)
        {
            return this.element.getAttribute (name);
        }

        if (value === null)
        {
            this.element.removeAttribute (name);
            return this;
        }

        this.element.setAttribute (name, value);
        return this;
    }

    BoundingRect ()
    {
        return this.element.getBoundingClientRect ();
    }

    Fill (color)
    {
        this.element.style.fill = color;
        return this;
    }

    FillOpacity (opacity)
    {
        this.element.style.fillOpacity = opacity;
        return this;
    }

    Stroke (color)
    {
        this.element.style.stroke = color;
        return this;
    }

    StrokeWidth (width)
    {
        this.element.style.strokeWidth = width;
        return this;
    }
}

class SVGChild extends SVGElement
{
    constructor (name)
    {
        if (new.target === SVGChild)
        {
            throw new Error ("Cannot create an instance of SVGChild.");
        }

        super (name);
        this.parent = null;
    }

    Position (x, y)
    {
        if (x === undefined)
        {
            return {
                x : Number (this.Attribute ("x")),
                y : Number (this.Attribute ("y"))
            };
        }

        if (y === undefined)
        {
            this.Attribute ("x", x);
            return this;
        }

        this.Attribute ("x", x);
        this.Attribute ("y", y);
        return this;
    }

    Center (x, y)
    {
        if (x === undefined)
        {
            return {
                x : Number (this.Attribute ("cx")),
                y : Number (this.Attribute ("cy"))
            };
        }

        if (y === undefined)
        {
            this.Attribute ("cx", x);
            return this;
        }

        this.Attribute ("cx", x);
        this.Attribute ("cy", y);
        return this;
    }
}

class SVGRectangle extends SVGChild
{
    constructor (width, height)
    {
        super ("rect");
        this.Size (width, height);
    }

    Width (width)
    {
        if (width === undefined)
        {
            return Number (this.Attribute ("width"));
        }

        this.Attribute ("width", width);
        return this;
    }

    Height (height)
    {
        if (height === undefined)
        {
            return Number (this.Attribute ("height"));
        }

        this.Attribute ("height", height);
        return this;
    }

    Size (width, height)
    {
        if (width === undefined)
        {
            return {
                width : Number (this.Attribute ("width")),
                height : Number (this.Attribute ("height"))
            };
        }

        if (height === undefined)
        {
            this.Attribute ("width", width);
            return this;
        }

        this.Attribute ("width", width);
        this.Attribute ("height", height);
        return this;
    }

    Radius (x, y)
    {
        if (x === undefined)
        {
            return {
                x : Number (this.Attribute ("rx")),
                y : Number (this.Attribute ("ry"))
            };
        }

        if (y === undefined)
        {
            this.Attribute ("rx", x);
            return this;
        }

        this.Attribute ("rx", x);
        this.Attribute ("ry", y);
        return this;
    }
}

class SVGCircle extends SVGChild
{
    constructor (radius)
    {
        super ("circle");
        this.Radius (radius);
    }

    Radius (radius)
    {
        if (radius === undefined)
        {
            return Number (this.Attribute ("r"));
        }

        this.Attribute ("r", radius);
        return this;
    }
}

class SVGEllipse extends SVGChild
{
    constructor (radiusX, radiusY)
    {
        super ("circle");
        this.Radius (radiusX, radiusY);
    }

    RadiusX (radius)
    {
        if (radius === undefined)
        {
            return Number (this.Attribute ("rx"));
        }

        this.Attribute ("rx", radius);
        return this;
    }

    RadiusY (radius)
    {
        if (radius === undefined)
        {
            return Number (this.Attribute ("ry"));
        }

        this.Attribute ("ry", radius);
        return this;
    }

    Radius (radiusX, radiusY)
    {
        if (radiusX === undefined)
        {
            return {
                x : Number (this.Attribute ("rx")),
                y : Number (this.Attribute ("ry"))
            };
        }

        if (radiusY === undefined)
        {
            this.Attribute ("rx", radiusX);
            return this;
        }

        this.Attribute ("rx", radiusX);
        this.Attribute ("ry", radiusY);
        return this;
    }
}

class SVGLine extends SVGChild
{
    constructor (startX, startY, endX, endY)
    {
        super ("line");
        this.Start (startX, startY).End (endX, endY);
    }

    Start (x, y)
    {
        if (x === undefined)
        {
            return {
                x : Number (this.Attribute ("x1")),
                y : Number (this.Attribute ("y1"))
            };
        }

        if (y === undefined)
        {
            this.Attribute ("x1", x);
            return this;
        }

        this.Attribute ("x1", x);
        this.Attribute ("y1", y);
        return this;
    }

    End (x, y)
    {
        if (x === undefined)
        {
            return {
                x : Number (this.Attribute ("x2")),
                y : Number (this.Attribute ("y2"))
            };
        }

        if (y === undefined)
        {
            this.Attribute ("x2", x);
            return this;
        }

        this.Attribute ("x2", x);
        this.Attribute ("y2", y);
        return this;
    }
}

class SVGPath extends SVGChild
{
    constructor (data)
    {
        super ("path");
        this.Attribute ("d", data);
    }

    Data ()
    {
        let data = this.Attribute ("d");
        return data ? data : "";
    }

    MoveTo (x, y)
    {
        this.Attribute ("d", this.Data () + ` M ${x} ${y}`);
        return this;
    }

    LineTo (x, y)
    {
        this.Attribute ("d", this.Data () + ` L ${x} ${y}`);
        return this;
    }

    HorizontalLineTo (x)
    {
        this.Attribute ("d", this.Data () + ` H ${x}`);
        return this;
    }

    VerticalLineTo (y)
    {
        this.Attribute ("d", this.Data () + ` V ${y}`);
        return this;
    }

    CurveTo (x, y, control1X, control1Y, control2X, control2Y)
    {
        this.Attribute ("d", this.Data () + ` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${x} ${y}`);
        return this;
    }

    SmoothCurveTo (x, y, controlX, controlY)
    {
        this.Attribute ("d", this.Data () + ` S ${controlX} ${controlY}, ${x} ${y}`);
        return this;
    }

    QuadraticCurveTo (x, y, controlX, controlY)
    {
        this.Attribute ("d", this.Data () + ` Q ${controlX} ${controlY}, ${x} ${y}`);
        return this;
    }

    SmoothQuadraticCurveTo (x, y)
    {
        this.Attribute ("d", this.Data () + ` T ${x} ${y}`);
        return this;
    }

    ArcTo (x, y, radiusX, radiusY, xAxisRotation = 0, isLargeArc = false, isClockwise = true)
    {
        this.Attribute ("d", this.Data () + ` A ${radiusX} ${radiusY}, ${xAxisRotation}, ${isLargeArc ? 1 : 0}, ${isClockwise ? 1 : 0}, ${x} ${y}`);
        return this;
    }

    Close ()
    {
        this.Attribute ("d", this.Data () + " Z");
    }
}

class SVGText extends SVGChild
{
    constructor (string)
    {
        super ("text");
        this.element.innerHTML = string;
    }

    String (string)
    {
        if (string === undefined)
        {
            return this.element.innerHTML;
        }

        this.element.innerHTML = string;
    }
}

class SVGParent extends SVGElement
{
    constructor (name)
    {
        if (new.target === SVGParent)
        {
            throw new Error ("Cannot create an instance of SVGParent.");
        }

        super (name);
        this.children = [];
    }

    Add (child)
    {
        if (this.children.includes (child))
        {
            return;
        }

        if (child.parent)
        {
            child.parent.Remove (child);
        }

        this.element.appendChild (child.element);
        this.children.push (child);

        child.parent = this;
    }

    Remove (child)
    {
        let index = this.children.indexOf (child);

        if (index === -1)
        {
            return null;
        }

        this.element.removeChild (child.element);
        this.children.splice (index, 1);

        child.parent = null;

        return child;
    }

    FindByElement (element)
    {
        for (let child of this.children)
        {
            if (child.element === element)
            {
                return child;
            }
        }

        return null; 
    }

    Rectangle (width, height)
    {
        let rectangle = new SVGRectangle (width, height);
        this.Add (rectangle);
        return rectangle;
    }

    Circle (radius)
    {
        let circle = new SVGCircle (radius);
        this.Add (circle);
        return circle;
    }

    Ellipse (radiusX, radiusY)
    {
        let ellipse = new SVGEllipse (radiusX, radiusY);
        this.Add (ellipse);
        return ellipse;
    }

    Line (startX, startY, endX, endY)
    {
        let line = new SVGLine (startX, startY, endX, endY);
        this.Add (line);
        return line;
    }

    Path (data)
    {
        let path = new SVGPath (data);
        this.Add (path);
        return path;
    }

    Text (string)
    {
        let text = new SVGText (string);
        this.Add (text);
        return text;
    }
}

class SVGGroup extends SVGParent
{
    constructor ()
    {
        super ("g");
        this.Attribute ("transform", "scale(1,1) rotate(0) translate(0,0)");
    }

    Translate (x, y)
    {
        var regEx = /translate\(.*?\)/;
        if (x === undefined)
        {
            let translate = this.Attribute ("transform").match (regEx)[0];
            translate = translate.substring (translate.indexOf ("(") + 1, translate.indexOf (")")).split (",");
            return {
                x : Number (translate[0]),
                y : Number (translate[1])
            };
        }
        else if (y === undefined)
        {
            this.Attribute ("transform", this.Attribute ("transform").replace (regEx, `translate(${x},${this.Scale ().y})`));
            return this;
        }
        this.Attribute ("transform", this.Attribute ("transform").replace (regEx, `translate(${x},${y})`));
        return this;
    }

    Rotate (angle)
    {
        var regEx = /rotate\(.*?\)/;
        if (angle === undefined)
        {
            let rotate = this.Attribute ("transform").match (regEx)[0];
            return Number (rotate.substring (rotate.indexOf ("(") + 1, rotate.indexOf (")")));
        }
        this.Attribute ("transform", this.Attribute ("transform").replace (regEx, `rotate(${angle})`));
        return this;
    }

    Scale (x, y)
    {
        var regEx = /scale\(.*?\)/;
        if (x === undefined)
        {
            let scale = this.Attribute ("transform").match (regEx)[0];
            scale = scale.substring (scale.indexOf ("(") + 1, scale.indexOf (")")).split (",");
            return {
                x : Number (scale[0]),
                y : Number (scale[1])
            };
        }
        else if (y === undefined)
        {
            this.Attribute ("transform", this.Attribute ("transform").replace (regEx, `scale(${x},${this.Scale ().y})`));
            return this;
        }
        this.Attribute ("transform", this.Attribute ("transform").replace (regEx, `scale(${x},${y})`));
        return this;
    }
}

SVGParent.prototype.Group = function ()
{
    let group = new SVGGroup ();
    this.Add (group);
    return group;
};

class SVG extends SVGParent
{
    constructor (id)
    {
        super ();
        this.element = document.getElementById (id);

        this.backgroundElement = this.element.getElementsByClassName ("background")[0];
    }

    GetViewBox ()
    {
        let viewBox = this.Attribute ("viewBox").split (" ").map (value => Number (value));
        return {
            x : viewBox[0],
            y : viewBox[1],
            width : viewBox[2],
            height : viewBox[3]
        };
    }

    SetViewBox (x, y, width, height)
    {
        this.Attribute ("viewBox", [x, y, width, height].join (" "));
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

            let previousEventIds = [];
            let nextEventIds = [];

            for (let edge of this.edges)
            {
                if (edge.next === vertex.id && previousEventIds.includes (edge.prev) === false)
                {
                    previousEventIds.push (edge.prev);
                }
                else if (edge.prev === vertex.id && nextEventIds.includes (edge.next) === false)
                {
                    nextEventIds.push (edge.next);
                }
            }

            previousEventIds = previousEventIds.length > 0 ? previousEventIds.join (" ") : "null";
            nextEventIds = nextEventIds.length > 0 ? nextEventIds.join (" ") : "null";

            csv += [vertex.id, vertex.subject, vertex.action, vertex.object, previousEventIds, nextEventIds].join (",");
        }

        return csv;
    }
}

/********************
*    Node Editor    *
********************/

class NodePin
{
    constructor (node)
    {
        this.node = node;
        this.svg = null;
    }
}

class Node
{
    constructor (id, svg)
    {
        this.id = id;
        this.svg = svg;

        this.prevPin = new NodePin (this);
        this.nextPin = new NodePin (this);
    }
}

class NodeLink
{
    constructor (svg)
    {
        this.svg = svg;

        this.startNode = null;
        this.endNode = null;
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
        this.svgLinkLayer = svg.Group ();
        this.svgNodeLayer = svg.Group ();

        this.svg.SetViewBox (0, 0, window.innerWidth, window.innerHeight);

        this.svg.element.onmousedown = (event) => { event.preventDefault (); this.StartDrag (event.target, event.clientX, event.clientY); };
        this.svg.element.onmousemove = (event) => { event.preventDefault (); this.Drag (event.clientX, event.clientY); };
        this.svg.element.onmouseup = (event) => { event.preventDefault (); this.EndDrag (event.target, event.clientX, event.clientY); };
        this.svg.element.onmouseleave = (event) => { event.preventDefault (); this.EndDrag (event.target, event.clientX, event.clientY); };
        this.svg.element.onmousewheel = (event) => { event.preventDefault (); this.Zoom (event.wheelDelta); };
    }

    CreateNode (id, subject, action, object)
    {
        let node = new Node (id, this.svgNodeLayer.Group ());
        node.svg.element.classList.add ("node");

        this.nodes.push (node);
        
        let nodeRect = node.svg.Rectangle (100, 110).Radius (5, 5);
        let subjectTextWidth = node.svg.Text (subject).Position (20, 50).BoundingRect ().width;
        let actionTextWidth = node.svg.Text (action).Position (20, 70).BoundingRect ().width;
        let objectTextWidth = node.svg.Text (object).Position (20, 90).BoundingRect ().width;
    
        nodeRect.Width (Math.max (100, subjectTextWidth, actionTextWidth, objectTextWidth) + 40);

        node.prevPin.svg = node.svg.Circle (5).Center (0, 20);
        node.prevPin.svg.element.classList.add ("link-point", "previous");

        node.nextPin.svg = node.svg.Circle (5).Center (nodeRect.Width (), 20);
        node.nextPin.svg.element.classList.add ("link-point", "next");
        
        node.svg.Text ("Previous").Position (10, 25);
        node.svg.Text ("Next").Position (nodeRect.Width () - 45, 25);

        return node;
    }

    DeleteNode ()
    {

    }

    FindNodeByElement (element)
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
            let link = new NodeLink (this.svgLinkLayer.Path ());
            link.svg.element.classList.add ("link");
            link.startNode = this.FindNodeByElement (target.parentElement);
            
            this.dragTarget = link;
        }
        else if (target.parentElement.classList.contains ("node"))
        {
            this.dragTarget = this.FindNodeByElement (target.parentElement);
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
            let startNode = this.dragTarget.startNode;

            let startNodePos = startNode.svg.Translate ();
            let startPinPos = startNode.nextPin.svg.Center ();

            let startX = startNodePos.x + startPinPos.x;
            let startY = startNodePos.y + startPinPos.y;

            let endNode = this.FindNodeByElement (target.parentElement);

            let endNodePos = endNode.svg.Translate ();
            let endPinPos = endNode.prevPin.svg.Center ();

            let endX = endNodePos.x + endPinPos.x;
            let endY = endNodePos.y + endPinPos.y;

            this.dragTarget.endNode = endNode;
            this.dragTarget.svg.Attribute ("d", null);
            this.dragTarget.svg.MoveTo (startX, startY).CurveTo (endX, endY, startX, endY, endX, startY);

            this.links.push (this.dragTarget);
            this.graph.AddEdge ({ prev : startNode.id, next : endNode.id});
        }
        else if (this.dragTarget.constructor === NodeLink)
        {
            this.svgLinkLayer.Remove (this.dragTarget.svg);
            delete this.dragTarget;
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
            let translate = moveNode.svg.Translate ();

            moveNode.svg.Translate (translate.x + mouseMoveX, translate.y + mouseMoveY);

            for (let link of this.links)
            {
                if (moveNode === link.startNode || moveNode === link.endNode)
                {
                    let startNodePosition = link.startNode.svg.Translate ();
                    let startPinPosition = link.startNode.nextPin.svg.Center ();
            
                    let startX = startNodePosition.x + startPinPosition.x;
                    let startY = startNodePosition.y + startPinPosition.y;
            
                    let endNodePosition = link.endNode.svg.Translate ();
                    let endPinPosition = link.endNode.prevPin.svg.Center ();
            
                    let endX = endNodePosition.x + endPinPosition.x;
                    let endY = endNodePosition.y + endPinPosition.y;
            
                    link.svg.Attribute ("d", null);
                    link.svg.MoveTo (startX, startY).CurveTo (endX, endY, startX, endY, endX, startY);
                }
            }
        }
        else if (this.dragTarget.constructor === NodeLink)
        {
            let startNode = this.dragTarget.startNode;

            let startNodePos = startNode.svg.Translate ();
            let startPinPos = startNode.nextPin.svg.Center ();

            let startX = startNodePos.x + startPinPos.x;
            let startY = startNodePos.y + startPinPos.y;

            let viewBox = this.svg.GetViewBox ();
            
            let endX = this.lastMousePosition.x * viewBox.width / window.innerWidth + viewBox.x;
            let endY = this.lastMousePosition.y * viewBox.height / window.innerHeight + viewBox.y;

            this.dragTarget.svg.Attribute ("d", null);
            this.dragTarget.svg.MoveTo (startX, startY).CurveTo (endX, endY, startX, endY, endX, startY);
        }
    }

    Zoom (wheelDelta)
    {
        let direcion = Math.sign (wheelDelta);

        let viewBox = this.svg.GetViewBox ();
        let aspectRatio = viewBox.width / viewBox.height;
    
        viewBox.width += 100 * aspectRatio * direcion;
        viewBox.height += 100 * direcion;

        viewBox.width = Math.max (viewBox.width, aspectRatio);
        viewBox.height = Math.max (viewBox.height, 1);
    
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
                    let translate = node.svg.Translate ();
                    translate.x = lastNode.svg.BoundingRect ().right + 20;
                    node.svg.Translate (lastNode.svg.BoundingRect ().right + 20);
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