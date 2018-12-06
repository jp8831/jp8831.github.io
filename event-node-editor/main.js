var eventGraph = {
    vertices : [],
    edges : []
}

var svg;

var transitionPath = null;

var draggingElement = null;
var lastMousePosition = { x : 0, y : 0};

window.onload = function ()
{
    svg = document.getElementById ("svg");
    svg.setAttribute ("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);

    svg.onmousedown = StartDrag;
    svg.onmousemove = WhenDrag;
    svg.onmouseup = EndDrag;
    svg.onmouseleave = EndDrag;

   document.getElementById ("local-file-input").onchange = function (event)
   {
       let reader = new FileReader ();
       reader.onload = function (event) { ReadCSV (event.target.result); };
       reader.readAsText (event.target.files[0]);
   };

   document.getElementById ("read-csv-button").onclick = function ()
   {
       document.getElementById ("local-file-input").click ();
   }
}

window.onresize = function ()
{
    let viewBox = GetViewBox ();
    SetViewBox (viewBox.x, viewBox.y, window.innerWidth, window.innerHeight);
}

/**************
*    Graph    *
**************/

function AddGraphVertex (vertex)
{
    if (eventGraph.vertices.includes (vertex))
    {
        return;
    }
    eventGraph.vertices.push (vertex);
}

function RemoveGraphVertex (vertex)
{
    if (!eventGraph.vertices.includes (vertex))
    {
        return;
    }
    eventGraph.vertices.splice (eventGraph.vertices.indexOf(vertex), 1);
}

function AddGraphEdge (fromIndex, toIndex, path)
{
    for (let edge of eventGraph.edges)
    {
        if (edge.from === fromIndex && edge.to === toIndex)
        {
            return;
        }
    }
    eventGraph.edges.push ({ from : fromIndex, to : toIndex, path : path });
}

/***************************
*    Graph Visualization   *
***************************/

function CreateEventNode (id, subject, action, object)
{
    let eventNode = CreateSVGElement ("g");
    eventNode.setAttribute ("id", "node" + id);
    SetEventNodeTransform (eventNode, 0, 0);
    
    let subjectText = CreateSVGText (subject);
    SetSVGElementPosition (subjectText, 30, 30);

    let actiontText = CreateSVGText (action);
    SetSVGElementPosition (actiontText, 30, 55);

    let objectText = CreateSVGText (object);
    SetSVGElementPosition (objectText, 30, 80);

    let maxTextWidth = subjectText.getBoundingClientRect ().width;
    maxTextWidth = Math.max (actiontText.getBoundingClientRect ().width, maxTextWidth);
    maxTextWidth = Math.max (objectText.getBoundingClientRect ().width, maxTextWidth);

    let nodeRect = CreateSVGRect (maxTextWidth + 60, 100, 5, 5);
    nodeRect.classList.add ("node-rect");
    SetSVGElementStyle (nodeRect, "white", "black", 3);
    SetSVGElementPosition (nodeRect, 0, 0);

    let leftLine = CreateSVGLine (20, 0, 20, 100);
    SetSVGElementStrokeColor (leftLine, "black");
    SetSVGElementStrokeWidth (leftLine, 3);

    let rightLine = CreateSVGLine (maxTextWidth + 40, 0, maxTextWidth + 40, 100);
    SetSVGElementStrokeColor (rightLine, "black");
    SetSVGElementStrokeWidth (rightLine, 3);

    let previousPoint = CreateSVGCircle (5);
    previousPoint.classList.add ("transition-point");
    SetSVGElementCirclePosition (previousPoint, 10, 50);
    SetSVGElementColor (previousPoint, "black");

    let nextPoint = CreateSVGCircle (5);
    nextPoint.classList.add ("transition-point");
    SetSVGElementCirclePosition (nextPoint, maxTextWidth + 50, 50);
    SetSVGElementColor (nextPoint, "black");

    eventNode.appendChild (nodeRect);
    eventNode.appendChild (subjectText);
    eventNode.appendChild (actiontText);
    eventNode.appendChild (objectText);
    eventNode.appendChild (leftLine);
    eventNode.appendChild (previousPoint);
    eventNode.appendChild (rightLine);
    eventNode.appendChild (nextPoint);

    return eventNode;
}

/************
*    CSV    *
************/

function ReadCSV (csv)
{
    csv = csv.split ("\n").slice (1);
    csv = csv.map (line => line.split (","));

    let previousNode = null;
    csv.forEach (function (line, index) {
        let event = { id : index, subject : line[0], action : line[1], object : line[2] };
        AddGraphVertex (event);

        let node = CreateEventNode (event.id, event.subject, event.action, event.object);
        event.node = node;

        let x = 0;
        let y = 0;

        if (previousNode !== null)
        {
            x = previousNode.getBoundingClientRect ().right + 15;
            y = previousNode.getBoundingClientRect ().top;

            if (previousNode.getBoundingClientRect ().right >= window.innerWidth)
            {
                x = 0;
                y = previousNode.getBoundingClientRect ().bottom + 100;
            }
        }

        SetEventNodeTransform (node, x, y);
        previousNode = node;
    });
}

/****************
*    Dragging    *
****************/

function GetViewBox ()
{
    let viewBox = svg.getAttribute ("viewBox").split (" ").map (value => Number (value));
    return { x : viewBox[0], y : viewBox[1], width : viewBox[2], height : viewBox[3] };
}

function SetViewBox (x, y, width, height)
{
    svg.setAttribute ("viewBox", [x, y, width, height].join (" "));
}

function SetEventNodeTransform (eventNode, x, y)
{
    let translate = "translate(" + x + "," + y + ")";
    eventNode.setAttribute ("transform", translate);
}

function StartDrag (event)
{
    UpdateLastMousePosition (event.clientX, event.clientY);
    draggingElement = event.target;

    if (draggingElement.classList.contains ("transition-point"))
    {
        let elementRect = draggingElement.getBoundingClientRect ();
        let x = elementRect.left + elementRect.width / 2;
        let y = elementRect.top + elementRect.height / 2; 
        transitionPath = CreateSVGBezierCurve (x, y, lastMousePosition.x, lastMousePosition.y);
    }
}

function WhenDrag (event)
{
    if (draggingElement === null)
    {
        return;
    }

    let viewBox = GetViewBox ();
    let mouseMove = GetMouseMovement (event.clientX, event.clientY);
    UpdateLastMousePosition (event.clientX, event.clientY);

    if (draggingElement === svg)
    {
        let viewBox = svg.getAttribute ("viewBox").split (" ");
        viewBox[0] = Number (viewBox[0]) + mouseMove.x;
        viewBox[1] = Number (viewBox[1]) + mouseMove.y;
        svg.setAttribute ("viewBox", viewBox.join (" "));
    }

    if (draggingElement.classList.contains ("node-rect"))
    {
        let node = draggingElement.parentElement;
        let x = node.getBoundingClientRect ().left + mouseMove.x + viewBox.x;
        let y = node.getBoundingClientRect ().top + mouseMove.y + viewBox.y;
        SetEventNodeTransform (node, x, y);

        let id = draggingElement.parentElement.id.substr (4);
        for (let edge of eventGraph.edges)
        {
            let curve = GetSVGBezierCurve (edge.path);
            console.log (curve);

            if (id === edge.from)
            {
                curve.start.x += mouseMove.x;
                curve.start.y += mouseMove.y;
            }
            else if (id === edge.to)
            {
                curve.end.x += mouseMove.x;
                curve.end.y += mouseMove.y;
            }

            SetSVGBezierCurve (edge.path, curve.start.x, curve.start.y, curve.end.x, curve.end.y);
        }
    }

    if (draggingElement.classList.contains ("transition-point"))
    {
        let elementRect = draggingElement.getBoundingClientRect ();
        let x = elementRect.left + elementRect.width / 2 + viewBox.x;
        let y = elementRect.top + elementRect.height / 2 + viewBox.y; 
        SetSVGBezierCurve (transitionPath, x, y, lastMousePosition.x + viewBox.x, lastMousePosition.y + viewBox.y);
    }
}

function EndDrag (event)
{
    if (draggingElement === null)
    {
        return;
    }

    if (draggingElement.classList.contains ("transition-point") && event.target.classList.contains ("transition-point"))
    {
        let fromId = draggingElement.parentElement.id.substr (4);
        let toId = event.target.parentElement.id.substr (4);

        AddGraphEdge (fromId, toId, transitionPath);

        let viewBox = GetViewBox ();

        let startRect = draggingElement.getBoundingClientRect ();
        let startX = startRect.left + startRect.width / 2 + viewBox.x;
        let startY = startRect.top + startRect.height / 2 + viewBox.y;

        let endRect = event.target.getBoundingClientRect ();
        let endX = endRect.left + endRect.width / 2 + viewBox.x;
        let endY = endRect.top + endRect.height / 2 + viewBox.y;

        SetSVGBezierCurve (transitionPath, startX, startY, endX, endY);

        transitionPath = null;
    }
    else if (transitionPath !== null)
    {
        transitionPath.remove ();
    }

    draggingElement = null;
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

/************
*    SVG    *
************/

function SetSVGElementPosition (svgElement, x, y)
{
    svgElement.setAttribute ("x", x);
    svgElement.setAttribute ("y", y);
}

function SetSVGElementCirclePosition (svgElement, x, y)
{
    svgElement.setAttribute ("cx", x);
    svgElement.setAttribute ("cy", y);
}

function GetSVGBezierCurve (svgBezierCurve)
{
    let curve = svgBezierCurve.getAttribute ("d").replace (",", "").split (" ");
    return {
        start : { x : Number (curve[1]), y : Number (curve[2]) },
        end : { x : Number (curve[8]), y : Number (curve[9]) }
    }
}

function SetSVGBezierCurve (svgBezierCurve, startX, startY, endX, endY)
{
    let start = startX + " " + startY;
    let control1 = endX + " " + startY;
    let control2 = startX + " " + endY;
    let end = endX + " " + endY;
    svgBezierCurve.setAttribute ("d", "M " + start + " C " + control1 + ", " + control2 + ", " + end);
}

function SetSVGElementStyle (svgElement, color, strokeColor, strokeWidth)
{
    SetSVGElementColor (svgElement, color);
    SetSVGElementStrokeColor (svgElement, strokeColor);
    SetSVGElementStrokeWidth (svgElement, strokeWidth);
}

function SetSVGElementColor (svgElement, color)
{
    svgElement.setAttribute ("fill", color);
}

function SetSVGElementStrokeColor (svgElement, strokeColor)
{
    svgElement.setAttribute ("stroke", strokeColor);
}

function SetSVGElementStrokeWidth (svgElement, strokeWidth)
{
    svgElement.setAttribute ("stroke-width", strokeWidth);
}

function CreateSVGRect (width, height, rx = 0, ry = 0)
{
    let svgRect = CreateSVGElement ("rect");
    svgRect.setAttribute ("width", width);
    svgRect.setAttribute ("height", height);
    svgRect.setAttribute ("rx", rx);
    svgRect.setAttribute ("ry", ry);
    return svgRect;
}

function CreateSVGText (text)
{
    let svgText = CreateSVGElement ("text");
    svgText.innerHTML = text;
    return svgText;
}

function CreateSVGLine (startX, startY, endX, endY)
{
    let svgLine = CreateSVGElement ("line");
    svgLine.setAttribute ("x1", startX);
    svgLine.setAttribute ("y1", startY);
    svgLine.setAttribute ("x2", endX);
    svgLine.setAttribute ("y2", endY);
    return svgLine;
}

function CreateSVGCircle (radius)
{
    let svgCircle = CreateSVGElement ("circle");
    svgCircle.setAttribute ("r", radius);
    return svgCircle;
}

function CreateSVGBezierCurve (startX, startY, endX, endY)
{
    let svgBezierCurve = CreateSVGElement ("path");
    SetSVGElementStyle (svgBezierCurve, "transparent", "black", 3);
    SetSVGBezierCurve (svgBezierCurve, startX, startY, endX, endY);
    return svgBezierCurve;
}

function CreateSVGElement (name)
{
    let created = document.createElementNS ("http://www.w3.org/2000/svg", name);
    svg.appendChild (created);
    return created;
}

/*
var canvas2d;

var camera = {
    x : 0,
    y : 0,
    zoom : 1
};

var mouse = {
    x : 0,
    y : 0,
    isDown : false,
    isUp : false
};

var font = {
    family : "Arial",
    size : 12,
    weigth : "normal",
    style : "normal",
    align : "start",
    baseline : "top",
};

var graph = {
    vertices : [],
    edges : [],
    selectIndex : -1
};

window.onload = () =>
{
    document.getElementById ("local-file-input").onchange = (event) =>
    {
        let reader = new FileReader ();
        reader.onload = (event) => { ReadCSV (event.target.result); };
        reader.readAsText (event.target.files[0]);
    };

    document.getElementById ("read-csv-button").onclick = () =>
    {
        document.getElementById ("local-file-input").click ();
    }

    canvas2d = document.getElementById ("canvas-2d").getContext ("2d");

    canvas2d.canvas.onmousemove = (event) =>
    {
        let offsetX = event.clientX - mouse.x;
        let offsetY = event.clientY - mouse.y;

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        if (mouse.isDown)
        {
            ClearCanvas ();

            if (graph.selectIndex >= 0)
            {
                let startX = graph.vertices[graph.selectIndex].x - camera.x;
                let startY = graph.vertices[graph.selectIndex].y - camera.y;

                let endX = mouse.x;
                let endY = mouse.y;

                DrawBezierCurve (startX, startY, endX, endY);
            }
            else
            {
                camera.x += offsetX * 0.1;
                camera.y += offsetY * 0.1;
            }

            DrawGraph ();
        }
    };

    canvas2d.canvas.onmousedown = (event) =>
    {
        mouse.isDown = true;
        mouse.isUp = false;

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        SelectVertex (mouse.x, mouse.y);
    }

    canvas2d.canvas.onmouseup = (event) =>
    {
        mouse.isUp = true;
        mouse.isDown = false;

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        ClearCanvas ();

        if (graph.selectIndex >= 0)
        {
            let start = graph.selectIndex;

            SelectVertex (mouse.x, mouse.y);

            if (graph.selectIndex >= 0)
            {
                graph.edges.push ({
                    from : start,
                    to : graph.selectIndex
                });
            }
        }
        DrawGraph ();
    }

    SetCanvasResolution (window.innerWidth, window.innerHeight, 2, 2);
    SetTextFont ("Arail", 15);
}

window.onresize = () =>
{
    SetCanvasResolution (window.innerWidth, window.innerHeight, 2, 2);
    ClearCanvas ();
    DrawGraph ();
}

function DrawVertex (subject, action, object, x, y, width, height, padding)
{    
    let left = x;
    let top = y;
    let right = x + width;
    let bottom = y + height;

    DrawRoundedRect (left, top, right, bottom, 5, 3);
    
    DrawText (subject, left + padding, top + padding, width - padding * 2);
    DrawText (action, left + padding, top + font.size + padding * 2, width - padding * 2);
    DrawText (object, left + padding, top + font.size * 2 + padding * 3, width - padding * 2);
}

function DrawEdge (from, to)
{
    let startX = from.x + from.width - camera.x;
    let startY = from.y + from.height / 2 - camera.y;

    let endX = to.x - camera.x;
    let endY = to.y - camera.y;

    DrawBezierCurve (startX, startY, endX, endY);
}

function DrawGraph ()
{
    for (let edge of graph.edges) 
    {
        DrawEdge (graph.vertices[edge.from], graph.vertices[edge.to]);
    }
    
    for (let vertex of graph.vertices) 
    {
        let screenX = vertex.x - camera.x;
        let screenY = vertex.y - camera.y;

        DrawVertex (vertex.subject, vertex.action, vertex.object, screenX, screenY, vertex.width, vertex.height, 10);
    }
}

function SelectVertex (screenX, screenY)
{
    graph.selectIndex = -1;

    let x = camera.x + screenX;
    let y = camera.y + screenY;

    graph.vertices.forEach ((vertex, index) =>
    {
        let left = vertex.x;
        let top = vertex.y;
        let right = vertex.x + vertex.width;
        let bottom = vertex.y + vertex.height;

        if (x > left && x < right && y > top && y < bottom)
        {
            graph.selectIndex = index;
        }
    });
}

function ReadCSV (csv)
{
    csv = csv.split ("\n").slice (1);
    csv = csv.map (line => line.split (","));
    csv.forEach ((line, index) => {
        graph.vertices.push ({
            subject : line[0],
            action : line[1],
            object : line[2],
            x : 210 * index,
            y : 0,
            width : 200,
            height : 100
        });
    });

    ClearCanvas ();
    DrawGraph ();
}

function ClearCanvas ()
{
    canvas2d.clearRect (0, 0, canvas2d.canvas.width, canvas2d.canvas.height);
}

function SetCanvasResolution (width, height, widthScale = 1, heightScale = 1)
{
    canvas2d.canvas.width = Math.ceil (width * widthScale);
    canvas2d.canvas.height = Math.ceil (height * heightScale);
    canvas2d.scale (widthScale, heightScale);
}

function ConvertWordToCameraSpace (x, y)
{
    return [x - camera.x, y - camera.y];
}

function DrawRoundedRect (left, top, right, bottom, radius, lineWidth)
{
    canvas2d.lineWidth = lineWidth;
    canvas2d.beginPath ();
    canvas2d.moveTo (left, top + radius);

    canvas2d.lineTo (left, bottom - radius);
    canvas2d.arcTo (left, bottom, left + radius, bottom, radius);

    canvas2d.lineTo (right - radius, bottom);
    canvas2d.arcTo (right, bottom, right, bottom - radius, radius);

    canvas2d.lineTo (right, top + radius);
    canvas2d.arcTo (right, top, right - radius, top, radius);

    canvas2d.lineTo (left + radius, top);
    canvas2d.arcTo (left, top, left, top + radius, radius);

    canvas2d.stroke ();
}

function DrawBezierCurve (startX, startY, endX, endY, lineWidth)
{
    canvas2d.lineWidth = lineWidth;
    canvas2d.beginPath ();
    canvas2d.moveTo (startX, startY);
    canvas2d.bezierCurveTo (endX, startY, startX, endY, endX, endY);
    canvas2d.stroke ();
}

function DrawText (text, x, y, maxWidth)
{
    canvas2d.fillText (text, x, y, maxWidth);
}

function SetTextFont (family, size, weigth = "normal", style = "normal", align = "start", baseline = "top")
{
    font.family = family;
    font.size = size;
    font.weigth = weigth;
    font.style = style;
    font.align = align;
    font.baseline = baseline;

    canvas2d.font = style + " " + weigth + " " + (size + "px") + " " + family;
    canvas2d.textAlign = align;
    canvas2d.textBaseline = baseline;
}
*/