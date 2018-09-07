{

  const m3 = {
    identity: () => {
      return [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
      ];
    },

    projection: (width, height) => {
      // Note: This matrix flips the Y axis so that 0 is at the top.
      return [
        2 / width, 0, 0,
        0, -2 / height, 0,
        -1, 1, 1
      ];
    },
    
    translation: (tx, ty) => {
      return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1,
      ];
    },

    rotation: angleInRadians => {
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);
      return [
        c, -s, 0,
        s, c, 0,
        0, 0, 1,
      ];
    },

    scaling: (sx, sy) => {
      return [
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1,
      ];
    },

    multiply: (a, b) => {
      const a00 = a[0 * 3 + 0];
      const a01 = a[0 * 3 + 1];
      const a02 = a[0 * 3 + 2];
      const a10 = a[1 * 3 + 0];
      const a11 = a[1 * 3 + 1];
      const a12 = a[1 * 3 + 2];
      const a20 = a[2 * 3 + 0];
      const a21 = a[2 * 3 + 1];
      const a22 = a[2 * 3 + 2];
      const b00 = b[0 * 3 + 0];
      const b01 = b[0 * 3 + 1];
      const b02 = b[0 * 3 + 2];
      const b10 = b[1 * 3 + 0];
      const b11 = b[1 * 3 + 1];
      const b12 = b[1 * 3 + 2];
      const b20 = b[2 * 3 + 0];
      const b21 = b[2 * 3 + 1];
      const b22 = b[2 * 3 + 2];
      return [
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,
        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,
        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22,
      ];
    },
  };

  // Draw the scene.
  const drawScene = (gl, matrixLocation) => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Compute the matrices
    const translationMatrix = m3.translation(translation[0], translation[1]);
    const rotationMatrix = m3.rotation(angleInRadians);
    const scaleMatrix = m3.scaling(scale[0], scale[1]);

    /** 
     * ONE F
     */
    // // Multiply the matrices.
    // let matrix = m3.multiply(translationMatrix, rotationMatrix);
    // matrix = m3.multiply(matrix, scaleMatrix);
    // // Try this instead (different orders)
    // // let matrix = m3.multiply(scaleMatrix, rotationMatrix);
    // // matrix = m3.multiply(matrix, translationMatrix);

    // // Set the matrix.
    // gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // // Draw the geometry.
    // const primitiveType = gl.TRIANGLES;
    // offset = 0;
    // const count = 18;  // 6 triangles in the 'F', 3 points per triangle
    // gl.drawArrays(primitiveType, offset, count);

    /** 
     * FIVE F's
     */
    // Starting Matrix.
    let matrix = m3.identity();
    // Projection matrix
    matrix = m3.multiply(matrix, m3.projection(gl.canvas.width, gl.canvas.height));

    for (let i = 0; i < 5; ++i) {
      // Multiply the matrices.
      matrix = m3.multiply(matrix, translationMatrix);
      matrix = m3.multiply(matrix, rotationMatrix);
      matrix = m3.multiply(matrix, scaleMatrix);

      // Set the matrix.
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, 18);
    }
  }

  let translation = [60, 40];
  let angleInRadians = 0;
  let scale = [0.85, 0.85];

  const init = () => {
    // Get A WebGL context
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }

    // setup GLSL program
    const program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(program, "a_position");

    // lookup uniforms
    // NOT NEEDED ANYMORE: we use projection matrix
    // const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    // gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    const colorLocation = gl.getUniformLocation(program, "u_color");
    const color = [Math.random(), Math.random(), Math.random(), 1];
    // set the color
    gl.uniform4fv(colorLocation, color);

    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer to put positions in
    const positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Put geometry data into buffer
    setGeometry(gl);

    // Draw the scene
    drawScene(gl, matrixLocation);

    document.querySelectorAll(`input[type="range"]`).forEach($item => $item.addEventListener(`input`, ({ target: $target }) => {
      if ($target.classList.contains(`translate`))
        translation[$target.dataset.index] = $target.value;
      if ($target.classList.contains(`rotate`)) {
        angleInRadians = $target.value * Math.PI / 180;
      }
      if ($target.classList.contains(`scale`))
        scale[$target.dataset.index] = $target.value / 100;
      drawScene(gl, matrixLocation);
    }));
  }

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
        67, 90,
      ]),
      gl.STATIC_DRAW);
  }

  init();
}