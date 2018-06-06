attribute vec4 position;
attribute vec3 normal;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;

varying highp vec3 diffuse;

void main ()
{
    vec3 lightPos = vec3 (5.0, 5.0, -5.0);

    vec3 lightDir = (world * position).xyz - lightPos;
    lightDir = normalize (lightDir);

    vec3 worldNormal = (world * vec4 (normal, 1.0)).xyz;
    worldNormal = normalize (worldNormal);
    
    diffuse = vec3 (dot (-lightDir, worldNormal));

    gl_Position = projection * view * world * position;
}