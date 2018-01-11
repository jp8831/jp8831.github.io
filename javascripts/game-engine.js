/**************
*    WebGL    *
**************/

class WebGL
{
    constructor (canvas)
    {
        this.canvas = canvas;
        this.context = null;
    }

    Init ()
    {
        const CANVAS = this.canvas;
        const IS_CANVAS_INVALID = CANVAS === null;

        if (IS_CANVAS_INVALID)
        {
            return false;
        }

        const CONTEXT = CANVAS.getContext ("webgl");
        const IS_CONTEXT_INVALID = CONTEXT === null;

        if (IS_CONTEXT_INVALID)
        {
            return false;
        }

        this.context = CONTEXT;

        return true;
    }

    SetCanvas (canvasID)
    {
        this.canvas = document.getElementById (canvasID);
    }

    EnableBackFaceCulling ()
    {
        const CONTEXT = this.context;

        CONTEXT.cullFace (CONTEXT.BACK);
        CONTEXT.enable (CONTEXT.CULL_FACE);
    }

    DisableBackFaceCulling ()
    {
        const CONTEXT = this.context;

        CONTEXT.disable (CONTEXT.CULL_FACE);
    }

    EnableDepthTest ()
    {
        const CONTEXT = this.context;

        CONTEXT.depthFunc (CONTEXT.LEQUAL);
        CONTEXT.enable (CONTEXT.DEPTH_TEST);
    }

    DisableDepthTest ()
    {
        const CONTEXT = this.context;

        CONTEXT.disable (CONTEXT.DEPTH_TEST);
    }

    Clear (isClearColor, isClearDepth, isClearStencil)
    {
        const CONTEXT = this.context;

        let mask = 0;

        if (isClearColor)
        {
            mask |= CONTEXT.COLOR_BUFFER_BIT;
        }

        if (isClearDepth)
        {
            mask |= CONTEXT.DEPTH_BUFFER_BIT;
        }

        if (isClearStencil)
        {
            mask |= CONTEXT.STENCIL_BUFFER_BIT;
        }

        CONTEXT.clear (mask);
    }
    
    SetClearColor (red, green, blue, alpha)
    {
        const CONTEXT = this.context;

        CONTEXT.clearColor (red, green, blue, alpha);
    }
    
    SetClearDepth (depth)
    {
        const CONTEXT = this.context;

        CONTEXT.clearDepth (depth);
    }

    SetClearStencil (stencil)
    {
        const CONTEXT = this.context;

        CONTEXT.clearStencil (stencil);
    }
}

const BUFFER_TYPE = 
{
    Array : 1,
    ElementArray : 2
}

const BUFFER_USAGE = 
{
    Static : 1,
    Dynamic : 2
}

class Buffer
{
    constructor (context, type, usage)
    {
        this.context = context;
        this.buffer = null;
        this.type = type;
        this.usage = usage;
    }

    Create ()
    {
        const CONTEXT = this.context;

        this.buffer = CONTEXT.createBuffer ();
    }

    SetData (data)
    {
        const CONTEXT = this.context;
        const BUFFER = this.buffer;
        const TYPE = this.type;
        const USAGE = this.usage;

        let type;

        if (TYPE === BUFFER_TYPE.Array)
        {
            type = CONTEXT.ARRAY_BUFFER;
        }
        else if (TYPE === BUFFER_TYPE.ElementArray)
        {
            type = CONTEXT.ELEMENT_ARRAY_BUFFER;
        }

        let usage;

        if (USAGE === BUFFER_USAGE.Static)
        {
            usage = CONTEXT.STATIC_DRAW;
        }
        else if (USAGE === BUFFER_USAGE.Dynamic)
        {
            usage = CONTEXT.DYNAMIC_DRAW;
        }

        CONTEXT.bindBuffer (type, BUFFER);
        CONTEXT.bufferData (type, data, usage);
    }

    Delete ()
    {
        const CONTEXT = this.context;
        const BUFFER = this.buffer;

        CONTEXT.deleteBuffer (BUFFER);

        this.buffer = null;
    }
}

const SHADER_TYPE = 
{
    Vertex : 1,
    Fragment : 2
}

const UNIFORM_TYPE = 
{
    Vector4 : 1,
    Matrix4: 2
}

class ShaderProgram
{
    constructor (context)
    {
        this.context = context;
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;
    }

