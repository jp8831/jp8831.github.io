var vertexShaderSource = `
attribute vec4 aVertexPosition;

void main ()
{
    gl_Position = aVertexPosition;
}
`;

var fragmentShaderSource = `
void main ()
{
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

var vertexPositions = 
[
    0.0, 0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, -0.5, 0.0
];

function main ()
{
    let canvas = document.getElementById ("webgl-canvas");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    let webgl = canvas.getContext ("webgl");

    if (!webgl)
    {
        alert("사용 중인 브라우저가 WebGL을 지원하지 않습니다.");

        return;
    }

    webgl.enable (webgl.DEPTH_TEST);
    webgl.depthFunc (webgl.LEQUAL);

    webgl.clearColor (0.0, 0.0, 0.0, 1.0);
    webgl.clearDepth (1.0);
    webgl.clear (webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    let shaderProgram = InitShaderProgram (webgl, vertexShaderSource, fragmentShaderSource);
    let vertPosAttribLocation = webgl.getAttribLocation (shaderProgram, "aVertexPosition");
    let vertexBuffer = InitBuffer (webgl, vertexPositions);

    webgl.bindBuffer (webgl.ARRAY_BUFFER, vertexBuffer);
    webgl.vertexAttribPointer (vertPosAttribLocation, 3, webgl.FLOAT, false, 0, 0);
    webgl.enableVertexAttribArray (vertPosAttribLocation);

    webgl.useProgram (shaderProgram);

    webgl.drawArrays (webgl.TRIANGLES, 0, 3);
}

function InitBuffer (webgl, data)
{
    let buffer = webgl.createBuffer ();

    webgl.bindBuffer (webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData (webgl.ARRAY_BUFFER, new Float32Array (data), webgl.STATIC_DRAW);

    return buffer;
}

function InitShaderProgram (webgl, vertexShaderSource, fragmentShaderSource)
{
    let vertexShader = LoadShader (webgl, webgl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShdaer = LoadShader (webgl, webgl.FRAGMENT_SHADER, fragmentShaderSource);
    let shaderProgram = webgl.createProgram ();

    webgl.attachShader (shaderProgram, vertexShader);
    webgl.attachShader (shaderProgram, fragmentShdaer);
    webgl.linkProgram (shaderProgram);

    let isLinkFail = !webgl.getProgramParameter (shaderProgram, webgl.LINK_STATUS);

    if (isLinkFail)
    {
        let log = webgl.getProgramInfoLog (shaderProgram);

        alert ("Shader 프로그램을 초기화하는 데 실패했습니다.");

        webgl.deleteShader (vertexShader);
        webgl.deleteShader (fragmentShdaer);
        webgl.deleteProgram (shaderProgram);

        return null;
    }

    return shaderProgram;
}

function LoadShader (webgl, shaderType, shaderSource)
{
    let shader = webgl.createShader (shaderType);

    webgl.shaderSource (shader, shaderSource);
    webgl.compileShader (shader);

    let isCompileFail = !webgl.getShaderParameter (shader, webgl.COMPILE_STATUS);

    if (isCompileFail)
    {
        alert ("Shader를 컴파일하는 데 실패했습니다.");

        webgl.deleteShader (shader);

        return null;
    }

    return shader;
}