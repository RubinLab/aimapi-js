import { bidirectional } from "./cornerstoneShapes/Bidirectional";
import { circle } from "./cornerstoneShapes/Circle";
import { freehand } from "./cornerstoneShapes/Freehand";
import { line } from "./cornerstoneShapes/Line";
import { probe } from "./cornerstoneShapes/Probe";

// TODO calculations are not taken from aim?
// make sure the calculations are correct if there is more than one line
function createLine(data, points, calculations) {
  data.handles.start.x = points[0].x.value;
  data.handles.start.y = points[0].y.value;
  data.handles.end.x = points[1].x.value;
  data.handles.end.y = points[1].y.value;
  data.length = 0;
  if (calculations) {
    for (let i = 0; i < calculations.length; i += 1) {
      // TODO check with Mete
      if (calculations[i].type === "Length") {
        // !! no unit in report classes
        data.length = parseFloat(calculations[i].value);
        data.unit = calculations[i].unit;
        break;
      }
    }
  }
}

function createBidirectional(data, points, calculations) {
  data.handles.start.x = points[0].x.value;
  data.handles.start.y = points[0].y.value;
  data.handles.end.x = points[1].x.value;
  data.handles.end.y = points[1].y.value;
  data.handles.perpendicularStart.x = points[2].x.value;
  data.handles.perpendicularStart.y = points[2].y.value;
  data.handles.perpendicularEnd.x = points[3].x.value;
  data.handles.perpendicularEnd.y = points[3].y.value;
  // need to set the text box coordinates for this too
  data.handles.textBox.x = points[0].x.value;
  data.handles.textBox.y = points[0].y.value;
  if (calculations) {
    for (let i = 0; i < calculations.length; i += 1) {
      // TODO check with Mete
      if (calculations[i].type === "LongAxis") {
        data.longestDiameter = parseFloat(calculations[i].value);
        data.unit = calculations[i].unit; // TODO ??
      }
      if (calculations[i].type === "ShortAxis") {
        data.shortestDiameter = parseFloat(calculations[i].value);
        data.unit = calculations[i].unit; // TODO ??
      }
    }
  }
}

function createPoint(data, points) {
  data.handles.end.x = points[0].x.value;
  data.handles.end.y = points[0].y.value;
}

function createCircle(data, points, calculations) {
  data.handles.start.x = points[0].x.value;
  data.handles.start.y = points[0].y.value;
  data.handles.end.x = points[1].x.value;
  data.handles.end.y = points[1].y.value;
  // TODO what are calculations. no circle class in adapter
  // if (calculations) {
  //   for (let i=0; i< calculations.length; i += 1) {
  //     console.error('calc', calculations[i].type, calculations[i].value, calculations[i]);
  //     // TODO check with Mete
  //     if (calculations[i].type === 'Length') {
  //       // !! no unit in report classes
  //       data.length = parseFloat(calculations[i].value);
  //       data.unit = calculations[i].unit;
  //       break;
  //     }
  //   }
  // }
}

function createFreehand(data, points, calculations) {
  const freehandPoints = [];
  const modulo = points.length;
  points.forEach((point, index) => {
    const linesIndex = (index + 1) % modulo;
    const freehandPoint = {};
    freehandPoint.x = point.x.value;
    freehandPoint.y = point.y.value;
    freehandPoint.highlight = true;
    freehandPoint.active = true;
    freehandPoint.lines = [
      { x: points[linesIndex].x.value, y: points[linesIndex].y.value },
    ];
    freehandPoints.push(freehandPoint);
  });
  data.handles.points = [...freehandPoints];
  // TODO what are calculations. no circle class in adapter
  // if (calculations) {
  //   for (let i=0; i< calculations.length; i += 1) {
  //     console.error('calc', calculations[i].type, calculations[i].value, calculations[i]);
  //     // TODO check with Mete
  //     if (calculations[i].type === 'Length') {
  //       // !! no unit in report classes
  //       data.length = parseFloat(calculations[i].value);
  //       data.unit = calculations[i].unit;
  //       break;
  //     }
  //   }
  // }
}

