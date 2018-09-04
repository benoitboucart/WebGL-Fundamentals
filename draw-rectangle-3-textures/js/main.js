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

  const render = image => {
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
    /** start texture code **/
    // look up where the texture coordinates need to go.
    const texCoordLocation = gl.getAttribLocation(program, `a_texCoord`);

    // provide texture coordinates for the rectangle.
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Create a texture.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    /** end texture code **/

    // Create a buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // draw 50 random rectangles in random colors
    for (let ii = 0; ii < 50; ++ii) {
      // Setup a random rectangle
      setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

      // Draw the rectangle.
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  const init = () => {
    const image = new Image();
    image.src = `assets/img/devine.jpg`;  // MUST BE SAME DOMAIN!!!
    image.addEventListener(`load`, () => {
      render(image);
    });
  }

  init();
}