    Init ()
    {
        const CONTEXT = this.context;

        this.program = CONTEXT.createProgram ();
        this.vertexShader = CONTEXT.createShader (CONTEXT.VERTEX_SHADER);
        this.createShader = CONTEXT.createShader (CONTEXT.FRAGMENT_SHADER);
    }

    Load (vertexShaderSource, fragmentShaderSource)
    {
        const CONTEXT = this.context;
        const PROGRAM = this.program;
        const VERTEX_SHADER = this.vertexShader;
        const FRAGMENT_SHADER = this.fragmentShader;

        // Compile
        CONTEXT.shaderSource (VERTEX_SHADER, vertexShaderSource);
        CONTEXT.compileShader (VERTEX_SHADER);
    
        const IS_VERTEX_COMPILE_FAILED = !CONTEXT.getShaderParameter (VERTEX_SHADER, CONTEXT.COMPILE_STATUS);
    
        if (IS_VERTEX_COMPILE_FAILED)
        {
            return false;
        }
    
        CONTEXT.shaderSource (FRAGMENT_SHADER, fragmentShaderSource);
        CONTEXT.compileShader (FRAGMENT_SHADER);
    
        const IS_FRAGMENT_COMPILE_FAILED = !CONTEXT.getShaderParameter (FRAGMENT_SHADER, CONTEXT.COMPILE_STATUS);
    
        if (IS_FRAGMENT_COMPILE_FAILED)
        {
            return false;
        }
    
        // Link
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

    Delete ()
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

    SetAttribute (name, buffer, elementSize)
    {
        const CONTEXT = this.context;
        const PROGRAM = this.program;
        const ATTRIBUTE_LOCATION = CONTEXT.getAttribLocation (PROGRAM, name);
    
        CONTEXT.bindBuffer (CONTEXT.ARRAY_BUFFER, buffer.buffer);
        CONTEXT.enableAttribArray (ATTRIBUTE_LOCATION);
        CONTEXT.vertexAttribPointer (ATTRIBUTE_LOCATION, elementSize, CONTEXT.FLOAT, false, 0, 0);
    }

    SetUniform (name, data, type)
    {
        const CONTEXT = this.context;
        const PROGRAM = this.program;
        const UNIFORM_LOCATION = CONTEXT.getUniformLocation (PROGRAM, name);
    
        switch (uniformType)
        {
            case UNIFORM_TYPE.Vector4 :
            {
                CONTEXT.uniform4fv (UNIFORM_LOCATION, data);
    
                break;
            }
    
            case UNIFORM_TYPE.Matrix4 :
            {
                CONTEXT.uniformMatrix4fv (UNIFORM_LOCATION, false, data);
    
                break;
            }
        }
    }
}

/********************
*    Game Engine    *
********************/

class GameEngine
{
    constructor (webgl, resourceLoader)
    {
        this.webgl = webgl;
        this.resourceLoader = resourceLoader;
        this.previousTime = 0;
        this.isFirstLoop = true;
        this.isShutdown = false;
    }

    Init ()
    {
        const WEBGL = this.webgl;

        WEBGL.Init ();
        WEBGL.EnableDepthTest ();
        WEBGL.EnableBackFaceCulling ();

        WEBGL.SetClearColor (0, 0, 0, 1);
        WEBGL.SetClearDepth (1);
        WEBGL.Clear (true, true, false);
    }

    Loop ()
    {   
        const IS_CONTINUE_LOOP = !this.isShutdown;

        if (IS_CONTINUE_LOOP)
        {
            const ENGINE = this;

            requestAnimationFrame (function (time)
            {
                const IS_FIRST_LOOP = ENGINE.isFirstLoop;

                if (IS_FIRST_LOOP)
                {
                    ENGINE.isFirstLoop = false;
                    ENGINE.previousTime = time;
                }

                const PREVIOUS_TIME = ENGINE.previousTime;
                const DELTA_TIME = (PREVIOUS_TIME - time) * 0.001;

                ENGINE.Update (DELTA_TIME);
                ENGINE.Render ();

                ENGINE.previousTime = time;

                ENGINE.Loop ();
            });
        }
    }

    Update (deltaTime)
    {
        console.log (deltaTime);
    }

    Render ()
    {

    }

    Shutdown ()
    {
        this.isShutdown = true;
    }
}

const RESOURCE_LOADING_STATUS = 
{
    Loading : 1,
    Finish : 2
}

const RESOURCE_TYPE = 
{
    ShaderSource : 1,
    MeshData : 2,
    Texture : 3
}

class ResourceLoader
{
    constructor ()
    {
        this.status = RESOURCE_LOADING_STATUS.Finish;
        this.loadingCount = 0;
        this.uriBase = "";
    }

