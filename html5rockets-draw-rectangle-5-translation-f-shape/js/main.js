{
  // Returns a random integer from 0 to range - 1.
  const randomInt = (range) => {
    return Math.floor(Math.random() * range);
  }

  // Fills the buffer with the values that define a rectangle.
  const setRectangle = (gl, x, y, width, height) => {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]), gl.STATIC_DRAW);
  }

  let translation = [120, 0];
  const width = 300;
  const height = 150;

  // Draw a the scene.
  const drawScene = (gl) => {
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Setup a rectangle
    setRectangle(gl, translation[0], translation[1], width, height);
    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  const init = () => {
    // Get A WebGL context
    const canvas = document.getElementById(`canvas`);
    const gl = canvas.getContext(`experimental-webgl`);

    // setup a GLSL program
    // const vertexShader = webglUtils.createShaderFromScript(gl, `2d-vertex-shader`);
    // const fragmentShader = webglUtils.createShaderFromScript(gl, `2d-fragment-shader`);
    const { program } = webglUtils.createProgramInfo(gl, [`2d-vertex-shader`, `2d-fragment-shader`]);
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(program, `a_position`);

    // set the resolution
    const resolutionLocation = gl.getUniformLocation(program, `u_resolution`);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    const colorLocation = gl.getUniformLocation(program, `u_color`);

    // Create a buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set a random color.
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

    drawScene(gl);
  }

  init();
}
