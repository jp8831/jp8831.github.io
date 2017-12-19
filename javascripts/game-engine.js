/**************
*    WebGL    *
**************/

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

const UniformType = 
{
    Vector4 : 1,
    Matrix4: 2
}

function Shader (context)
{
    this.context = context;
    this.program = null;
    this.vertexShader = null;
    this.fragmentShader = null;
}

Shader.prototype.Init = function ()
{
    const CONTEXT = this.context;

    this.program = CONTEXT.createProgram ();
    this.vertexShader = CONTEXT.createShader (CONTEXT.VERTEX_SHADER);
    this.fragmentShader = CONTEXT.createShader (CONTEXT.FRAGMENT_SHADER);
}

Shader.prototype.Load = function (vertexSource, fragmentSource)
{
    const CONTEXT = this.context;

    // Compile
    const VERTEX_SHADER = this.vertexShader;

    CONTEXT.shaderSource (VERTEX_SHADER, vertexSource);
    CONTEXT.compileShader (this.vertexShader);

    const IS_VERTEX_COMPILE_FAILED = !CONTEXT.getShaderParameter (VERTEX_SHADER, CONTEXT.COMPILE_STATUS);

    if (IS_VERTEX_COMPILE_FAILED)
    {
        return false;
    }

    const FRAGMENT_SHADER = this.fragmentShader;

    CONTEXT.shaderSource (FRAGMENT_SHADER, fragmentSource);
    CONTEXT.compileShader (FRAGMENT_SHADER);

    const IS_FRAGMENT_COMPILE_FAILED = !CONTEXT.getShaderParameter (FRAGMENT_SHADER, CONTEXT.COMPILE_STATUS);

    if (IS_FRAGMENT_COMPILE_FAILED)
    {
        return false;
    }

    // Link
    const PROGRAM = this.program;

    CONTEXT.attachShader (PROGRAM, VERTEX_SHADER);
    CONTEXT.attachShader (PROGRAM, FRAGMENT_SHADER);
    CONTEXT.linkProgram (PROGRAM);

    const IS_LINK_FAILED = !CONTEXT.getProgramParameter (PROGRAM, CONTEXT.LINK_STATUS);

    if (IS_LINK_FAILED)
    {
        return false;
    }

    return true;
}

Shader.prototype.Delete = function ()
{
    const CONTEXT = this.context;
    const PROGRAM = this.program;
    const VERTEX_SHADER = this.vertexShader;
    const FRAGMENT_SHADER = this.fragmentShader;

    CONTEXT.detachShader (PROGRAM, VERTEX_SHADER);
    CONTEXT.detachShader (PROGRAM, FRAGMENT_SHADER);

    CONTEXT.deleteShader (VERTEX_SHADER);
    CONTEXT.deleteShader (PROGRAM, FRAGMENT_SHADER);

    CONTEXT.deleteProgram (PROGRAM);

    this.program = null;
    this.vertexShader = null;
    this.fragmentShader = null;
}

Shader.prototype.SetAttribute = function (attributeName, attributeBuffer, elementSize)
{
    const CONTEXT = this.context;
    const PROGRAM = this.program;
    const ATTRIBUTE_LOCATION = CONTEXT.getAttribLocation (PROGRAM, attributeName);

    CONTEXT.bindBuffer (CONTEXT.ARRAY_BUFFER, attributeBuffer.buffer);
    CONTEXT.enableAttribArray (ATTRIBUTE_LOCATION);
    CONTEXT.vertexAttribPointer (ATTRIBUTE_LOCATION, elementSize, CONTEXT.FLOAT, false, 0, 0);
}

Shader.prototype.SetUniform = function (uniformName, uniformData, uniformType)
{
    const CONTEXT = this.context;
    const PROGRAM = this.program;
    const UNIFORM_LOCATION = CONTEXT.getUniformLocation (PROGRAM, uniformName);

    switch (uniformType)
    {
        case UniformType.Vector4 :
        {
            CONTEXT.uniform4fv (UNIFORM_LOCATION, new Float32Array (uniformData));

            break;
        }

        case UniformType.Matrix4 :
        {
            CONTEXT.uniformMatrix4fv (UNIFORM_LOCATION, false, new Float32Array (uniformData));

            break;
        }
    }
}

/********************
*    Game Engine    *
********************/

function GameEngine ()
{

}

GameEngine.prototype.Init = function ()
{

}

GameEngine.prototype.Update = function ()
{

}

GameEngine.prototype.Render = function ()
{

}

GameEngine.prototype.Shutdown = function ()
{

}

const ResourceLoadingStatus = 
{
    Loading : 1,
    Finish : 2
}

const ResourceType = 
{
    ShaderSource : 1,
    MeshData : 2,
    Texture : 3
}

function ResourceLoader ()
{
    this.status = ResourceLoadingStatus.Finish;
    this.baseURL = "";
}

ResourceLoader.prototype.SetBaseURL = function (baseURL)
{
    this.baseURL = baseURL;
}

ResourceLoader.prototype.LoadResource = function (resourceType, resourceName)
{
    this.status = ResourceLoadingStatus.Loading;

    let resourceURI = this.baseURL;
    let responseType;

    switch (resourceType)
    {
        case ResourceType.ShaderSource :
        {
            resourceURI += "/shaders/" + resourceName;
            responseType = "text";

            break;
        }

        case ResourceType.MeshData :
        {
            resourceURI += "/meshes/" + resourceName;
            responseType = "text";
            
            break;
        }

        case ResourceType.Texture :
        {
            resourceURI += "/textures/" + resourceName;
            responseType = "arraybuffer";
            
            break;
        }
    }

    return this.MakeHTTPRequest (resourceURI, responseType);
}

