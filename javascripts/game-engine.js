/**************
*    WebGL    *
**************/

const WindingOrder = Object.freeze ({
    Clockwise : 1,
    CounterClockwise : 2
});

class WebGL
{
    constructor ()
    {
        this.canvas = null;
        this.context = null;
    }

    Init (canvasId)
    {
        if (Assert (typeof canvasId === "string", "Canvas id must be a string.", "WebGL.Init"))
        {
            return false;
        }

        // Get canvas for WebGL by ID.
        const canvas = document.getElementById (canvasId);

        if (Assert (canvas !== null, "Canvas id is wrong.", "WebGL.Init"))
        {
            return false;
        }

        this.canvas = canvas;

        // Get WebGL context of canvas.
        const context = canvas.getContext ("webgl");

        if (Assert (context !== null, "Getting WebGL rendering context is failed.", "WebGL.Init"))
        {
            return false;
        }

        this.context = context;

        return true;
    }

    EnableFrontFaceCulling ()
    {
        const context = this.context;

        context.cullFace (context.FRONT);
        context.enable (context.CULL_FACE);
    }

    EnableBackFaceCulling ()
    {
        const context = this.context;

        context.cullFace (context.BACK);
        context.enable (context.CULL_FACE);
    }

    EnableFrontAndBackFaceCulling ()
    {
        const context = this.context;

        context.cullFace (context.FRONT_AND_BACK);
        context.enable (context.CULL_FACE);
    }

    DisableFaceCulling ()
    {
        const context = this.context;

        context.disable (context.CULL_FACE);
    }

    EnableDepthTest ()
    {
        const context = this.context;

        context.depthFunc (context.LEQUAL);
        context.enable (context.DEPTH_TEST);
    }

    DisableDepthTest ()
    {
        const context = this.context;

        context.disable (context.DEPTH_TEST);
    }

    ClearColor ()
    {
        const context = this.context;

        context.clear (context.COLOR_BUFFER_BIT);
    }

    ClearDepth ()
    {
        const context = this.context;

        context.clear (context.DEPTH_BUFFER_BIT);
    }

    ClearStencil ()
    {
        const context = this.context;

        context.clear (context.STENCIL_BUFFER_BIT);
    }

    ClearAll ()
    {
        const context = this.context;

        context.clear (context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT | context.STENCIL_BUFFER_BIT);
    }
    
    SetClearColor (red, green, blue, alpha)
    {
        if (Assert (typeof red === "number" && typeof green === "number" && 
            typeof blue === "number" && typeof alpha === "number", 
            "Color value must be a number.", "WebGL.SetClearColor"))
        {
            return;
        }

        const context = this.context;

        context.clearColor (red, green, blue, alpha);
    }
    
    SetClearDepth (depth)
    {
        if (Assert (typeof depth === "number", "Depth value must be a number.", "WebGL.SetClearDepth"))
        {
            return;
        }

        const context = this.context;

        context.clearDepth (depth);
    }

    SetClearStencil (stencil)
    {
        if (Assert (typeof stencil === "number", "Stencil value must be a number.", "WebGL.SetClearStencil"))
        {
            return;
        }

        const context = this.context;

        context.clearStencil (stencil);
    }

    UseShaderProgram (program)
    {
        if (Assert (program instanceof ShaderProgram, "Program must be a ShaderProgram.", "WebGL.UseShaderProgram"))
        {
            return;
        }

        this.context.useProgram (program.program);
    }

    SetWindingOrder (order)
    {
        if (Assert (typeof order === "number" && Object.values (WindingOrder).includes (order), "Order must be one of WindingOrder", "WebGL.SetWindingOrder"))
        {
            return;
        }

        const context = this.context;

        switch (order)
        {
            case WindingOrder.Clockwise :
            {
                context.frontFace (context.CW);

                return;
            }

            case WindingOrder.CounterClockwise :
            {
                context.frontFace (context.CCW);

                return;
            }
        }
    }

