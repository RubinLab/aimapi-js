import Aim from "./Aim.jsx";
import { line } from "./Line";
export { Aim };

// moved from aimEditor.jsx
const enumAimType = {
  imageAnnotation: 1,
  seriesAnnotation: 2,
  studyAnnotation: 3,
};

export function getImageIdAnnotations(aims) {
  let imageIdSpecificMarkups = {};
  try {
    aims.forEach((aim) => parseAim(aim, imageIdSpecificMarkups));
  } catch (err) {
    console.error("Preparing ImageIdAnnotations", err);
  }
  return imageIdSpecificMarkups;
}

function parseAim(aim, imageIdSpecificMarkups) {
  var imageAnnotation =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
  if (
    (!imageAnnotation.markupEntityCollection ||
      imageAnnotation.markupEntityCollection.MarkupEntity.length === 0) &&
    (!imageAnnotation.segmentationEntityCollection ||
      imageAnnotation.segmentationEntityCollection.SegmentationEntity.length ===
        0)
  ) {
    const series =
      imageAnnotation.imageReferenceEntityCollection.ImageReferenceEntity[0]
        .imageStudy.imageSeries;
    imageIdSpecificMarkups[
      series.imageCollection.Image[0].sopInstanceUid.root
    ] = [{ aimUid: aim.ImageAnnotationCollection.uniqueIdentifier.root }];
  }

  //check if the aim has markup
  if (imageAnnotation.markupEntityCollection) {
    var markupEntities = imageAnnotation.markupEntityCollection.MarkupEntity;
    markupEntities.forEach((markupEntity) => {
      const { imageId, data } = getMarkup(markupEntity, aim);
      if (!imageIdSpecificMarkups[imageId])
        imageIdSpecificMarkups[imageId] = [data];
      else imageIdSpecificMarkups[imageId].push(data);
    });
  }
  //check if it has segmentation
  if (imageAnnotation.segmentationEntityCollection) {
    var segmentationEntities =
      imageAnnotation.segmentationEntityCollection.SegmentationEntity;
    segmentationEntities.forEach((segmentationEntity) => {
      const { imageId, data } = getSegmentation(segmentationEntity, aim);
      if (!imageIdSpecificMarkups[imageId])
        imageIdSpecificMarkups[imageId] = [data];
      else imageIdSpecificMarkups[imageId].push(data);
    });
  }

  if (!imageAnnotation.markupEntityCollection && !imageAnnotation.segmentationEntityCollection) {
    imageIdSpecificMarkups[imageId] = [];
  }
}

export function getMarkup(markupEntity, aim) {
  let imageId = markupEntity["imageReferenceUid"]["root"];
  const frameNumber = markupEntity["referencedFrameNumber"]
    ? markupEntity["referencedFrameNumber"]["value"]
    : 1;
  // if (frameNumber > -1) imageId = imageId + "&frame=" + frameNumber; //if multiframe reconstruct the imageId
  imageId = imageId + "&frame=" + frameNumber;
  const markupUid = markupEntity["uniqueIdentifier"]["root"];
  let calculations = [];
  try {
    calculations = getCalculationEntitiesOfMarkUp(aim, markupUid);
  } catch (error) {
    console.error("Can not get calculations", error);
  }
  const aimUid = aim.ImageAnnotationCollection["uniqueIdentifier"]["root"];
  // could not make this work
  // const color = markupEntity?.lineColor?.value;
  const color = markupEntity.lineColor?markupEntity.lineColor:undefined;

  let retData = {
    imageId,
    data: {
      markupType: markupEntity["xsi:type"],
      calculations,
      coordinates:
        markupEntity.twoDimensionSpatialCoordinateCollection
          .TwoDimensionSpatialCoordinate,
      markupUid,
      aimUid,
    },
  };

  if (color) retData.data["color"] = color;
  return retData;
}