ResourceLoader.prototype.MakeHTTPRequest = function (uri, responseType)
{
    let loader = this;
    
    return new Promise (function (resolve, reject)
    {
        let httpRequest = new XMLHttpRequest ();

        httpRequest.addEventListener ("load", function (event)
        {
            loader.status = ResourceLoadingStatus.Finish;
            resolve (this.response);
        });
    
        httpRequest.addEventListener ("abort", function (event)
        {
           reject (this.statusText); 
        });
    
        httpRequest.addEventListener ("error", function (event)
        {
           reject (this.statusText);
        });
    
        httpRequest.open ("GET", uri);
        httpRequest.responseType = responseType;
        httpRequest.send ();
    });
}

function Mesh ()
{

}

/*************
*    Math    *
*************/

var Vector3 =
{
    FromXYZ (x, y, z)
    {
        return [x, y, z];
    },

    FromVector4 (vector)
    {
        return [vector[0], vector[1], vector[2]] / vector[3];
    },

    Magnitude (vector)
    {
        return Math.sqrt ((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]));
    },

    SquaredMagnitude (vector)
    {
        return (vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]);
    },

    DotProduct (vectorA, vectorB)
    {
        return (vectorA[0] * vectorB[0]) + (vectorA[1] * vectorB[1]) + (vectorA[2] * vectorB[2]);
    },

    CrossProduct (vectorA, vectorB)
    {
        var x = (vectorA[1] * vectorB[2]) - (vectorA[2] * vectorB[1]);
        var y = (vectorA[2] * vectorB[0]) - (vectorA[0] * vectorB[2]);
        var z = (vectorA[0] * vectorB[1]) - (vectorA[1] * vectorB[0]);

        return [x, y, z];
    }
}

var Vector4 =
{
    FromXYZW (x, y, z, w)
    {
        return [x, y, z, w];
    },

    FromVector3 (vector, w)
    {
        return [vector[0], vector[1], vector[2], w];
    },

    Magnitude (vector)
    {
        return Math.sqrt ((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]) + (vector[3] * vector[3]));
    },

    SquaredMagnitude (vector)
    {
        return (vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]) + (vector[3] * vector[3]);
    },

    DotProduct (vectorA, vectorB)
    {
        return (vectorA[0] * vectorB[0]) + (vectorA[1] * vectorB[1]) + (vectorA[2] * vectorB[2]) + (vectorA[3] * vectorB[3]);
    }
}

var Matrix4 = 
{
    identity :
    [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ],

    Projection (fov, aspectRatio, near, far)
    {
        var yScale = 1 / Math.tan (0.5 * fov);
        var xScale = yScale / aspectRatio;
        var range = far - near;

        return [
            xScale, 0, 0, 0,
            0, yScale, 0, 0,
            0, 0, far / range, 1,
            0, 0, -(near * far) / range, 0
        ];
    }
}

function MultiplyVector4Matrix4 (vector, matrix)
{
    var x = (vector[0] * matrix[0]) + (vector[1] * matrix[4]) + (vector[2] * matrix[8]) + (vector[3] * matrix[12]);
    var y = (vector[0] * matrix[1]) + (vector[1] * matrix[5]) + (vector[2] * matrix[9]) + (vector[3] * matrix[13]);
    var z = (vector[0] * matrix[2]) + (vector[1] * matrix[6]) + (vector[2] * matrix[10]) + (vector[3] * matrix[14]);
    var w = (vector[0] * matrix[3]) + (vector[1] * matrix[7]) + (vector[2] * matrix[11]) + (vector[3] * matrix[15]);

    return [x, y, z, w];
}

function MultiplyMatrix4Matrix4 (matrixA, matrixB)
{
    var row0 = [matrixA[0], matrixA[1], matrixA[2], matrixA[3]];
    var row1 = [matrixA[4], matrixA[5], matrixA[6], matrixA[7]];
    var row2 = [matrixA[8], matrixA[9], matrixA[10], matrixA[11]];
    var row3 = [matrixA[12], matrixA[13], matrixA[14], matrixA[15]];

    var col0 = [matrixB[0], matrixB[4], matrixB[8], matrixB[12]];
    var col1 = [matrixB[1], matrixB[5], matrixB[9], matrixB[13]];
    var col2 = [matrixB[2], matrixB[6], matrixB[10], matrixB[14]];
    var col3 = [matrixB[3], matrixB[7], matrixB[11], matrixB[15]];

    return [
        Vector4.DotProduct (row0, col0), Vector4.DotProduct (row0, col1), Vector4.DotProduct (row0, col2), Vector4.DotProduct (row0, col3),
        Vector4.DotProduct (row1, col0), Vector4.DotProduct (row1, col1), Vector4.DotProduct (row1, col2), Vector4.DotProduct (row1, col3),
        Vector4.DotProduct (row2, col0), Vector4.DotProduct (row2, col1), Vector4.DotProduct (row2, col2), Vector4.DotProduct (row2, col3),
        Vector4.DotProduct (row3, col0), Vector4.DotProduct (row3, col1), Vector4.DotProduct (row3, col2), Vector4.DotProduct (row3, col3),
    ];
}

function DegToRad (degrees)
{
    return (Math.PI / 180) * degrees;
}

function RadToDeg (radians)
{
    return (180 / Math.PI) * radians;
}