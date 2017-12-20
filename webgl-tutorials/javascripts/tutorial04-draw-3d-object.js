function main ()
{
    let canvas = document.getElementById ("webgl-canvas");
    let webgl = canvas.getContext ("webgl");

    if (!webgl)
    {
        alert("사용 중인 브라우저가 WebGL을 지원하지 않습니다.");

        return;
    }

    webgl.clearColor (0.0, 0.0, 0.0, 1.0);

    webgl.clear (webgl.COLOR_BUFFER_BIT);
}