    SetURIBase (uriBase)
    {
        this.uriBase = uriBase;
    }

    Load (resourceName, resourceType)
    {
        this.status = RESOURCE_LOADING_STATUS.Loading;
        this.loadingCount++;

        let resourceURI = this.uriBase;
        let responseType;

        switch (resourceType)
        {
            case RESOURCE_TYPE.ShaderSource :
            {
                resourceURI += "/shaders/" + resourceName;
                responseType = "text";

                break;
            }

            case RESOURCE_TYPE.MeshData :
            {
                resourceURI += "/meshes/" + resourceName;
                responseType = "text";

                break;
            }

            case RESOURCE_TYPE.Texture :
            {
                resourceURI += "/textures/" + resourceName;
                responseType = "arraybuffer";

                break;
            }
        }

        return this.MakeHTTPRequest (resourceURI, responseType);
    }

    MakeHTTPRequest (uri, responseType)
    {
        const LOADER = this;

        return new Promise (function (resolve, reject)
        {
            const HTTP_REQUEST = new XMLHttpRequest ();

            const WHEN_LOADING_SUCCESS = function (event)
            {
                LOADER.loadingCount--;

                if (LOADER.loadingCount === 0)
                {
                    LOADER.status = RESOURCE_LOADING_STATUS.Finish;
                }

                resolve (this.response);
            };
            
            const WHEN_LOADING_FAIL = function (event)
            {
                reject (new Error ("Failed to load resource."));
            };

            HTTP_REQUEST.addEventListener ("load", WHEN_LOADING_SUCCESS);
            HTTP_REQUEST.addEventListener ("abort", WHEN_LOADING_FAIL);
            HTTP_REQUEST.addEventListener ("error", WHEN_LOADING_FAIL);
            HTTP_REQUEST.addEventListener ("timeout", WHEN_LOADING_FAIL);

            HTTP_REQUEST.open ("GET", uri);
            HTTP_REQUEST.responseType = responseType;
            HTTP_REQUEST.send ();
        });
    }
}

class Mesh
{
    constructor ()
    {

    }

    static ParseObj (obj)
    {

    }
}

/**************************
*    Vector and Matrix    *
**************************/

class Vector3
{
    static FromElements (x, y, z)
    {
        return [x, y, z];
    }

    static FromVector4 (vector)
    {
        const X = vector[0] / vector[3];
        const Y = vector[1] / vector[3];
        const Z = vector[2] / vector[3];

        return [X, Y, Z];
    }

    static Magnitude (vector)
    {
        const X_SQUARE = Math.pow (vector[0], 2);
        const Y_SQUARE = Math.pow (vector[1], 2);
        const Z_SQUARE = Math.pow (vector[2], 2);

        return Math.sqrt (X_SQUARE + Y_SQUARE + Z_SQUARE);
    }

    static SquaredMagnitude (vector)
    {
        const X_SQUARE = Math.pow (vector[0], 2);
        const Y_SQUARE = Math.pow (vector[1], 2);
        const Z_SQUARE = Math.pow (vector[2], 2);

        return (X_SQUARE + Y_SQUARE + Z_SQUARE);
    }

    static DotProduct (vectorA, vectorB)
    {
        const X_PRODUCT = vectorA[0] * vectorB[0];
        const Y_PRODUCT = vectorA[1] * vectorB[1];
        const Z_PRODUCT = vectorA[2] * vectorB[2];

        return (X_PRODUCT + Y_PRODUCT + Z_PRODUCT);
    }

    static CrossProduct (vectorA, vectorB)
    {
        const X = (vectorA[1] * vectorB[2]) - (vectorA[2] * vectorB[1]);
        const Y = (vectorA[2] * vectorB[0]) - (vectorA[0] * vectorB[2]);
        const Z = (vectorA[0] * vectorB[1]) - (vectorA[1] * vectorB[0]);

        return [X, Y, Z];
    }
}

class Vector4
{
    static FromElements (x, y, z, w)
    {
        return [x, y, z, w];
    }

    static FromVector3 (vector, w)
    {
        const X = vector[0];
        const Y = vector[1];
        const Z = vector[2];

        return [X, Y, Z, w];
    }

