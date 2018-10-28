varying highp vec3 diffuse;

void main ()
{
    highp vec3 ambient = vec3 (0.3, 0.3, 0.3);
    highp vec3 lightColor = vec3 (185.0 / 255.0, 156.0 / 255.0, 107.0 / 255.0);

    gl_FragColor = vec4 (clamp ((ambient + lightColor * diffuse).xyz, 0.0, 1.0), 1.0);
}