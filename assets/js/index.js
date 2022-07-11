const markers = [{
    name: 'Tokyo',
    lat: 35,
    long: 138
  },
  {
    name: 'Lima',
    lat: -12.04,
    long: -72.04
  },
  {
    name: 'Guadalajara',
    lat: 20.65,
    long: -103.34
  },
  {
    name: 'Paris',
    lat: 46,
    long: 3
  }];
  
  const $ = {
    canvas: null,
    ctx: null,
    vCenter: 820,
    scroll: {
      lat: 0,
      long: 20
    },
    markers: [],
    timing: {
      speed: 2,
      delta: 0,
      last: 0
    },
    drag: {
      start: { x: 0, y: 0 },
      force: 0,
      prevX: 0,
      isDragging: false
    },
    colors: {
      pushPinBase: '#969799',
      pushPin: '#ed5c50',
      land: '#fac648', //'#ffc975',
      landShade: '#2c606e',
      ocean: '#2A7B96'
    },
    complexShapes: {
      // put complex shapes here
    }
  }
}

const lerp = (norm, min, max) => {
  return (max - min) * norm + min;
}

const norm = (value, min, max) => {
  return (value - min) / (max - min);
}

const map = (value, sourceMin, sourceMax, destMin, destMax) => {
  return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
}

const dragMove = (e) => {
  if($.drag.isDragging) {
    let long = $.drag.start.long,
        clientX = e.targetTouches ? e.targetTouches[0].clientX : e.clientX,
        change = clientX - $.drag.start.x,
        prevChange = clientX - $.drag.prevX,
        canvasWidth = $.canvas.getBoundingClientRect().width;
    
    long += map(change, 0, canvasWidth, 0, 200);
    
    while(long < 0) {
      long += 360;
    } 
    
    if(prevChange > 0 && $.drag.force < 0) {
      $.drag.force = 0;
    } else if(prevChange < 0 && $.drag.force > 0) {
      $.drag.force = 0;
    }
    
    $.drag.force += prevChange * (600 / canvasWidth);
    $.drag.prevX = clientX;
    $.scroll.long = Math.abs(long) % 360;
  }
}

const dragStart = (e) => {
  if (e.targetTouches) {
    e.preventDefault();
        $.drag.start = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      long: $.scroll.long
    };
  } else {
    $.drag.start = {
      x: e.clientX,
      y: e.clientY,
      long: $.scroll.long
    };
  }
  $.timing.speed = 0;
  $.drag.isDragging = true;
  $.canvas.classList.add('globe--dragging');
}

const dragEnd = (e) => {
  if($.drag.isDragging) {
    $.timing.speed = map($.drag.force, 0, 220, 0, 40);
    $.drag.isDragging = false;
    $.canvas.classList.remove('globe--dragging');
  }
}

const getRadius = (latitude) => {
  let yPart = Math.PI*2,
      radius = 600,
      frame = map(latitude, 90, -90, 0, 1.65);
  
  return Math.max(Math.sin(yPart + frame) * radius, 0);
}

const latLongSphere  = (lat, lon, radius) => {
    let x = 900,
        y = $.vCenter,
        z = 0;

    lon = -lon;
    let phi = (90-lat) * (Math.PI/180),
    teta = (lon + 180) * (Math.PI/180);

    x -= -(radius * Math.sin(phi) * Math.cos(teta));
    y -= radius * Math.cos(phi);
    z = radius * Math.sin(phi) * Math.sin(teta);

    return {
      x, y, z
    };
}