function getSegmentation(segmentationEntity, aim) {
  const imageId = segmentationEntity["referencedSopInstanceUid"]["root"];
  const markupUid = segmentationEntity["uniqueIdentifier"]["root"];
  let calculations = [];
  try {
    calculations = getCalculationEntitiesOfMarkUp(aim, markupUid);
  } catch (error) {
    console.error("Can not get calculations", error);
  }
  const aimUid = aim.ImageAnnotationCollection["uniqueIdentifier"]["root"];
  return {
    imageId,
    data: {
      markupType: segmentationEntity["xsi:type"],
      calculations,
      markupUid,
      aimUid,
    },
  };
}

function getCalculationEntitiesOfMarkUp(aim, markupUid) {
  const imageAnnotationStatements = getImageAnnotationStatements(aim);
  let calculations = [];
  imageAnnotationStatements.forEach((statement) => {
    if (statement.objectUniqueIdentifier.root === markupUid) {
      const calculationUid = statement.subjectUniqueIdentifier.root;
      const calculationEntities = getCalculationEntities(aim);
      calculationEntities.forEach((calculation) => {
        if (calculation.uniqueIdentifier.root === calculationUid)
          calculations.push(parseCalculation(calculation));
      });
    }
  });
  return calculations;
}

function getImageAnnotationStatements(aim) {
  return aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
    .imageAnnotationStatementCollection.ImageAnnotationStatement;
}

function getCalculationEntities(aim) {
  return aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
    .calculationEntityCollection.CalculationEntity;
}

function parseCalculation(calculation) {
  var obj = {};
  const calcResult =
    calculation.calculationResultCollection.CalculationResult[0];
  if (
    calculation.calculationResultCollection.CalculationResult[0]
      .calculationDataCollection
  ) {
    const calcValue =
      calculation.calculationResultCollection.CalculationResult[0]
        .calculationDataCollection.CalculationData[0];
    obj["value"] = calcValue["value"]["value"];
  } else obj["value"] = calcResult["value"]["value"];
  obj["type"] = calculation["description"]["value"];
  obj["unit"] = calcResult["unitOfMeasure"]["value"];
  return obj;
}

export function getAimImageData(image) {
  var obj = {};
  obj.aim = {};
  obj.study = {};
  obj.series = {};
  obj.equipment = {};
  obj.person = {};
  obj.image = [];
  const { aim, study, series, equipment, person } = obj;

  aim.studyInstanceUid = image.data.string("x0020000d") || "";

  study.startTime = image.data.string("x00080030") || "";
  study.instanceUid = image.data.string("x0020000d") || "";
  study.startDate = image.data.string("x00080020") || "";
  study.accessionNumber = image.data.string("x00080050") || "";

  series.instanceUid = image.data.string("x0020000e") || "";
  series.modality = image.data.string("x00080060") || "";
  series.number = image.data.string("x00200011") || "";
  series.description = image.data.string("x0008103e") || "";
  series.instanceNumber = image.data.string("x00200013") || "";

  obj.image.push(getSingleImageData(image));

  equipment.manufacturerName = image.data.string("x00080070") || "";
  equipment.manufacturerModelName = image.data.string("x00081090") || "";
  equipment.softwareVersion = image.data.string("x00181020") || "";

  person.sex = image.data.string("x00100040") || "";
  person.name = image.data.string("x00100010") || "";
  person.patientId = image.data.string("x00100020") || "";
  person.birthDate = image.data.string("x00100030") || "";

  return obj;
}

function getSingleImageData(image) {
  return {
    sopClassUid: image.data.string("x00080016") || "",
    sopInstanceUid: image.data.string("x00080018") || "",
  };
}

function addSingleImageDataToAim(aim, image) {
  if (!aim.image) return;
  aim.image.push(getSingleImageData(image));
}