    static Magnitude (vector)
    {
        const X_SQUARE = Math.pow (vector[0], 2);
        const Y_SQUARE = Math.pow (vector[1], 2);
        const Z_SQUARE = Math.pow (vector[2], 2);
        const W_SQUARE = Math.pow (vector[3], 2);

        return Math.sqrt (X_SQUARE + Y_SQUARE + Z_SQUARE + W_SQUARE);
    }

    static SquaredMagnitude (vector)
    {
        const X_SQUARE = Math.pow (vector[0], 2);
        const Y_SQUARE = Math.pow (vector[1], 2);
        const Z_SQUARE = Math.pow (vector[2], 2);
        const W_SQUARE = Math.pow (vector[3], 2);

        return (X_SQUARE + Y_SQUARE + Z_SQUARE + W_SQUARE);
    }

    static DotProduct (vectorA, vectorB)
    {
        const X_PRODUCT = vectorA[0] * vectorB[0];
        const Y_PRODUCT = vectorA[1] * vectorB[1];
        const Z_PRODUCT = vectorA[2] * vectorB[2];
        const W_PRODUCT = vectorA[3] * vectorB[3];

        return (X_PRODUCT + Y_PRODUCT + Z_PRODUCT + W_PRODUCT);
    }
}

class Matrix4
{
    static Identity ()
    {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    static Projection (fov, width, height, near, far)
    {
        const ASPECT_RATIO = width / height;
        const RANGE = far - near;
        const Y_SCALE = 1 / Math.tan (0.5 * fov);
        const X_SCALE = Y_SCALE / ASPECT_RATIO;
        
        return [
            X_SCALE, 0, 0, 0,
            0, Y_SCALE, 0, 0,
            0, 0, far / RANGE, 1,
            0, 0, -(near * far) / RANGE, 0
        ];
    }

    static MultiplyVector4Matrix4 (vector, matrix)
    {
        const X = (vector[0] * matrix[0]) + (vector[1] * matrix[4]) + (vector[2] * matrix[8]) + (vector[3] * matrix[12]);
        const Y = (vector[0] * matrix[1]) + (vector[1] * matrix[5]) + (vector[2] * matrix[9]) + (vector[3] * matrix[13]);
        const Z = (vector[0] * matrix[2]) + (vector[1] * matrix[6]) + (vector[2] * matrix[10]) + (vector[3] * matrix[14]);
        const W = (vector[0] * matrix[3]) + (vector[1] * matrix[7]) + (vector[2] * matrix[11]) + (vector[3] * matrix[15]);

        return [X, Y, Z, W];
    }

    static MultiplyMatrix4Matrix4 (matrixA, matrixB)
    {
        const ROW_0 = [matrixA[0], matrixA[1], matrixA[2], matrixA[3]];
        const ROW_1 = [matrixA[4], matrixA[5], matrixA[6], matrixA[7]];
        const ROW_2 = [matrixA[8], matrixA[9], matrixA[10], matrixA[11]];
        const ROW_3 = [matrixA[12], matrixA[13], matrixA[14], matrixA[15]];

        const COL_0 = [matrixB[0], matrixB[4], matrixB[8], matrixB[12]];
        const COL_1 = [matrixB[1], matrixB[5], matrixB[9], matrixB[13]];
        const COL_2 = [matrixB[2], matrixB[6], matrixB[10], matrixB[14]];
        const COL_3 = [matrixB[3], matrixB[7], matrixB[11], matrixB[15]];

        return [
            Vector4.DotProduct (ROW_0, COL_0), Vector4.DotProduct (ROW_0, COL_1), Vector4.DotProduct (ROW_0, COL_2), Vector4.DotProduct (ROW_0, COL_3),
            Vector4.DotProduct (ROW_1, COL_0), Vector4.DotProduct (ROW_1, COL_1), Vector4.DotProduct (ROW_1, COL_2), Vector4.DotProduct (ROW_1, COL_3),
            Vector4.DotProduct (ROW_2, COL_0), Vector4.DotProduct (ROW_2, COL_1), Vector4.DotProduct (ROW_2, COL_2), Vector4.DotProduct (ROW_2, COL_3),
            Vector4.DotProduct (ROW_3, COL_0), Vector4.DotProduct (ROW_3, COL_1), Vector4.DotProduct (ROW_3, COL_2), Vector4.DotProduct (ROW_3, COL_3),
        ];
    }
}

/*****************
*    Rotation    *
*****************/

class Angle
{
    static DegToRad (degrees)
    {
        return (Math.PI / 180) * degrees;
    }

    static RadToDeg (radians)
    {
        return (180 / Math.PI) * radians;
    }
}
