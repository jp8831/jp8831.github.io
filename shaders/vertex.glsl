attribute vec4 position;
attribute vec4 normal;

uniform mat4 view;
uniform mat4 projection;

varying highp vec3 diffuse;

void main ()
{
    vec3 lightDir = normalize (vec3 (5.0, 5.0, 5.0));
    vec3 normalizedNormal = vec3 (normalize (normal));
    
    diffuse = vec3 (dot (lightDir, normalizedNormal));

    gl_Position = projection * view * position;
}