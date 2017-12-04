/****************
*   WebGL Core  *
****************/

function WebGL (canvas)
{
    this.canvas = canvas;
    this.context = null;
}

WebGL.prototype.Init = function ()
{
    let canvas = this.canvas;
    let context = null;

    if (!canvas)
    {
        return false;
    }

    context = canvas.getContext ("webgl");

    if (!context)
    {
        return false;
    }

    this.context = context;

    return true;
}

WebGL.prototype.EnableDepthTest = function ()
{
    let context = this.context;

    context.depthFunc (context.LEQUAL);
    context.enable (context.DEPTH_TEST);
}

WebGL.prototype.DisableDepthTest = function ()
{
    let context = this.context;

    context.disable (context.DEPTH_TEST);
}

WebGL.prototype.EnableBackFaceCulling = function ()
{
    let context = this.context;

    context.cullFace (context.BACK);
    context.enable (context.CULL_FACE);
}

WebGL.prototype.DisableBackFaceCulling = function ()
{
    let context = this.context;

    context.disable (context.CULL_FACE);
}

WebGL.prototype.Clear = function ()
{
    let context = this.context;

    context.clearColor (0.0, 0.0, 0.0, 1.0);
    context.clearDepth (1.0);

    context.clear (context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
}

function Buffer (context)
{
    this.buffer = null;
    this.context = context;
}

Buffer.prototype.Create = function ()
{
    let context = this.context;

    if (!context)
    {
        return false;
    }

    let buffer = context.createBuffer ();
    let isBufferInvalid = context.isBuffer (buffer);

    if (isBufferInvalid)
    {
        return false;
    }

    this.buffer = buffer;

    return true;
}

Buffer.prototype.SetData = function (data)
{
    let buffer = this.buffer;
    let context = this.context;

    context.bindBuffer (context.ARRAY_BUFFER, buffer);
    context.bufferData (context.ARRAY_BUFFER, new Float32Array (data), context.STATIC_DRAW);
}

Buffer.prototype.Delete = function ()
{
    let buffer = this.buffer;
    let context = this.context;

    context.deleteBuffer (buffer);

    this.buffer = null;
}

/**********************
*   Game Engine Core  *
**********************/

