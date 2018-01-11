function RunDemo ()
{
    const WEBGL = new WebGL ();
    const RESOURCE_LOADER = new ResourceLoader ();
    const GAME_ENGINE = new GameEngine (WEBGL, RESOURCE_LOADER);

    WEBGL.SetCanvas ("webgl-canvas");

    RESOURCE_LOADER.SetURIBase ("https://jp8831.github.io");

    GAME_ENGINE.Init ();
    GAME_ENGINE.Loop ();
    GAME_ENGINE.Shutdown ();
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