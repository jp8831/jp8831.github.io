function RunDemo ()
{
    let webgl = new WebGL ();

    webgl.canvas = document.getElementById ("webgl-canvas");
    webgl.Init ();

    const IS_INIT_WEBGL_FAIL = webgl.canvas === null;

    if (IS_INIT_WEBGL_FAIL)
    {
        alert("사용 중인 브라우저가 WebGL을 지원하지 않습니다.");

        return;
    }

    webgl.EnableDepthTest ();
    webgl.EnableBackFaceCulling ();

    webgl.Clear ();
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