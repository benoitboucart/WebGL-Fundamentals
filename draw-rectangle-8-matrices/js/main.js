{
  // Returns a random integer from 0 to range - 1.
  const randomInt = (range) => {
    return Math.floor(Math.random() * range);
  }

  const translation = [0, 0];
  const rotation = [0, 1];
  const scale = [1, 1];

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
  const drawScene = (gl, translationLocation, rotationLocation, scaleLocation) => {
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the translation.
    gl.uniform2fv(translationLocation, translation);

    // Set the rotation.
    gl.uniform2fv(rotationLocation, rotation);

    // Set the scale.
    gl.uniform2fv(scaleLocation, scale);

    // Draw the geometry (F shape)
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 18;  // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
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
    // set the rotation
    const rotationLocation = gl.getUniformLocation(program, "u_rotation");
    // set the scale
    const scaleLocation = gl.getUniformLocation(program, "u_scale");

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
    drawScene(gl, translationLocation, rotationLocation, scaleLocation);

    document.querySelectorAll(`input[type="range"]`).forEach($item => $item.addEventListener(`input`, ({target: $target}) => {
      if ($target.classList.contains(`translate`))
        translation[$target.dataset.index] = $target.value;
      if ($target.classList.contains(`rotate`)){
        const angleInRadians = $target.value * Math.PI / 180;
        rotation[0] = Math.sin(angleInRadians);
        rotation[1] = Math.cos(angleInRadians);
      }
      if ($target.classList.contains(`scale`))
        scale[$target.dataset.index] = $target.value / 100;
      drawScene(gl, translationLocation, rotationLocation, scaleLocation);
    }));
  }

  init();
}