    SetRenderSize (width, height)
    {
        if (Assert (typeof width === "number", "Width must be a number.", "WebGL.SetRenderSize") ||
            Assert (typeof height === "number", "Height must be a number.", "WebGL.SetRenderSize"))
        {
            return;
        }

        const canvas = this.canvas;

        canvas.width = width;
        canvas.height = height;

        this.context.viewport (0, 0, width, height);
    }

    GetCanvasWidth ()
    {
        return this.canvas.clientWidth;
    }

    GetCanvasHeight ()
    {
        return this.canvas.clientHeight;
    }
}

class Buffer
{
    constructor (context)
    {
        Assert (context !== null, "Invalid WebGL rendering context.", "Buffer.constructor");
        
        this.context = context;
        this.buffer = null;
    }

    Create ()
    {
        const context = this.context;

        this.buffer = context.createBuffer ();
    }

    SetData (data)
    {
        if (Assert (data !== null || data !== undefined, "Invalid buffer data.", "Buffer.SetData"))
        {
            return;
        }

        const context = this.context;
        const buffer = this.buffer;

        context.bindBuffer (context.ARRAY_BUFFER, buffer);
        context.bufferData (context.ARRAY_BUFFER, data, context.STATIC_DRAW);
    }

    SetIndexData (data)
    {
        if (Assert (data !== null || data !== undefined, "Invalid buffer data.", "Buffer.SetIndexData"))
        {
            return;
        }

        const context = this.context;
        const buffer = this.buffer;

        context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, buffer);
        context.bufferData (context.ELEMENT_ARRAY_BUFFER, data, context.STATIC_DRAW);
    }

    Delete ()
    {
        const context = this.context;
        const buffer = this.buffer;

        context.deleteBuffer (buffer);

        this.context = null;
        this.buffer = null;
    }
}

const ShaderType = Object.freeze ({
    Vertex : 1,
    Fragment : 2
});

const UniformVectorType = Object.freeze ({
    SingleValue : 1,
    Vector2 : 2,
    Vector3 : 3,
    Vector4 : 4
});

const UniformMatrixType = Object.freeze ({
    Matrix2 : 1,
    Matrix3 : 2,
    Matrix4 : 3
});

class ShaderProgram
{
    constructor (context)
    {
        Assert (context !== null, "Invalid WebGL rendering context.", "ShaderProgram.constructor");

        this.context = context;
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;
    }

    Init ()
    {
        const context = this.context;

        this.program = context.createProgram ();
        this.vertexShader = context.createShader (context.VERTEX_SHADER);
        this.fragmentShader = context.createShader (context.FRAGMENT_SHADER);
    }

    Load (vertexShaderSource, fragmentShaderSource)
    {
        const context = this.context;
        const program = this.program;
        const vertexShader = this.vertexShader;
        const fragmentShader = this.fragmentShader;

        // Compile
        context.shaderSource (vertexShader, vertexShaderSource);
        context.compileShader (vertexShader);

        if (Assert (context.getShaderParameter (vertexShader, context.COMPILE_STATUS), "Compiling vertex shader is failed.", "ShaderProgram.Load"))
        {
            console.log (context.getShaderInfoLog (vertexShader));

            return false;
        }
    
        context.shaderSource (fragmentShader, fragmentShaderSource);
        context.compileShader (fragmentShader);
    
        if (Assert (context.getShaderParameter (fragmentShader, context.COMPILE_STATUS), "Compiling fragment shader is failed.", "ShaderProgram.Load"))
        {
            console.log (context.getShaderInfoLog (fragmentShader));

            return false;
        }
    
        // Link
        context.attachShader (program, vertexShader);
        context.attachShader (program, fragmentShader);
        context.linkProgram (program);

        if (Assert (context.getProgramParameter (program, context.LINK_STATUS), "Linking shader program is failed.", "ShaderProgram.Load"))
        {
            console.log (context.getProgramInfoLog (program));

            return false;
        }
    
        return true;
    }

