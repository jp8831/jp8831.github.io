function RunDemo ()
{
    let canvas  = document.getElementById ("webgl-canvas");
    let webgl = new WebGL (canvas);

    let isInitFailed = !webgl.Init ();

    if (isInitFailed)
    {
        alert("사용 중인 브라우저가 WebGL을 지원하지 않습니다.");

        return;
    }
    webgl.EnableDepthTest ();
    webgl.EnableBackFaceCulling ();

    webgl.Clear ();
}

function OnClickNavigationMenuIcon ()
{
    document.getElementById ("navigation-menu").classList.toggle ("show");
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