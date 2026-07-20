/* =================================================================
   scene3d.js — cena Three.js do hero
   Rede de nodes 3D conectados (grafo tipo cérebro/AST) + símbolos
   de programação flutuando ao redor. Discreto, à direita, com
   pulso de dados entre os nodes conectados.
   ================================================================= */

(function(){
  var container = document.getElementById('hero-3d');
  if (!container) return;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js não carregou — cena 3D desativada, canvas 2D continua.');
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0A0F0A, 0.08);

  var camera = new THREE.PerspectiveCamera(
    50, container.offsetWidth / container.offsetHeight, 0.1, 100
  );
  camera.position.z = 8;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  var root = new THREE.Group();
  scene.add(root);

  /* --------------- 1. Rede de nodes 3D --------------- */
  var nodes = [];
  var nodeGeo = new THREE.SphereGeometry(0.08, 8, 8);
  var nodeMat = new THREE.MeshBasicMaterial({
    color: 0x7CFF6B, transparent: true, opacity: 0.85
  });
  var hubMat = new THREE.MeshBasicMaterial({
    color: 0xB8FF3A, transparent: true, opacity: 1
  });

  // 6 hubs centrais
  for (var i = 0; i < 6; i++) {
    var angle = (i / 6) * Math.PI * 2;
    var mesh = new THREE.Mesh(nodeGeo, hubMat);
    mesh.scale.setScalar(2.2);
    mesh.position.set(
      Math.cos(angle) * 1.2,
      Math.sin(angle) * 1.2,
      (Math.random() - 0.5) * 0.6
    );
    mesh.userData = {
      basePos: mesh.position.clone(),
      pulseOffset: Math.random() * Math.PI * 2,
      hub: true, baseScale: 2.2
    };
    root.add(mesh);
    nodes.push(mesh);
  }

  // 18 satélites em casca esférica
  for (var i = 0; i < 18; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    var r = 2.2 + Math.random() * 1.6;
    var mesh = new THREE.Mesh(nodeGeo, nodeMat);
    var s = 0.8 + Math.random() * 0.8;
    mesh.scale.setScalar(s);
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi) * 0.6
    );
    mesh.userData = {
      basePos: mesh.position.clone(),
      pulseOffset: Math.random() * Math.PI * 2,
      hub: false, baseScale: s
    };
    root.add(mesh);
    nodes.push(mesh);
  }

  /* --------------- 2. Linhas conectando nodes próximos --------------- */
  var connections = [];
  var MAX_CONN_DIST = 2.2;
  for (var i = 0; i < nodes.length; i++) {
    for (var j = i + 1; j < nodes.length; j++) {
      var d = nodes[i].position.distanceTo(nodes[j].position);
      if (d < MAX_CONN_DIST) connections.push({ a: i, b: j });
    }
  }

  var lineGeo = new THREE.BufferGeometry();
  var linePositions = new Float32Array(connections.length * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  var lineMat = new THREE.LineBasicMaterial({
    color: 0x7CFF6B, transparent: true, opacity: 0.25
  });
  var lines = new THREE.LineSegments(lineGeo, lineMat);
  root.add(lines);

  /* --------------- 3. Pulsos de dados percorrendo linhas --------------- */
  var pulses = [];
  var pulseGeo = new THREE.SphereGeometry(0.06, 6, 6);

  for (var i = 0; i < 8; i++) {
    if (connections.length === 0) break;
    var conn = connections[Math.floor(Math.random() * connections.length)];
    var mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.7 ? 0xFF6B4A : 0x7CFF6B,
      transparent: true, opacity: 1
    });
    var mesh = new THREE.Mesh(pulseGeo, mat);
    var p = {
      conn: conn,
      t: Math.random(),
      speed: 0.008 + Math.random() * 0.012,
      mesh: mesh
    };
    root.add(mesh);
    pulses.push(p);
  }

  /* --------------- 4. Símbolos de código flutuando --------------- */
  var codeSymbols = ['{ }', '< >', '=>', '/*', '*/', '//', '[]', '()', '&&', '||', '===', '!=', 'fn', 'if', 'let'];
  var symbolSprites = [];

  function makeSymbolTexture(text){
    var canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(124, 255, 107, 0.75)';
    ctx.font = 'bold 42px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);
    var tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  for (var i = 0; i < 14; i++) {
    var symbol = codeSymbols[i % codeSymbols.length];
    var tex = makeSymbolTexture(symbol);
    var mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: 0.35 + Math.random() * 0.35
    });
    var sprite = new THREE.Sprite(mat);
    var scale = 0.55 + Math.random() * 0.45;
    sprite.scale.set(scale, scale, 1);
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    var r = 3.8 + Math.random() * 2;
    sprite.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi) * 0.5
    );
    sprite.userData = {
      basePos: sprite.position.clone(),
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.3 + Math.random() * 0.4
    };
    root.add(sprite);
    symbolSprites.push(sprite);
  }

  /* --------------- 5. Interação com mouse --------------- */
  var mouseX = 0, mouseY = 0;
  var targetRotX = 0, targetRotY = 0;

  window.addEventListener('mousemove', function(e){
    var rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  });

  /* --------------- 6. Loop de animação --------------- */
  var t0 = performance.now();

  function tick(){
    var t = (performance.now() - t0) / 1000;

    // nodes respiram
    nodes.forEach(function(node){
      var ud = node.userData;
      var pulse = Math.sin(t * 1.5 + ud.pulseOffset) * 0.5 + 0.5;
      var scaleAmt = ud.hub ? (1 + pulse * 0.15) : (1 + pulse * 0.08);
      node.scale.setScalar(ud.baseScale * scaleAmt);
      var driftX = Math.sin(t * 0.5 + ud.pulseOffset) * 0.08;
      var driftY = Math.cos(t * 0.6 + ud.pulseOffset) * 0.08;
      node.position.x = ud.basePos.x + driftX;
      node.position.y = ud.basePos.y + driftY;
    });

    // linhas seguem nodes
    for (var i = 0; i < connections.length; i++) {
      var conn = connections[i];
      var na = nodes[conn.a];
      var nb = nodes[conn.b];
      linePositions[i * 6]     = na.position.x;
      linePositions[i * 6 + 1] = na.position.y;
      linePositions[i * 6 + 2] = na.position.z;
      linePositions[i * 6 + 3] = nb.position.x;
      linePositions[i * 6 + 4] = nb.position.y;
      linePositions[i * 6 + 5] = nb.position.z;
    }
    lineGeo.attributes.position.needsUpdate = true;

    // pulsos viajam pelas conexões
    pulses.forEach(function(p){
      p.t += p.speed;
      if (p.t >= 1) {
        p.conn = connections[Math.floor(Math.random() * connections.length)];
        p.t = 0;
        p.speed = 0.008 + Math.random() * 0.012;
        p.mesh.material.color.setHex(Math.random() > 0.7 ? 0xFF6B4A : 0x7CFF6B);
      }
      var na = nodes[p.conn.a];
      var nb = nodes[p.conn.b];
      p.mesh.position.lerpVectors(na.position, nb.position, p.t);
      var alpha = Math.sin(p.t * Math.PI);
      p.mesh.material.opacity = alpha;
      p.mesh.scale.setScalar(0.5 + alpha * 0.8);
    });

    // símbolos flutuam
    symbolSprites.forEach(function(sp){
      var ud = sp.userData;
      sp.position.y = ud.basePos.y + Math.sin(t * ud.floatSpeed + ud.floatOffset) * 0.15;
      sp.position.x = ud.basePos.x + Math.cos(t * ud.floatSpeed * 0.7 + ud.floatOffset) * 0.1;
    });

    // rotação do grupo com lerp seguindo cursor
    targetRotY += (mouseX * 0.4 - targetRotY) * 0.04;
    targetRotX += (mouseY * 0.3 - targetRotX) * 0.04;
    root.rotation.y = t * 0.08 + targetRotY;
    root.rotation.x = t * 0.03 + targetRotX;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener('resize', function(){
    var w = container.offsetWidth;
    var h = container.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
