async function RunDemo ()
{
    const engine = new GameEngine ();

    engine.Init ();

    engine.resource.SetUriBase ("https://jp8831.github.io");
    await engine.resource.Fetch ("monkey.obj", "meshes", ResourceType.MeshData);
    await engine.resource.Fetch ("vertex.glsl", "shaders", ResourceType.ShaderSource);
    await engine.resource.Fetch ("fragment.glsl", "shaders", ResourceType.ShaderSource);

    const monkey = new GameObject ();
    monkey.AddComponent (new Renderer ());
    monkey.AddComponent (new Rotater ());

    engine.AddGameObject (monkey);

    engine.Loop ();

    monkey.GetComponentByName ("Renderer").SetMesh (engine.resource.Get ("monkey.obj"));
    monkey.GetComponentByName ("Renderer").SetShader (engine.resource.Get ("vertex.glsl"), engine.resource.Get ("fragment.glsl"));
}

class Rotater extends Component
{
    Update (deltaTime)
    {
        super.Update (deltaTime);

        const transform = this.gameObject.GetComponentByName ("Transform");
        const rotation = transform.GetRotation ();

        transform.SetRotation (rotation[0], rotation[1] + 30 * deltaTime, rotation[2]);
    }
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