// ---------- aimapi additional methods --------
// new method inspired by createAimSegmentation in aimEditor.jsx
export function createOfflineAimSegmentation(segmentation, userInfo) {
  // prapare the seed data and create aim
  const seedData = getAimImageDataFromSeg(segmentation); //aimhelper
  // admin/ upload user
  addUserToSeedData(seedData, userInfo);
  const aim = new Aim(seedData, enumAimType.imageAnnotation); // no this.updatedAimId.
  // let dataset = await getDatasetFromBlob(segmentation);
  // if update segmentation Uid should be same as the previous one
  // console.log('Dataset series uid', segmentation);
  // fill the segmentation related aim parts
  const segEntityData = getSegmentationEntityDataFromSeg(segmentation);
  // TODO fill in stats
  addSegmentationToAim(aim, segEntityData, {});
  // console.log('AIM in segmentation', aim);
  // remove extra entities
  delete aim.imageAnnotations.ImageAnnotation[0].calculationEntityCollection;
  delete aim.imageAnnotations.ImageAnnotation[0].markupEntityCollection;
  delete aim.imageAnnotations.ImageAnnotation[0]
    .imageAnnotationStatementCollection;

  // add name, comment and segmentation
  aim.imageAnnotations.ImageAnnotation[0].name = {
    value: segmentation.SeriesDescription,
  };
  // TODO there is no way to fill programmed comment without opening the source image
  aim.imageAnnotations.ImageAnnotation[0].comment = { value: "" };
  aim.imageAnnotations.ImageAnnotation[0].typeCode = [
    {
      code: "SEG",
      codeSystemName: "99EPAD",
      "iso:displayName": {
        "xmlns:iso": "uri:iso.org:21090",
        value: "SEG Only",
      },
    },
  ];

  return { aim };
}
// moved from aimEditor.jsx
function addUserToSeedData(seedData, userInfo) {
  // this is ui specific, should be changed
  if (userInfo) {
    seedData.user = userInfo;
  } else {
    let obj = {};
    obj.loginName = sessionStorage.getItem("username");
    obj.name = sessionStorage.getItem("displayName");
    seedData.user = obj;
  }
}
// moved from aimEditor.jsx
function getDatasetFromBlob(segBlob, imageIdx) {
  return new Promise((resolve) => {
    let segArrayBuffer;
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      segArrayBuffer = event.target.result;
      const dicomData = dcmjs.data.DicomMessage.readFile(segArrayBuffer);
      const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        dicomData.dict
      );
      dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(
        dicomData.meta
      );
      resolve(dataset);
    };
    fileReader.readAsArrayBuffer(segBlob);
  });
}
// moved from aimEditor.jsx
function addSegmentationToAim(aim, segEntityData, segStats) {
  const segId = aim.createSegmentationEntity(segEntityData);
  const { volume, min, max, mean, stdDev } = segStats;
  if (mean) {
    const meanId = aim.createMeanCalcEntity({ mean, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(2, segId, meanId);
  }
  if (stdDev) {
    const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(2, segId, stdDevId);
  }
  if (min) {
    const minId = aim.createMinCalcEntity({ min, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(2, segId, minId);
  }
  if (max) {
    const maxId = aim.createMaxCalcEntity({ max, unit: "[hnsf'U]" });
    aim.createImageAnnotationStatement(2, segId, maxId);
  }
  if (volume) {
    const volumeId = aim.createMaxCalcEntity({ volume, unit: "mm3" });
    aim.createImageAnnotationStatement(2, segId, volumeId);
  }
}
// new method inspired by moved getSegmentationEntityData from aimEditor.jsx
function getSegmentationEntityDataFromSeg(dataset) {
  const refImage = getRefImageFromSeg(dataset);
  let obj = {};
  obj["referencedSopInstanceUid"] = refImage.ReferencedSOPInstanceUID;
  obj["seriesInstanceUid"] = dataset.SeriesInstanceUID;
  obj["studyInstanceUid"] = dataset.StudyInstanceUID;
  obj["sopClassUid"] = dataset.SOPClassUID;
  obj["sopInstanceUid"] = dataset.SOPInstanceUID;
  return obj;
}
// new method to populate image data from segmentation dicom image
function getAimImageDataFromSeg(image) {
  var obj = {};
  obj.aim = {};
  obj.study = {};
  obj.series = {};
  obj.equipment = {};
  obj.person = {};
  obj.image = [];
  const { aim, study, series, equipment, person } = obj;
  // seg data is coming in dcmjs format
  aim.studyInstanceUid = image.StudyInstanceUID || "";
  aim.comment = { value: "" };
  study.startTime = image.StudyTime || "";
  study.instanceUid = image.StudyInstanceUID || "";
  study.startDate = image.StudyDate || "";
  study.accessionNumber = image.AccessionNumber || "";
  series.instanceUid = image.ReferencedSeriesSequence.SeriesInstanceUID || "";
  obj.image.push(getSingleImageDataFromSeg(image));
  equipment.manufacturerName = image.Manufacturer || "";
  equipment.manufacturerModelName = image.ManufacturerModelName || "";
  equipment.softwareVersion = image.SoftwareVersions || "";
  person.sex = image.PatientSex || "";
  person.name = image.PatientName || "";
  person.patientId = image.PatientID || "";
  person.birthDate = image.PatientBirthDate || "";
  return obj;
}
function getRefImageFromSeg(dataset) {
  // I needed to check if the sequence is array in each step as dcmjs makes it an object if there is only one item
  let refImage = "";
  const firstFrame = Array.isArray(dataset.PerFrameFunctionalGroupsSequence)
    ? dataset.PerFrameFunctionalGroupsSequence[0]
    : dataset.PerFrameFunctionalGroupsSequence;
  if (firstFrame.DerivationImageSequence) {
    const derivation = Array.isArray(firstFrame.DerivationImageSequence)
      ? firstFrame.DerivationImageSequence[0]
      : firstFrame.DerivationImageSequence;
    refImage = Array.isArray(derivation.SourceImageSequence)
      ? derivation.SourceImageSequence[0]
      : derivation.SourceImageSequence;
  } else if (dataset.ReferencedSeriesSequence) {
    const refSeries = Array.isArray(dataset.ReferencedSeriesSequence)
      ? dataset.ReferencedSeriesSequence[0]
      : dataset.ReferencedSeriesSequence;
    refImage = Array.isArray(refSeries.ReferencedInstanceSequence)
      ? refSeries.ReferencedInstanceSequence[0]
      : refSeries.ReferencedInstanceSequence;
  }
  return refImage;
}

// new method inspired by getSingleImageData to get data from segmentations
function getSingleImageDataFromSeg(image) {
  const refImage = getRefImageFromSeg(image);
  return {
    sopClassUid: refImage.ReferencedSOPClassUID || "",
    sopInstanceUid: refImage.ReferencedSOPInstanceUID || "",
  };
}


export function createLineTool(markup, color) {
  const data = JSON.parse(JSON.stringify(line));
  data.color = markup.color ? markup.color : color;
  data.aimId = markup.aimUid;
  data.invalidated = true;
  createLinePoints(data, markup.coordinates, markup.calculations);
  console.error('data', data);
  return data;
};
// TODO calculations are not taken from aim?
function createLinePoints(data, points, calculations) {
  data.handles.start.x = points[0].x.value;
  data.handles.start.y = points[0].y.value;
  data.handles.end.x = points[1].x.value;
  data.handles.end.y = points[1].y.value;
  data.length = 0;
  if (calculations) {
    for (let i=0; i< calculations.length; i += 1) {
      console.error('calc', calculations[i].type, calculations[i].value);
      if (calculations[i].type === 'Length') {
        data.length = parseFloat(calculations[i].value) * 100;
        break;
      }
    }
  }
};

// TODO markuptype and coordinates
export function createTool (markup, color, seriesUid, studyUid) {
  const type = markup.markupType || markup['xsi:type'];
  switch (type) {
    // case "TwoDimensionPolyline":
    //   this.createPolygonTool(markup, color, seriesUid, studyUid);
    //   break;
    case "TwoDimensionMultiPoint":
      return {type:'Length', data:createLineTool(markup, color, seriesUid, studyUid)};
    // case "TwoDimensionCircle":
    //   this.createCircleTool(markup, color, seriesUid, studyUid);
    //   break;
    // case "TwoDimensionPoint":
    //   this.createPointTool(markup, color, seriesUid, studyUid);
    //   break;
    // case "Bidirectional":
    //   this.createBidirectionalTool(imageId, markup, color, seriesUid, studyUid);
    //   break;
    // default:
    //   return;
  }
};