    Delete ()
    {
        const context = this.context;
        const program = this.program;
        const vertexShader = this.vertexShader;
        const fragmentShader = this.fragmentShader;
    
        context.detachShader (program, vertexShader);
        context.detachShader (program, fragmentShader);
    
        context.deleteShader (vertexShader);
        context.deleteShader (fragmentShader);
    
        context.deleteProgram (program);
    
        this.context = null;
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;
    }

    SetAttribute (name, buffer, size, stride, offset)
    {
        if (Assert (typeof name === "string", "Attribute name must be a string.", "ShaderProgram.SetAttribute") ||
            Assert (buffer instanceof Buffer, "Buffer is invalid.", "ShaderProgram.SetAttribute") ||
            Assert (typeof size === "number", "Size must be a number.", "ShaderProgram.SetAttribute") ||
            Assert (typeof stride === "number", "Stride must be a number.") ||
            Assert (typeof offset === "number", "Offset must be a number", "ShaderProgram.SetAttribute"))
        {
            return;
        }

        const context = this.context;
        const program = this.program;

        const attributeLocation = context.getAttribLocation (program, name);

        if (Assert (attributeLocation !== -1, "Attribute \"" + name + "\" not found.", "ShaderProgram.SetAttribute"))
        {
            return;
        }
    
        context.bindBuffer (context.ARRAY_BUFFER, buffer.buffer);
        context.vertexAttribPointer (attributeLocation, size, context.FLOAT, false, stride, offset);
        context.enableVertexAttribArray (attributeLocation);
    }

    SetUniformVector (name, vector, type)
    {
        if (Assert (typeof name === "string", "Name must be a string.", "ShaderProgram.SetUniformVector") ||
            Assert (vector instanceof Float32Array, "Vector must be an array of 32bit float (Float32Array).", "ShaderProgram.SetUniformVector") ||
            Assert (typeof type === "number" && Object.values (UniformVectorType).includes (type), "Type must be one of UniformVectorType.", "ShaderProgram.SetUiformVector"))
        {
            return;
        }

        const context = this.context;
        const uniformLocation = context.getUniformLocation (this.program, name);

        if (Assert (uniformLocation !== null && uniformLocation !== undefined, "Uniform \"" + name + "\" Not Found", "ShaderProgram.SetUiformVector"))
        {
            return;
        }

        switch (type)
        {
            case UniformVectorType.SingleValue :
            {
                context.uniform1fv (uniformLocation, vector);
                return;
            }

            case UniformVectorType.Vector2 :
            {
                context.uniform2fv (uniformLocation, vector);
                return;
            }

            case UniformVectorType.Vector3 :
            {
                context.uniform3fv (uniformLocation, vector);
                return;
            }

            case UniformVectorType.Vector4 :
            {
                context.uniform4fv (uniformLocation, vector);
                return;
            }
        }
    }

    SetUniformMatrix (name, matrix, type, transpose = false)
    {
        if (Assert (typeof name === "string", "Name must be a string.", "ShaderProgram.SetUniformMatrix") ||
            Assert (matrix instanceof Float32Array, "Matrix must be an array of 32bit float (Float32Array).", "ShaderProgram.SetUniformMatrix") ||
            Assert (typeof type === "number" && Object.values (UniformMatrixType).includes (type), "Type must be one of UniformMatrixType.", "ShaderProgram.SetUniformMatrix") ||
            Assert (typeof transpose === "boolean", "Transpose must be a true or false.", "ShaderProgram.SetUniformMatrix"))
        {
            return;
        }

        const context = this.context;
        const uniformLocation = context.getUniformLocation (this.program, name);

        if (Assert (uniformLocation !== null && uniformLocation !== undefined, "Uniform \"" + name + "\" Not Found", "ShaderProgram.SetUniformMatrix"))
        {
            return;
        }

        switch (type)
        {
            case UniformMatrixType.Matrix2 :
            {
                context.uniformMatrix2fv (uniformLocation, transpose, matrix);
                return;
            }

            case UniformMatrixType.Matrix3 :
            {
                context.uniformMatrix3fv (uniformLocation, transpose, matrix);
                return;
            }

            case UniformMatrixType.Matrix4 :
            {
                context.uniformMatrix4fv (uniformLocation, transpose, matrix);
                return;
            }
        }
    }
}

