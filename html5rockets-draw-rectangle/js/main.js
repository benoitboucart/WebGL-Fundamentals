{
  const init = () => {
    // Get A WebGL context
    const canvas = document.getElementById(`canvas`);
    const gl = canvas.getContext(`experimental-webgl`);

    // setup a GLSL program
    // const vertexShader = webglUtils.createShaderFromScript(gl, `2d-vertex-shader`);
    // const fragmentShader = webglUtils.createShaderFromScript(gl, `2d-fragment-shader`);
    const {program} = webglUtils.createProgramInfo(gl, [`2d-vertex-shader`, `2d-fragment-shader`]);
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(program, `a_position`);

    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // set the resolution
    const resolutionLocation = gl.getUniformLocation(program, `u_resolution`);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // setup a rectangle from 10,20 to 80,30 in pixels
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      10, 20,
      80, 20,
      10, 30,
      10, 30,
      80, 20,
      80, 30
    ]), gl.STATIC_DRAW);
    // gl.bufferData(
    //   gl.ARRAY_BUFFER,
    //   new Float32Array([
    //     -1.0, -1.0,
    //     1.0, -1.0,
    //     -1.0, 1.0,
    //     -1.0, 1.0,
    //     1.0, -1.0,
    //     1.0, 1.0
    //   ]),
    //   gl.STATIC_DRAW
    // );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  init();
}