function createCornerstoneTool(
  markup,
  color,
  invalidated = true,
  shape,
  createMethod
) {
  const data = JSON.parse(JSON.stringify(shape));
  data.color = markup.color ? markup.color : color;
  data.aimId = markup.aimUid;
  data.invalidated = invalidated;
  createMethod(data, markup.coordinates, markup.calculations);
  return data;
}

// TODO markuptype and coordinates
export function createTool(markup, color, invalidated = true) {
  const type = markup.markupType || markup["xsi:type"];
  switch (type) {
    case "TwoDimensionPolyline":
      return {
        type: "FreehandRoi",
        data: createCornerstoneTool(
          markup,
          color,
          invalidated,
          freehand,
          createFreehand
        ),
      };
    case "TwoDimensionMultiPoint":
      return {
        type: "Length",
        data: createCornerstoneTool(
          markup,
          color,
          invalidated,
          line,
          createLine
        ),
      };
    case "TwoDimensionCircle":
      return {
        type: "CircleRoi",
        data: createCornerstoneTool(
          markup,
          color,
          invalidated,
          circle,
          createCircle
        ),
      };
    case "TwoDimensionPoint":
      return {
        type: "Probe",
        data: createCornerstoneTool(
          markup,
          color,
          invalidated,
          probe,
          createPoint
        ),
      };
    case "Bidirectional":
      return {
        type: "Bidirectional",
        data: createCornerstoneTool(
          markup,
          color,
          invalidated,
          bidirectional,
          createBidirectional
        ),
      };
      break;
    default:
      return;
  }
}

export function linesToPerpendicular (values) {
  // Takes two lines on the same image, checks if they belong to same Aima and if they are perpendicular.
  // If so, merges two lines on line1, cnahges the markup type from line to perpendicular
  // And deletes the second line not to be reRendered as line agai
  const lines = values.filter(checkIfLine);

  const groupedLines = Object.values(groupBy(lines, "aimUid"));
  groupedLines.forEach((lines) => {
    if (lines.length > 1) {
      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          let pair = [lines[i], lines[j]];
          if (checkIfPerpendicular(pair) && intersects(pair)) {
            // there are multiple lines on the same image that belongs to same aim, a potential perpendicular
            // they are perpendicular, remove them from the values list and render them as perpendicular
            pair[0].markupType = "Bidirectional";
            pair[0].calculations = pair[0].calculations.concat(
              pair[1].calculations
            );
            pair[0].coordinates = pair[0].coordinates.concat(
              pair[1].coordinates
            );

            const index = values.indexOf(pair[1]);
            if (index > -1) {
              values.splice(index, 1);
            }
          }
        }
      }
    }
  });
  return values;
};

function checkIfPerpendicular(lines) {
  const slope1 = getSlopeOfLine(
    lines[0]["coordinates"][0],
    lines[0]["coordinates"][1]
  );
  const slope2 = getSlopeOfLine(
    lines[1]["coordinates"][0],
    lines[1]["coordinates"][1]
  );

  if (
    (slope1 === "infinity" && slope2 === 0) ||
    (slope1 === 0 && slope2 === "infinity")
  )
    return true;
  else if (Math.round((slope1 * slope2 * 100) / 100) == -1) return true;
  return false;
};

function getSlopeOfLine (p1, p2) {
  if (p2.x.value - p1.x.value === 0) return "infinity";
  return (p1.y.value - p2.y.value) / (p1.x.value - p2.x.value);
};
function checkIfLine (markup)  {
  if (markup) {
    return markup.markupType === "TwoDimensionMultiPoint";
  }
};

// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects (lines) {
  const a = lines[0]["coordinates"][0].x.value;
  const b = lines[0]["coordinates"][0].y.value;
  const c = lines[0]["coordinates"][1].x.value;
  const d = lines[0]["coordinates"][1].y.value;
  const p = lines[1]["coordinates"][0].x.value;
  const q = lines[1]["coordinates"][0].y.value;
  const r = lines[1]["coordinates"][1].x.value;
  const s = lines[1]["coordinates"][1].y.value;
  var det, gamma, lambda;

  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
};

function groupBy (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