/********************
*    Game Engine    *
********************/

class GameEngine
{
    constructor ()
    {
        this.webgl = null;
        this.resource = null;
        this.gameObjects = [];
        this.firstLoop = true;
        this.previousTime = 0;
        this.shutdown = false;
    }

    Init ()
    {
        // WebGL
        const webgl = new WebGL ();

        if (webgl.Init ("webgl-canvas") === false)
        {
            console.log ("Initializing WebGL is failed.");

            return false;
        }

        this.webgl = webgl;

        webgl.EnableBackFaceCulling ();
        webgl.EnableDepthTest ();

        webgl.SetClearColor (0.0, 0.0, 0.0, 1.0);
        webgl.SetClearDepth (1.0);
        webgl.SetClearStencil (0.0);

        webgl.SetWindingOrder (WindingOrder.Clockwise);

        this.resource = new Resource ();

        return true;
    }

    Loop ()
    {   
        const continueLoop = !this.shutdown;

        if (continueLoop)
        {
            const engine = this;

            requestAnimationFrame (function (time)
            {
                engine.Update (time);
                engine.Render ();

                engine.Loop ();
            });
        }
    }

    Update (time)
    {
        if (this.firstLoop)
        {
            this.previousTime = time;
            this.firstLoop = false;

            for (const gameObject of this.gameObjects)
            {
                gameObject.Start ();
            }
        }

        const deltaTime = (this.previousTime - time) * 0.001;

        for (const gameObject of this.gameObjects)
        {
            gameObject.Update (deltaTime);
        }

        this.previousTime = time;
    }

    Render ()
    {
        const webgl = this.webgl;

        webgl.SetRenderSize (webgl.GetCanvasWidth (), webgl.GetCanvasHeight ());
        webgl.ClearAll ();

        for (const gameObject of this.gameObjects)
        {
            gameObject.Render (webgl);
        }
    }

    AddGameObject (gameObject)
    {
        if (Assert (gameObject instanceof GameObject, "Game Object is invalid.", "GameEngine.AddGameObject"))
        {
            return;
        }

        gameObject.engine = this;
        gameObject.Init ();

        if (this.firstLoop === false)
        {
            gameObject.Start ();
        }

        this.gameObjects.push (gameObject);
    }

    Shutdown ()
    {
        this.shutdown = true;
    }
}

const ResourceStatus = Object.freeze ({
    Fetch : 1, 
    Finish : 2 
});

const ResourceType = Object.freeze ({
    ShaderSource : 1,
    MeshData : 2,
    Texture : 3
});

class Resource
{
    constructor ()
    {
        this.status = ResourceStatus.Finish;
        this.fetchCount = 0;
        this.uriBase = "";
        this.resources = [];
    }

    SetUriBase (base)
    {
        if (Assert (typeof base === "string", "Base must be a string.", "Resource.SetUriBase"))
        {
            return;
        }

        this.uriBase = base;
    }

    Fetch (name, location, type)
    {
        if (Assert (typeof name === "string", "Name must be a string.", "Resource.Fetch") ||
            Assert (typeof location === "string", "Location must be a string.", "Resource.Fetch") ||
            Assert (typeof type === "number" && Object.values (ResourceType).includes (type), "Type must be one of ResourceType", "Resource.Fetch"))
        {
            return;
        }

        this.status = Resource.Fetch;
        this.fetchCount += 1;

        let uri = this.uriBase + "/" + location + "/" + name;
        let responseType;

        switch (type)
        {
            case ResourceType.ShaderSource :
            case ResourceType.MeshData :
            {
                responseType = "text";
                break;
            }

            case ResourceType.Texture :
            {
                responseType = "arraybuffer";
                break;
            }
        }

        return this.MakeHTTPRequest (uri, responseType, name);
    }

    Get (name)
    {
        if (Assert (typeof name === "string", "Name must be a string.", "Resource.Fetch"))
        {
            return;
        }

        if (Object.keys (this.resources).includes (name))
        {
            return this.resources[name];
        }

        return null;
    }

