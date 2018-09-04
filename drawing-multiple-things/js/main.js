{
  function init() {
    // Get A WebGL context
    const canvas = document.querySelector(`#canvas`);
    const gl = canvas.getContext(`webgl`);
    if (!gl) {
      return;
    }

    const createFlattenedVertices = (gl, vertices) => {
      return webglUtils.createBufferInfoFromArrays(
        gl,
        primitives.makeRandomVertexColors(
          primitives.deindexVertices(vertices),
          {
            vertsPerColor: 6,
            rand: function (ndx, channel) {
              return channel < 3 ? ((128 + Math.random() * 128) | 0) : 255;
            }
          })
      );
    };

    const sphereBufferInfo = createFlattenedVertices(gl, primitives.createSphereVertices(10, 12, 6));
    const cubeBufferInfo = createFlattenedVertices(gl, primitives.createCubeVertices(20));
    const coneBufferInfo = createFlattenedVertices(gl, primitives.createTruncatedConeVertices(10, 0, 20, 12, 1, true, false));

    // setup GLSL program
    const programInfo = webglUtils.createProgramInfo(gl, [`3d-vertex-shader`, `3d-fragment-shader`]);

    const degToRad = (d) => {
      return d * Math.PI / 180;
    }

    const cameraAngleRadians = degToRad(0);
    const fieldOfViewRadians = degToRad(60);
    const cameraHeight = 50;

    // Uniforms for each object.
    var sphereUniforms = {
      u_colorMult: [0.5, 1, 0.5, 1],
      u_matrix: m4.identity(),
    };
    var cubeUniforms = {
      u_colorMult: [1, 0.5, 0.5, 1],
      u_matrix: m4.identity(),
    };
    var coneUniforms = {
      u_colorMult: [0.5, 0.5, 1, 1],
      u_matrix: m4.identity(),
    };
    const sphereTranslation = [0, 0, 0];
    const cubeTranslation = [-40, 0, 0];
    const coneTranslation = [40, 0, 0];

    const computeMatrix = (viewProjectionMatrix, translation, xRotation, yRotation) => {
      let matrix = m4.translate(viewProjectionMatrix,
        translation[0],
        translation[1],
        translation[2]);
      matrix = m4.xRotate(matrix, xRotation);
      return m4.yRotate(matrix, yRotation);
    }

    // Draw the scene.
    const drawScene = (time) => {
      time *= 0.0005;

      webglUtils.resizeCanvasToDisplaySize(gl.canvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);

      // Clear the canvas AND the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Compute the projection matrix
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

      // Compute the camera's matrix using look at.
      const cameraPosition = [0, 0, 100];
      const target = [0, 0, 0];
      const up = [0, 1, 0];
      const cameraMatrix = m4.lookAt(cameraPosition, target, up);

      // Make a view matrix from the camera matrix.
      const viewMatrix = m4.inverse(cameraMatrix);

      const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

      const sphereXRotation = time;
      const sphereYRotation = time;
      const cubeXRotation = -time;
      const cubeYRotation = time;
      const coneXRotation = time;
      const coneYRotation = -time;

      // ------ Draw the sphere --------
      gl.useProgram(programInfo.program);

      // Setup all the needed attributes.
      webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);

      sphereUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        sphereTranslation,
        sphereXRotation,
        sphereYRotation);

      // Set the uniforms we just computed
      webglUtils.setUniforms(programInfo, sphereUniforms);

      gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);

      // ------ Draw the cube --------

      // Setup all the needed attributes.
      webglUtils.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);

      cubeUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        cubeTranslation,
        cubeXRotation,
        cubeYRotation
      );

      // Set the uniforms we just computed
      webglUtils.setUniforms(programInfo, cubeUniforms);

      gl.drawArrays(gl.TRIANGLES, 0, cubeBufferInfo.numElements);

      // ------ Draw the cone --------

      // Setup all the needed attributes.
      webglUtils.setBuffersAndAttributes(gl, programInfo, coneBufferInfo);

      coneUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        coneTranslation,
        coneXRotation,
        coneYRotation);

      // Set the uniforms we just computed
      webglUtils.setUniforms(programInfo, coneUniforms);

      gl.drawArrays(gl.TRIANGLES, 0, coneBufferInfo.numElements);

      requestAnimationFrame(drawScene);
    }

    requestAnimationFrame(drawScene);
  }

  init();
}