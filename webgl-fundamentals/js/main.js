{
  const vertexShaderSource = `
    // an attribute will receive data from a buffer
    // vec4 is a 4 dimensional floating point vector (example in JS: a_position = {x: 0, y: 0, z: 0, w: 0})
    // vec2 has only x and y
    attribute vec2 a_position;
    uniform vec2 u_resolution;
  
    void main() {
      // convert the position from pixels to 0.0 to 1.0
      vec2 zeroToOne = a_position / u_resolution;
  
      // convert from 0->1 to 0->2
      vec2 zeroToTwo = zeroToOne * 2.0;
  
      // convert from 0->2 to -1->+1 (clipspace)
      vec2 clipSpace = zeroToTwo - 1.0;
      
      // 0, 0 will be bottom left corner
      // gl_Position = vec4(clipSpace, 0, 1);
      // 0, 0 will be top lef corner instead
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
  `;

  const fragmentShaderSource = `
    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default. It means "medium precision"
    precision mediump float;
    uniform vec4 u_color;

    void main() {
      // gl_FragColor is a special variable a fragment shader
      // is responsible for setting
      // gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
      gl_FragColor = u_color;
    }
  `;

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

    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]), gl.STATIC_DRAW);
  }


  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  const init = () => {
    // Get A WebGL context
    const canvas = document.querySelector(`#canvas`);
    const gl = canvas.getContext(`webgl`);
    if (!gl) {
      console.log(`No WebGL support!`);
      return;
    }

    // Use the strings for our GLSL shaders
    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    const program = createProgram(gl, vertexShader, fragmentShader);

    // Supply data to program
    // a_position which is an attribute van de vertexShaderSource
    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, `a_position`);
    
    // look up uniform locations
    const resolutionUniformLocation = gl.getUniformLocation(program, `u_resolution`);
    const colorUniformLocation = gl.getUniformLocation(program, `u_color`);

    // Attributes get their data from buffers so we need to create a buffer
    // You can think of bind points as internal global variables inside WebGL
    // Create a buffer and put three 2d clip space points in it
    const positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    

    // code above this line is initialization code.
    // code below this line is rendering code.
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    // This tells WebGL the -1 +1 clip space maps to 
    // 0 <-> gl.canvas.width for x 
    // and 0 <-> gl.canvas.height for y
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0); // Define paint color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    // Next we need to tell WebGL how to take data from the buffer we setup above and supply it to the attribute in the shader
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Then we need to specify how to pull the data out
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2;           // 2 components per iteration
    const type = gl.FLOAT;    // the data is 32bit floats
    const normalize = false;  // don't normalize the data
    const stride = 0;         // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;           // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
    
    // set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    
    /**
     * draw 1 rectangle
     * Now we can put data in that buffer by referencing it through the bind point
     * Six 2d points (JS array): 2 triangles to draw a rectangle
     */
    var positions = [
      // x, y are set z & w will be default 0 and 1
      // draw a rectangle made from 2 triangles
      10, 20,
      80, 20,
      10, 30,
      10, 30,
      80, 20,
      80, 30,
    ];
    // WebGL = strongly typed: JS array omzetten naar 32bit floating point 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const primitiveType = gl.TRIANGLES;
    offset = 0;
    // will execute our vertex shader COUNT times (3 for a triangle)
    // first time: a_position.x & y will be 2 first values, 2nd time 2nd two values etc
    const count = 6;
    // Random color
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
    gl.drawArrays(primitiveType, offset, count);

    /**
     * Draw 50 random rectangles in random colors
     */
    for (let ii = 0; ii < 50; ++ii) {
      // Setup a random rectangle
      // This will write to positionBuffer because
      // its the last thing we bound on the ARRAY_BUFFER
      // bind point
      setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

      // Set a random color.
      gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

      // Draw the rectangle.
      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      // will execute our vertex shader COUNT times (3 for a single triangle)
      // first time: a_position.x & y will be 2 first values, 2nd time 2nd two values etc
      const count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  init();
}