    MakeHTTPRequest (uri, responseType, name)
    {
        const resource = this;

        return new Promise (function (resolve, reject)
        {
            const httpRequest = new XMLHttpRequest ();

            const WhenSuccess = function (event)
            {
                resource.fetchCount--;

                if (resource.fetchCount === 0)
                {
                    resource.status = ResourceStatus.Finish;
                }

                resource.resources[name] = this.response;

                resolve ();
            };
            
            const WhenFail = function (event)
            {
                reject (new Error ("Failed to load resource."));
            };

            httpRequest.addEventListener ("load", WhenSuccess);
            httpRequest.addEventListener ("abort", WhenFail);
            httpRequest.addEventListener ("error", WhenFail);
            httpRequest.addEventListener ("timeout", WhenFail);

            httpRequest.open ("GET", uri);
            httpRequest.responseType = responseType;
            httpRequest.send ();
        });
    }
}

class Mesh
{
    constructor ()
    {
        this.positionSize = 3;
        this.normalSize = 3;
        this.textureCoordinateSize = 2;

        this.haveNormal = false;
        this.haveTextureCoordinate = false;

        this.faces = [];
    }

    GetVertexPosition (index)
    {
        const OUT_OF_RANGE = index < 0 || index >= this.GetVertexCount ();

        if (OUT_OF_RANGE)
        {
            return null;
        }

        const START = this.GetStride () * index;

        const X = this.faces[START];
        const Y = this.faces[START + 1];
        const Z = this.faces[START + 2];

        return Vector3.FromElements (X, Y, Z);
    }

    GetVertexNormal (index)
    {
        const OUT_OF_RANGE = index < 0 || index >= this.GetVertexCount ();
        const NO_NORMAL = this.haveNormal === false;

        if (OUT_OF_RANGE || NO_NORMAL)
        {
            return null;
        }

        const START = this.GetStride () * index + this.GetVertexNormalOffset ();

        const X = this.faces[START];
        const Y = this.faces[START + 1];
        const Z = this.faces[START + 2];

        return Vector3.FromElements (X, Y, Z);
    }

    GetTextureCoordinate (index)
    {
        const OUT_OF_RANGE = index < 0 || index >= this.GetVertexCount ();
        const NO_TEXTURE_COORDINATE = this.haveTextureCoordinate === false;

        if (OUT_OF_RANGE || NO_TEXTURE_COORDINATE)
        {
            return null;
        }

        const START = this.GetStride () * index + this.GetVertexTextureCoordinateOffset ();

        const U = this.faces[START];
        const V = this.faces[START + 1];

        return Vector2.FromElements (U, V);
    }

    GetVertexPositionSize ()
    {
        return this.positionSize;
    }

    GetVertexNormalSize ()
    {
        return this.normalSize;
    }

    GetVertexTextureCoordinateSize ()
    {
        return this.textureCoordinateSize;
    }

    GetVertexPositionOffset ()
    {
        return 0;
    }

    GetVertexNormalOffset ()
    {
        const NO_NORMAL = this.haveNormal === false;

        if (NO_NORMAL)
        {
            return null;
        }

        return this.positionSize * Float32Array.BYTES_PER_ELEMENT;
    }

    GetVertexTextureCoordinateOffset ()
    {
        const NO_TEXTURE_COORDINATE = this.haveTextureCoordinate === false;

        if (NO_TEXTURE_COORDINATE)
        {
            return null;
        }

        return (this.positionSize + this.normalSize) * Float32Array.BYTES_PER_ELEMENT;
    }

    GetStride ()
    {
        let stride = this.positionSize;

        if (this.haveNormal)
        {
            stride += this.normalSize;
        }

        if (this.haveTextureCoordinate)
        {
            stride += this.textureCoordinateSize;
        }

        return stride * Float32Array.BYTES_PER_ELEMENT;
    }

    GetVertexCount ()
    {
        return this.faces.length / this.GetStride () * Float32Array.BYTES_PER_ELEMENT;
    }  
}

