{
  // Returns a random integer from 0 to range - 1.
  const randomInt = (range) => {
    return Math.floor(Math.random() * range);
  }

  const translation = [0, 0];
  
  // Fill the buffer with the values that define a letter 'F'.
  const setGeometry = (gl) => {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // left column
        0, 0,
        30, 0,
        0, 150,
        0, 150,
        30, 0,
        30, 150,

        // top rung
        30, 0,
        100, 0,
        30, 30,
        30, 30,
        100, 0,
        100, 30,

        // middle rung
        30, 60,
        67, 60,
        30, 90,
        30, 90,
        67, 60,
        67, 90]),
      gl.STATIC_DRAW);
  }

  // Draw a the scene.
  const drawScene = (gl, translationLocation) => {
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the translation.
    gl.uniform2fv(translationLocation, translation);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 18);
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

    // set the translation
    const translationLocation = gl.getUniformLocation(program, `u_translation`);

    // set the resolution
    const resolutionLocation = gl.getUniformLocation(program, `u_resolution`);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    const colorLocation = gl.getUniformLocation(program, `u_color`);

    // Set a random color.
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

    // Create a buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Setup a F shape
    setGeometry(gl);

    // Draw the scene with translation
    drawScene(gl, translationLocation);

    document.querySelectorAll(`input[type="range"]`).forEach($item => $item.addEventListener(`input`, ({target: $target}) => {
      translation[$target.dataset.index] = $target.value;
      drawScene(gl, translationLocation);
    }));
  }

  init();
}
