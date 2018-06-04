async function RunDemo ()
{
    const WEBGL = new WebGL ();
    const RESOURCE_LOADER = new ResourceLoader ();

    if (WEBGL.Init ("webgl-canvas") === false)
    {
        console.log ("Initializing WebGL is failed.");

        return;
    }

    RESOURCE_LOADER.SetURIBase ("https://jp8831.github.io");
    let meshData = await RESOURCE_LOADER.Load ("monkey.obj", ResourceType.MeshData);

    const MONKEY_MESH = ObjParser.Parse (meshData); 
    const MESH_BUFFER = new Buffer (WEBGL.context);

    MESH_BUFFER.Create ();
    MESH_BUFFER.SetData (new Float32Array (MONKEY_MESH.faces));

    let vertSource = await RESOURCE_LOADER.Load ("vertex.glsl", ResourceType.ShaderSource);
    let fragSource = await RESOURCE_LOADER.Load ("fragment.glsl", ResourceType.ShaderSource);

    const SHADER = new ShaderProgram (WEBGL.context);

    SHADER.Init ();
    SHADER.Load (vertSource, fragSource);

    SHADER.SetAttribute ("position", MESH_BUFFER, MONKEY_MESH.GetVertexPositionSize (), MONKEY_MESH.GetStride (), MONKEY_MESH.GetVertexPositionOffset ());
    SHADER.SetAttribute ("normal", MESH_BUFFER, MONKEY_MESH.GetVertexNormalSize (), MONKEY_MESH.GetStride (), MONKEY_MESH.GetVertexNormalOffset ());

    WEBGL.canvas.width = WEBGL.canvas.clientWidth;
    WEBGL.canvas.height = WEBGL.canvas.clientHeight;

    WEBGL.context.viewport (0, 0, WEBGL.canvas.clientWidth, WEBGL.canvas.clientHeight);

    WEBGL.EnableCullingBackFace ();
    WEBGL.EnableDepthTest ();

    WEBGL.SetClearColor (0.0, 0.0, 0.0, 1.0);
    WEBGL.SetClearDepth (1.0);

    WEBGL.ClearColor ();
    WEBGL.ClearDepth ();

    WEBGL.context.frontFace (WEBGL.context.CW);

    WEBGL.context.useProgram (SHADER.program);

    const viewMatrix = Matrix4.View (Vector3.FromElements (0, 0, 5), Vector3.FromElements (0, 180, 0));
    SHADER.SetUniformMatrix ("view", new Float32Array (viewMatrix), UniformMatrixType.Matrix4);

    const projectionMatrix = Matrix4.Projection (Angle.DegToRad (60), WEBGL.canvas.clientWidth, WEBGL.canvas.clientHeight, 0.5, 100000);
    SHADER.SetUniformMatrix ("projection", new Float32Array (projectionMatrix), UniformMatrixType.Matrix4);

    WEBGL.context.drawArrays (WEBGL.context.TRIANGLES, 0, MONKEY_MESH.GetVertexCount ());
}

function IsMobile ()
{
    let isAndroid = navigator.userAgent.match (/Android/i);
    let isIOS = navigator.userAgent.match (/iPhone|iPad|iPod/i);
    let isOpera = navigator.userAgent.match (/Opera Mini/i);
    let isWindows = navigator.userAgent.match (/IEMobile/i);
    let isBlackberry = navigator.userAgent.match (/BlackBerry/i);

    return isAndroid || isIOS || isOpera || isWindows || isBlackberry;
}