class ObjParser
{
    static Parse (obj)
    {
        const MESH = new Mesh ();

        MESH.haveNormal = obj.includes ("vn");
        MESH.haveTextureCoordinate = obj.includes ("vt");

        const OBJ_INFOS = obj.split ("\n");

        const POSITIONS = [];
        const NORMALS = [];
        const TEXTURE_COORDINATES = [];

        for (const INFO of OBJ_INFOS)
        {
            const INFO_PARTS = INFO.trimRight ().split (" ");
            const INFO_TYPE = INFO_PARTS[0];

            switch (INFO_TYPE)
            {
                case "v" :
                {
                    POSITIONS.push (Vector3.FromElements (parseFloat (INFO_PARTS[1]),
                                                          parseFloat (INFO_PARTS[2]),
                                                          parseFloat (INFO_PARTS[3])));

                    break;
                }

                case "vn" :
                {
                    NORMALS.push (Vector3.FromElements (parseFloat (INFO_PARTS[1]),
                                                        parseFloat (INFO_PARTS[2]),
                                                        parseFloat (INFO_PARTS[3])));

                    break;
                }

                case "vt" :
                {
                    TEXTURE_COORDINATES.push (Vector3.FromElements (parseFloat (INFO_PARTS[1]),
                                                                    parseFloat (INFO_PARTS[2])));

                    break;
                }

                case "f" :
                {
                    const INDICES_1 = INFO_PARTS[1].split ("/");
                    const INDICES_2 = INFO_PARTS[2].split ("/");
                    const INDICES_3 = INFO_PARTS[3].split ("/");

                    MESH.faces = MESH.faces.concat (POSITIONS[parseInt (INDICES_1[0]) - 1]);
                    MESH.faces = MESH.faces.concat (NORMALS[parseInt (INDICES_1[2]) - 1]);
                    MESH.faces = MESH.faces.concat (TEXTURE_COORDINATES[parseInt (INDICES_1[1]) - 1]);

                    MESH.faces = MESH.faces.concat (POSITIONS[parseInt (INDICES_2[0]) - 1]);
                    MESH.faces = MESH.faces.concat (NORMALS[parseInt (INDICES_2[2]) - 1]);
                    MESH.faces = MESH.faces.concat (TEXTURE_COORDINATES[parseInt (INDICES_2[1]) - 1]);

                    MESH.faces = MESH.faces.concat (POSITIONS[parseInt (INDICES_3[0]) - 1]);
                    MESH.faces = MESH.faces.concat (NORMALS[parseInt (INDICES_3[2]) - 1]);
                    MESH.faces = MESH.faces.concat (TEXTURE_COORDINATES[parseInt (INDICES_3[1]) - 1]);

                    MESH.faces = MESH.faces.filter (value => { return value !== undefined && value !== null });

                    break;
                }
            }
        }

        return MESH;
    }
}

/**************************
*    Game Frameworks    *
**************************/

class GameObject
{
    constructor ()
    {
        this.engine = null;
        this.components = [];
    }

    Init ()
    {
        this.AddComponent (new Transform ());

        for (const component of this.components)
        {
            component.Init ();
        }
    }

    Start ()
    {
        for (const component of this.components)
        {
            component.Start ();
        }
    }

    Update (deltaTime)
    {
        for (const component of this.components)
        {
            component.Update (deltaTime);
        }
    }

    Render (webgl)
    {
        for (const component of this.components)
        {
            component.Render (webgl);
        }
    }

    AddComponent (component)
    {
        if (Assert (component instanceof Component, "Component is invalid.", "GameObject.AddComponent"))
        {
            return;
        }

        component.SetGameObject (this);

        if (this.engine !== null)
        {
            component.Init ();

            if (this.engine.firstLoop === false)
            {
                component.Start ();
            }
        }

        this.components.push (component);
    }

    GetComponentByName (name)
    {
        if (Assert (typeof name === "string", "Name must be a string.", "GameObject.GetComponentByName"))
        {
            return null;
        }

        for (const component of this.components)
        {
            if (component.constructor.name === name)
            {
                return component;
            }
        }

        return null;
    }
}

