import { bidirectional } from "./cornerstoneTools/Bidirectional";
import { circle } from "./cornerstoneTools/Circle";
import { freehand } from "./cornerstoneTools/Freehand";
import { line } from "./cornerstoneTools/Line";
import { probe } from "./cornerstoneTools/Probe";

// TODO calculations are not taken from aim?
function createLine(data, points, calculations) {
  data.handles.start.x = points[0].x.value;
  data.handles.start.y = points[0].y.value;
  data.handles.end.x = points[1].x.value;
  data.handles.end.y = points[1].y.value;
  data.length = 0;
  if (calculations) {
    for (let i = 0; i < calculations.length; i += 1) {
      console.error(
        "calc",
        calculations[i].type,
        calculations[i].value,
        calculations[i]
      );
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
      console.error(
        "calc",
        calculations[i].type,
        calculations[i].value,
        calculations[i]
      );
      // TODO check with Mete
      if (calculations[i].type === "longAxisLength") {
        data.longAxisLength = parseFloat(calculations[i].value);
        data.unit = calculations[i].unit; // TODO ??
        break;
      }
      if (calculations[i].type === "shortAxisLength") {
        data.shortAxisLength = parseFloat(calculations[i].value);
        data.unit = calculations[i].unit; // TODO ??
        break;
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
  console.error("data", data);
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