const drawGlobe = (ctx, color) => {
  ctx.beginPath();
  ctx.arc(900, $.vCenter, 600, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

const getLandMassPaths = (name, radius, thickness) => {
  let landmassBasic = continents[name],
      landmass = null,
      first = true,
      rotated = false,
      paths = {
        ground: new Path2D(),
        top: new Path2D(),
        sections: [],
        isVisible: false
      },
      section = {
        ground: [],
        top: []
      };

    // Complexify
    if($.complexShapes[name]) {
      landmass = $.complexShapes[name];
    } else {
      landmass = complexify(landmassBasic, 1);
      $.complexShapes[name] = landmass;
    }
    
    for (let i = 0; i < landmass.length; i++) {
      let point = landmass[0],
          p = latLongSphere(point.lat + $.scroll.lat, point.long + $.scroll.long, radius);
      
        if(p.z < 0) {
          landmass.splice(0, 0, landmass.pop());
          rotated = true;
        } else {
          break;
        }
    }

    let drawCurve = false,
        curveStart = null,
        sectionIsVisible = false;

    landmass.forEach((point) => {
      let p = latLongSphere(point.lat + $.scroll.lat, point.long + $.scroll.long, radius),
          p2 = latLongSphere(point.lat + $.scroll.lat, point.long + $.scroll.long, radius + thickness);
      
      if(!sectionIsVisible && p.z > -200) {
        sectionIsVisible = true;
      }
      
      section.ground.push({
        x: p.x,
        y: p.y,
        z: p.z
      });
      section.top.push({
        x: p2.x,
        y: p2.y,
        z: p2.z
      });

      if(point.edge && !first) {
        if(sectionIsVisible) {
          paths.sections.push(Object.assign({}, section));
        }
        
        section = {
          ground: [{x: p.x, y: p.y, z: p.z }],
          top: [{x: p2.x, y: p2.y, z: p2.z }]
        };
        
        sectionIsVisible = false;
      }
      
      first = false;

      if(p.z > 0) {
        if(drawCurve) {
            drawCurve = false;
            closeCurve(paths.ground, curveStart, p, radius);
            closeCurve(paths.top, curveStart, p2, radius + thickness);
          } else {
            paths.ground.lineTo(p.x, p.y);
            paths.top.lineTo(p2.x, p2.y);
            paths.isVisible = true;
          }
      } else {
        // draw curve
        if(!drawCurve) {   
          drawCurve = true;
          curveStart = {
            x: p.x,
            y: p.y,
            z: p.z
          };
        }
      }
    });

    // if the last point is in a curve
    if(drawCurve) {
      drawCurve = false;
      let point = landmass.slice(-1)[0],
          p = latLongSphere(point.lat + $.scroll.lat, point.long + $.scroll.long, radius),
          p2 = latLongSphere(point.lat + $.scroll.lat, point.long + $.scroll.long, radius + thickness);
      
      closeCurve(paths.ground, curveStart, p, radius);
      closeCurve(paths.top, curveStart, p2, radius + thickness);
    }
    
    let p = latLongSphere(landmass[0].lat + $.scroll.lat, landmass[0].long + $.scroll.long, radius),
        p2 = latLongSphere(landmass[0].lat + $.scroll.lat, landmass[0].long + $.scroll.long, radius + thickness);  
    
    section.ground.push({
        x: p.x,
        y: p.y,
        z: p.z
      });
      section.top.push({
        x: p2.x,
        y: p2.y,
        z: p2.z
      });
  
    if(section) {
      paths.sections.push(Object.assign({}, section));
    }
    
    return paths;
}

const closeCurve = (path, curveStart, p, radius) => {
    // draw curve from curveStart på p
    let a1 = getAngle({ x: 900, y: $.vCenter}, curveStart),
        a2 = getAngle({ x: 900, y: $.vCenter}, p),
        compare = a1 - a2,
        startAngle = a1 * (Math.PI/180),
        endAngle = a2 * (Math.PI/180);
  
    path.arc(900, $.vCenter, radius, startAngle, endAngle, compare > 0 && compare < 180);
  }

const getCirclePoint = (angle, radius) => {
  let radian = (angle / 180) * Math.PI;
  
  return {
    x: radius * Math.cos(radian) + 900,
    y: radius * Math.sin(radian) + 800
   }
}

const getAngle = (p1, p2) => {
  let dy = p2.y - p1.y,
      dx = p2.x - p1.x,
      theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  return theta;
}

const complexify = (landmass, level) => {
  let complex = [];
  
  for (let i = 0; i < (landmass.length - 1); i++) {
    let p1 = landmass[i],
        p2 = landmass[i + 1],
        steps = Math.floor(distanceBetween(p1, p2) / level);

    p1.edge = true;
    complex.push(p1);

    if(steps > 0) {
      let s = Math.floor(100 / steps);
      
      for (let i = 1; i <= steps; i++) {
        let percentage = i * s;
        
        if(percentage <= 100) {
          let p = {
            lat: map(percentage, 0, 100, p1.lat, p2.lat),
            long: map(percentage, 0, 100, p1.long, p2.long)
          }
          
          complex.push(p);
        }
      }
    }
  }
  
  const drawMarkerText = (ctx, text, pos) => {
      ctx.font = "60px 'Roboto'";
      ctx.fillStyle = 'black';
    
      let metrics = ctx.measureText(text); 
    
      ctx.fillText(text, pos.x - (metrics.width / 2), pos.y - 30);
  }
  
  if($.timing.speed) {
    $.scroll.long += Math.round = ($.timing.speed / 100) * delta;
    
    // Scale click to responsive canvas
    clickPos.x *= 1800 / rect.width;
    clickPos.y *= 1600 / rect.height;
    
    // Compare to existing markers
    for (const marker of markers) {
      let markerPos = latLongSphere(marker.lat + $.scroll.lat, marker.long + $.scroll.long, 630);
      
      // Make sure only frontside markers are clickable
      if(markerPos.z < 0) {
        continue;
      }
      
      if(Math.abs(clickPos.x - markerPos.x) < offset && Math.abs(clickPos.y -markerPos.y) < offset) {
        window.location.replace("./assets/html/" + marker.name + ".html");
        break;
      }
    }
  }
}

const animateLoop = (time) => {
  $.timing.delta = Math.abs($.timing.last - time);
  $.timing.last = time;
  
  updateState($.timing.delta);
  
  // clear
  $.ctx.fillStyle = '#f7f6f2';
  $.ctx.fillRect(0, 0, 1800, 1600);
  
  drawMarkers($.ctx, $.markers, false);
  
  let continentNames = ['southamerica', 'northamerica', 'greenland', 'japan', 'africa', 'australia', 'asia', 'indonesia', 'europe', 'britain', 'madagaskar', 'papua', 'nz']; 
  let landPaths = [],
      se = [];
  
  continentNames.forEach((name) => {
    let paths = getLandMassPaths(name, 600, 30);

    if(paths) {
      $.ctx.fillStyle = $.colors.landShade;

      paths.sections.forEach((section) => {
        se.push(section);
        drawSection($.ctx, section, true);
      });

      if(paths.isVisible) {
        landPaths.push(paths.top);
      }
    }
  });
  
  drawGlobe($.ctx, $.colors.ocean);
  
  $.ctx.fillStyle = $.colors.landShade;
  se.forEach((section) => {  
    drawSection($.ctx, section, false);
  });
  
  landPaths.forEach((path) => {
      $.ctx.fillStyle = $.colors.land;
      $.ctx.fill(path);
  });
  
  drawMarkers($.ctx, $.markers, true);
  
  requestAnimationFrame(animateLoop);
}

const drawSection = (ctx, section, drawBackside) => {
    let hasStarted = false,
        limit = -25;
    
    section.ground.forEach(p => {
      if(drawBackside && p.z < 0 || !drawBackside && p.z >= limit) {
        if(!hasStarted) {
          ctx.beginPath();
          hasStarted = true;
        }
        
        ctx.lineTo(p.x, p.y);
      }
    });
  
    section.top = drawBackside ? section.top.reverse() : section.top;
  
    section.top.forEach(p => {
      if(drawBackside && p.z < 0 || !drawBackside && p.z >= limit) {
        ctx.lineTo(p.x, p.y);
      }
    });
  
    if(hasStarted) {
      ctx.closePath();
      ctx.fill();
    }
}

const drawMarkers = (ctx, markers, drawFront) => {
  for (const marker of markers) {
    let ground = latLongSphere(marker.lat + $.scroll.lat, marker.long + $.scroll.long, 630),
        needleTop = latLongSphere(marker.lat + $.scroll.lat, marker.long + $.scroll.long, 730),
        pinTop = latLongSphere(marker.lat + $.scroll.lat, marker.long + $.scroll.long, 750);
    
    if(ground.z >= 0 && drawFront) {
      drawMapPushPinBase(ctx, ground, needleTop, $.colors.pushPinBase);
      drawMapPushPin(ctx, pinTop, $.colors.pushPin);
      drawMarkerText(ctx, marker.name, pinTop);
    } else if(!drawFront) {
      drawMapPushPin(ctx, pinTop, $.colors.pushPin);
      drawMapPushPinBase(ctx, ground, needleTop, $.colors.pushPinBase);
      drawMarkerText(ctx, marker.name, pinTop);
    }
  }
}

const drawMarkerText = (ctx, text, pos) => {
    ctx.font = "60px 'Pirata One', cursive";
    ctx.fillStyle = 'black';
  
    let metrics = ctx.measureText(text); 
  
    ctx.fillText(text, pos.x - (metrics.width / 2), pos.y - 30);
}

const drawMapPushPinBase = (ctx, basePos, topPos, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(basePos.x, basePos.y);
  ctx.lineTo(topPos.x, topPos.y);
  ctx.stroke();
}

const drawMapPushPin = (ctx, pos, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
  ctx.fill();
}

const onClick = (event) => {
  let offset = 50,
      rect = event.target.getBoundingClientRect(),
      clickPos = {
        x: event.clientX - rect.x,
        y: event.clientY - rect.y 
      }
  
  // Scale click to responsive canvas
  clickPos.x *= 1800 / rect.width;
  clickPos.y *= 1600 / rect.height;
  
  // Compare to existing markers
  for (const marker of markers) {
    let markerPos = latLongSphere(marker.lat + $.scroll.lat, marker.long + $.scroll.long, 630);
    
    // Make sure only frontside markers are clickable
    if(markerPos.z < 0) {
      continue;
    }
    
    if(Math.abs(clickPos.x - markerPos.x) < offset && Math.abs(clickPos.y -markerPos.y) < offset) {
      window.location.replace("./" + marker.name + ".html");
      break;
    }
  }
}

const init = (markers) => {
  $.markers = markers;
  $.canvas = document.querySelector('.globe');
  $.ctx = $.canvas.getContext('2d');
  
  $.canvas.addEventListener("touchstart", dragStart, false);
  $.canvas.addEventListener("mousedown", dragStart, false);
  $.canvas.addEventListener("touchend", dragEnd, false);
  $.canvas.addEventListener("mouseup", dragEnd, false);
  $.canvas.addEventListener("touchmove", dragMove, false);
  $.canvas.addEventListener("mousemove", dragMove, false);
  $.canvas.addEventListener("mouseleave", dragEnd, false);
  $.canvas.addEventListener("touchstart", dragStart, false);
  $.canvas.addEventListener("click", onClick, false);
  
  requestAnimationFrame(animateLoop);
}

init(markers);