class Component
{
    constructor ()
    {
        this.gameObject = null;
    }

    Init ()
    {
    }

    Start ()
    {
    }

    Update (deltaTime)
    {
    }

    Render (webgl)
    {
    }

    SetGameObject (gameObject)
    {
        if (Assert (gameObject instanceof GameObject, "GameObject is invalid.", "Component.SetGameObject"))
        {
            return;
        }

        this.gameObject = gameObject;
    }
}

class Transform extends Component
{
    constructor ()
    {
        super ();

        this.position = [];
        this.rotation = [];
        this.scale = [];
    }

    Init ()
    {
        super.Init ();

        this.position = Vector3.FromElements (0, 0, 0);
        this.rotation = Vector3.FromElements (0, 0, 0);
        this.scale = Vector3.FromElements (1, 1, 1);
    }

    GetPosition ()
    {
        return this.position;
    }

    SetPosition (x, y, z)
    {
        this.position = Vector3.FromElements (x, y, z);
    }

    GetRotation ()
    {
        return this.rotation;
    }

    SetRotation (x, y, z)
    {
        this.rotation = Vector3.FromElements (x, y, z);
    }

    GetScale ()
    {
        return this.scale;
    }

    SetScale (x, y, z)
    {
        this.scale = Vector3.FromElements (x, y, z);
    }
}

class Renderer extends Component
{
    constructor()
    {
        super ();

        this.mesh = null;
        this.buffer = null;
        this.shader = null;
    }

    Init ()
    {
        super.Init ();

        this.buffer = new Buffer (this.gameObject.engine.webgl.context);
        this.buffer.Create ();

        this.shader = new ShaderProgram (this.gameObject.engine.webgl.context);
        this.shader.Init ();
    }

    Render (webgl)
    {
        super.Render ();

        if (this.mesh === null)
        {
            return;
        }

        const shader = this.shader;
        const buffer = this.buffer;
        const mesh = this.mesh;

        shader.SetAttribute ("position", buffer, mesh.GetVertexPositionSize (), mesh.GetStride (), mesh.GetVertexPositionOffset ());
        shader.SetAttribute ("normal", buffer, mesh.GetVertexNormalSize (), mesh.GetStride (), mesh.GetVertexNormalOffset ());

        const transform = this.gameObject.GetComponentByName ("Transform");

        const worldMatrix = Matrix4.World (transform.GetPosition(), transform.GetRotation ());
        shader.SetUniformMatrix ("world", new Float32Array (worldMatrix), UniformMatrixType.Matrix4);
        
        const viewMatrix = Matrix4.View (Vector3.FromElements (0.0, 0.0, -5.0), Vector3.FromElements (0.0, 0.0, 0.0));
        shader.SetUniformMatrix ("view", new Float32Array (viewMatrix), UniformMatrixType.Matrix4);

        const projectionMatrix = Matrix4.Projection (Angle.DegToRad (60), webgl.GetCanvasWidth (), webgl.GetCanvasHeight (), 0.5, 100000);
        shader.SetUniformMatrix ("projection", new Float32Array (projectionMatrix), UniformMatrixType.Matrix4);

        webgl.UseShaderProgram (shader);

        webgl.context.drawArrays (webgl.context.TRIANGLES, 0, mesh.GetVertexCount ());
    }

    SetMesh (meshData)
    {
        this.mesh = ObjParser.Parse (meshData);
        this.buffer.SetData (new Float32Array (this.mesh.faces));
    }

    SetShader (vertSource, fragSource)
    {
        this.shader.Load (vertSource, fragSource);
    }
}

/**************************
*    Vector and Matrix    *
**************************/

class Vector2
{
    static FromElements (x, y)
    {
        return [x, y];
    }

    static Magnitude (vector)
    {
        const X_SQUARE = Math.pow (vector[0], 2);
        const Y_SQUARE = Math.pow (vector[1], 2);

        return Math.sqrt (X_SQUARE + Y_SQUARE);
    }

