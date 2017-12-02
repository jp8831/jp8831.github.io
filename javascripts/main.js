function OnLoadBody ()
{
    var glContext = null;
    var canvas  = document.getElementById ("webgl-canvas");

    glContext = canvas.getContext ("webgl");

    if (!glContext)
    {
        alert("사용 중인 브라우저가 WebGL을 지원하지 않습니다.");
        glContext = null;
    }

    glContext.clearColor (0.0, 0.0, 0.0, 1.0);
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
}

function OnClickNavigationMenuIcon ()
{
    document.getElementById ("navigation-menu").classList.toggle ("show");
}