    static SquaredMagnitude (vector)
    {
        const X_SQUARE = Math.pow (vector[0], 2);
        const Y_SQUARE = Math.pow (vector[1], 2);

        return (X_SQUARE + Y_SQUARE);
    }

    static DotProduct (vectorA, vectorB)
    {
        const X_PRODUCT = vectorA[0] * vectorB[0];
        const Y_PRODUCT = vectorA[1] * vectorB[1];

        return (X_PRODUCT + Y_PRODUCT);
    }
}

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

    static World (position, rotation)
    {
        let result = Matrix4.RotateZ (rotation[2]);
        result = Matrix4.MultiplyMatrix4Matrix4 (result, Matrix4.RotateY (rotation[1]));
        result = Matrix4.MultiplyMatrix4Matrix4 (result, Matrix4.RotateX (rotation[0]));
        result = Matrix4.MultiplyMatrix4Matrix4 (result, Matrix4.Translate (position[0], position[1], position[2]));
        
        return result;
    }

    static View (cameraPosition, cameraRotation)
    {
        let result = Matrix4.Translate (-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]);
        result = Matrix4.MultiplyMatrix4Matrix4 (result, Matrix4.RotateZ (-cameraRotation[2]));
        result = Matrix4.MultiplyMatrix4Matrix4 (result, Matrix4.RotateY (-cameraRotation[1]));
        result = Matrix4.MultiplyMatrix4Matrix4 (result, Matrix4.RotateX (-cameraRotation[0]));
        
        return result;
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

    static Translate (x, y, z)
    {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
    }

    static RotateX (angle)
    {
        const ANGLE_IN_RADIANS = Angle.DegToRad (angle);
        const COS_VAL = Math.cos (ANGLE_IN_RADIANS);
        const SIN_VAL = Math.sin (ANGLE_IN_RADIANS);

        return [
            1, 0, 0, 0,
            0, COS_VAL, SIN_VAL, 0,
            0, -SIN_VAL, COS_VAL, 0,
            0, 0, 0, 1
        ];
    }

    static RotateY (angle)
    {
        const ANGLE_IN_RADIANS = Angle.DegToRad (angle);
        const COS_VAL = Math.cos (ANGLE_IN_RADIANS);
        const SIN_VAL = Math.sin (ANGLE_IN_RADIANS);

        return [
            COS_VAL, 0, -SIN_VAL, 0,
            0, 1, 0, 0,
            SIN_VAL, 0, COS_VAL, 0,
            0, 0, 0, 1
        ];
    }

    static RotateZ (angle)
    {
        const ANGLE_IN_RADIANS = Angle.DegToRad (angle);
        const COS_VAL = Math.cos (ANGLE_IN_RADIANS);
        const SIN_VAL = Math.sin (ANGLE_IN_RADIANS);

        return [
            COS_VAL, SIN_VAL, 0, 0,
            -SIN_VAL, COS_VAL, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    static Scale (scale)
    {
        return [
            scale, 0, 0, 0,
            0, scale, 0, 0,
            0, 0, scale, 0,
            0, 0, 0, 1
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

/******************
*    Assertion    *
******************/

function Assert (condition, message, location = "")
{
    let title = "Assertion Failed in Assert" + (location === "" ? "" : " (Called from  " + location + ")");

    if (typeof condition !== "boolean")
    {
        console.log (title + "\nCondition must be a boolean");

        return true;
    }

    if (typeof message !== "string")
    {
        console.log ("Assertion Failed in Assert" + (location === "" ? "" : " (Called from  " + location + ")") + "\nMessage must be a string");

        return true;
    }

    if (typeof location !== "string")
    {
        console.log ("Assertion Failed in Assert" + (location === "" ? "" : " (Called from  " + location + ")") + "\nLocation must be a string");

        return true;
    }

    if (condition)
    {
        return false;
    }

    title = "Assertion Failed" + (location === "" ? "" : " in " + location);

    console.log (title + "\n" + message);

    return true;
}