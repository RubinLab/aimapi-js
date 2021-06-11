import Aim from "./Aim.jsx";

const IMAGE_LIBRARY = "111028";
const PERSON_OBSERVER = "121008";
const QUALITATIVE_EVALUATIONS = "C0034375";
// moved from aimEditor.jsx
export const enumAimType = {
  imageAnnotation: 1,
  seriesAnnotation: 2,
  studyAnnotation: 3,
};

function replaceInJson(obj, find, replace) {
  var re = new RegExp(find,"g");
  return JSON.parse(JSON.stringify(obj).replace(re, replace));
}
function replaceCD(orjCD) {
  if (replaceCDMap[orjCD.code]) {
    return replaceCDMap[orjCD.code];
  }
  return orjCD;
}
const replaceCDMap = {
  "RID58": {
    "code": "10200004",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "liver","xmlns:iso":"uri:iso.org:21090"}
  },
  "RID34539": {
    "code": "60046008",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "pleural effusion","xmlns:iso":"uri:iso.org:21090"}
  },
  "RID29380": {
    "code": "55603005",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "adipose tissue","xmlns:iso":"uri:iso.org:21090"}
  },
  "RID35751": {
    "code": "280541000",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "orbital cavity","xmlns:iso":"uri:iso.org:21090"}
  },
  "RID28472": {
    "code": "52101004",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "Present","xmlns:iso":"uri:iso.org:21090"}
  },
  "RID39162": {
    "code": "255314001",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "Progressive","xmlns:iso":"uri:iso.org:21090"}
  },
  "S73": {
    "code": "7147002",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "New","xmlns:iso":"uri:iso.org:21090"}
  },
  "S74": {
    "code": "723506003",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "Resolved","xmlns:iso":"uri:iso.org:21090"}
  },
  "RID6055": {
    "code": "C113842",
    "codeSystemName": "NCIt",
    "iso:displayName":{"value": "Enhancing Lesion","xmlns:iso":"uri:iso.org:21090"}
  },
  "RID6056": {
    "code": "C81175",
    "codeSystemName": "NCIt",
    "iso:displayName":{"value": "Nonenhancing","xmlns:iso":"uri:iso.org:21090"}
  },
  "G-A185": {
    "code": "103339001",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "Long Axis","xmlns:iso":"uri:iso.org:21090"}
  },
  "G-A186": {
    "code": "103340004",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "Short Axis","xmlns:iso":"uri:iso.org:21090"}
  },
  "G-D7FE": {
    "code": "410668003",
    "codeSystemName": "SCT",
    "iso:displayName":{"value": "Length","xmlns:iso":"uri:iso.org:21090"}
  },

}
const questionTypeCodeMap = {
  "Type": {
    "code":"RDETBD3",
    "codeSystemName":"RADELEMENT",
    "iso:displayName":{"value":"Lesion Type","xmlns:iso":"uri:iso.org:21090"}
  },
  "Lesion Status": {
    "code":"RDE54",
    "codeSystemName":"RADELEMENT",
    "iso:displayName":{"value":"Lesion Status","xmlns:iso":"uri:iso.org:21090"}
  },
  "Lesion Enhancement": {
    "code":"RDETBD4",
    "codeSystemName":"RADELEMENT",
    "iso:displayName":{"value":"Lesion Enhancement","xmlns:iso":"uri:iso.org:21090"}
  },
  "Lesion Quality": {
    "code":"RDETBD1",
    "codeSystemName":"RADELEMENT",
    "iso:displayName":{"value":"Lesion Quality","xmlns:iso":"uri:iso.org:21090"}
  },
  "Timepoint": {
    "code":"RDETBD2",
    "codeSystemName":"RADELEMENT",
    "iso:displayName":{"value":"Timepoint","xmlns:iso":"uri:iso.org:21090"}
  }
}
function replaceTypeCode(typeCodeArray) {
  for (let i = 0; i < typeCodeArray.length; i += 1 ) {
    typeCodeArray[i] = replaceCD(typeCodeArray[i]);
  }
  return typeCodeArray;
}

export function fixAimControlledTerms(aim) {
  try {
    // replace Radlex and Radelement for all aims
    aim = replaceInJson(aim, 'RadLex', 'RADLEX');
    aim = replaceInJson(aim, 'Radelement', 'RADELEMENT');
    const imageAnnotation = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
    // if template is RECIST_v2 fix the controlled terms
    if (imageAnnotation.typeCode[0].code === 'RECIST_v2') {
      // fix typecodes and add question types (need to be modified after the radelements are finalized)
      if (imageAnnotation.imagingPhysicalEntityCollection) {
        let ipes = [];
        if (Array.isArray(imageAnnotation.imagingPhysicalEntityCollection.ImagingPhysicalEntity)) {
          ipes = imageAnnotation.imagingPhysicalEntityCollection.ImagingPhysicalEntity;
        } else {
          ipes.push(imageAnnotation.imagingPhysicalEntityCollection.ImagingPhysicalEntity);
        }
        ipes.forEach((ipe) => {
          ipe.typeCode = replaceTypeCode(ipe.typeCode);
          if (!ipe.questionTypeCode) {
            ipe.questionTypeCode = questionTypeCodeMap[ipe.label.value];
          }
          if (ipe.imagingPhysicalEntityCharacteristicCollection) {
            const ipcs =
              ipe.imagingPhysicalEntityCharacteristicCollection.ImagingPhysicalEntityCharacteristic;
            ipcs.forEach((ipc) => {
              ipc.typeCode = replaceTypeCode(ipc.typeCode);
              if (!ipc.questionTypeCode) {
                ipc.questionTypeCode = [questionTypeCodeMap[ipc.label.value]];
              }
            });
          }
        });
      }
  
      if (imageAnnotation.imagingObservationEntityCollection) {
        const ioes = imageAnnotation.imagingObservationEntityCollection.ImagingObservationEntity;
        ioes.forEach((ioe) => {
          // imagingObservationEntity can have both ImagingObservationCharacteristic and imagingPhysicalEntityCharacteristic
          ioe.typeCode = replaceTypeCode(ioe.typeCode);
          if (!ioe.questionTypeCode) {
            ioe.questionTypeCode = [questionTypeCodeMap[ioe.label.value]];
          }
          if (ioe.imagingObservationCharacteristicCollection) {
            const iocs =
              ioe.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic;
            iocs.forEach((ioc) => {
              ioc.typeCode = replaceTypeCode(ioc.typeCode);
              if (!ioc.questionTypeCode) {
                ioc.questionTypeCode = [questionTypeCodeMap[ioc.label.value]];
              }
            });
          }
          let ipcs = [];
          if (ioe.imagingPhysicalEntityCharacteristicCollection) {
            ipcs =
              ioe.imagingPhysicalEntityCharacteristicCollection.ImagingPhysicalEntityCharacteristic;
            ipcs.forEach((ipc) => {
              ipc.typeCode = replaceTypeCode(ipc.typeCode);
              if (!ipc.questionTypeCode) {
                ipc.questionTypeCode = [questionTypeCodeMap[ipc.label.value]]
              }
            });
          }
        });
      }
    }
    // fix calculations for all aims
    if (imageAnnotation.calculationEntityCollection) {
      const calcs = imageAnnotation.calculationEntityCollection.CalculationEntity;
      calcs.forEach((calc) => {
        calc.typeCode = replaceTypeCode(calc.typeCode);
      });
    }
    return aim;
  } catch (err) {
    console.error(err);
    return null;
  }
}

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
export function addUserToSeedData(seedData, userInfo) {
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
// updated
// TODO SUV??
export function addSegmentationToAim(aim, segEntityData, segStats) {
  const segId = aim.createSegmentationEntity(segEntityData).root;

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
    const volumeId = aim.createVolumeCalcEntity({
      value: volume,
      unit: "mm3",
    });
    aim.createImageAnnotationStatement(2, segId, volumeId);
  }
  return segEntityData.sopInstanceUid;
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

export function getAimImageDataFromSR(srDataset, trackingIdentifier, comment) {
  var obj = {};
  obj.aim = {};
  obj.study = {};
  obj.series = {};
  obj.equipment = {};
  obj.person = {};
  obj.image = [];
  const { aim, study, series, equipment, person } = obj;
  // seg data is coming in dcmjs format
  aim.studyInstanceUid = srDataset.StudyInstanceUID || "";
  aim.seriesInstanceUid = srDataset.SeriesInstanceUID || "";
  // I could get these from the dataset but adapter retrieves it and puts it in the tool anyways
  aim.name = { value: trackingIdentifier };
  // parse comment and fill in the programmed comment parts
  const commentParts = comment.split("\/\/");
  if (commentParts[0]) {
    const programmedCommentParts = commentParts[0].split("\/");
    // don't know what to do otherwise
    if (programmedCommentParts.length === 4) {
      obj.series.modality = programmedCommentParts[0].trim();
      obj.series.description = programmedCommentParts[1].trim();
      obj.series.instanceNumber = programmedCommentParts[2].trim();
      obj.series.number = programmedCommentParts[3].trim();
    }
  }
  aim.comment = { value: commentParts[1] ? commentParts[1].trim() : "" };
  study.instanceUid = srDataset.StudyInstanceUID || "";
  // would these be filled in?
  study.startTime = srDataset.StudyTime || "";
  study.startDate = srDataset.StudyDate || "";
  series.instanceUid = getReferencedSeriesFromSR(srDataset) || "";
  console.log('series uid', series.instanceUid );
  study.accessionNumber = srDataset.AccessionNumber || "";

  obj.image.push(getSingleImageDataFromSR(srDataset));
  equipment.manufacturerName = srDataset.Manufacturer || "";
  equipment.manufacturerModelName = srDataset.ManufacturerModelName || "";
  equipment.softwareVersion = srDataset.SoftwareVersions || "";
  person.sex = srDataset.PatientSex || "";
  person.name = srDataset.PatientName || "";
  person.patientId = srDataset.PatientID || "";
  person.birthDate = srDataset.PatientBirthDate || "";
  return obj;
}

function getSingleImageDataFromSR(image) {
  const refImage = getRefImageFromSR(image);
  return {
    sopClassUid: refImage.ReferencedSOPClassUID || "",
    sopInstanceUid: refImage.ReferencedSOPInstanceUID || "",
  };
}

// from dcmjs helpers
function toArray(x) {
  return Array.isArray(x) ? x : [x];
};

function getRefImageFromSR(dataset) {
  console.log('in', toArray(dataset.ContentSequence));
  if (dataset.ContentSequence) {
    const imageLibrary = toArray(dataset.ContentSequence).find(
      group => group.ConceptNameCodeSequence.CodeValue === IMAGE_LIBRARY
    );
    console.log('ss', imageLibrary);
    if (imageLibrary.ContentSequence && imageLibrary.ContentSequence.ContentSequence && imageLibrary.ContentSequence.ContentSequence.ReferencedSOPSequence)
      return imageLibrary.ContentSequence.ContentSequence.ReferencedSOPSequence;
  }
  return {};
}

export function getUserFromSR(dataset) {
  // TODO loginname
  if (dataset.ContentSequence) {
    const annotator = toArray(dataset.ContentSequence).find(
      group => group.ConceptNameCodeSequence.CodeValue === PERSON_OBSERVER
    );
    return {
      loginName: annotator.PersonName,
      name: annotator.PersonName,
    };
  }
  return {
    loginName: 'NA',
    name: 'NA',
  };
}

export function getReferencedSeriesFromSR(dataset) {
  if (dataset.CurrentRequestedProcedureEvidenceSequence && dataset.CurrentRequestedProcedureEvidenceSequence.ReferencedSeriesSequence) {
    return dataset.CurrentRequestedProcedureEvidenceSequence.ReferencedSeriesSequence.SeriesInstanceUID;
  }
  return '';
}

function addPolygonToAim(aim, polygon, shapeIndex, imageId, frameNum) {
  const { points } = polygon.handles;
  const markupId = aim.addMarkupEntity(
    "TwoDimensionPolyline",
    shapeIndex,
    points,
    imageId,
    frameNum
  );

  // find out the unit about statistics to write to aim
  let unit, mean, stdDev, min, max;
  if (polygon.meanStdDev) {
    ({ mean, stdDev, min, max } = polygon.meanStdDev);
    unit = "hu";
  } else if (polygon.meanStdDevSUV) {
    ({ mean, stdDev, min, max } = polygon.meanStdDev);
    unit = "suv";
  }

  const meanId = aim.createMeanCalcEntity({ mean, unit });
  aim.createImageAnnotationStatement(1, markupId, meanId);

  const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit });
  aim.createImageAnnotationStatement(1, markupId, stdDevId);

  const minId = aim.createMinCalcEntity({ min, unit });
  aim.createImageAnnotationStatement(1, markupId, minId);

  const maxId = aim.createMaxCalcEntity({ max, unit });
  aim.createImageAnnotationStatement(1, markupId, maxId);
}

function addPointToAim(aim, point, shapeIndex, imageId, frameNum) {
  const { end } = point.handles;
  aim.addMarkupEntity(
    "TwoDimensionPoint",
    shapeIndex,
    [end],
    imageId,
    frameNum
  );
}

function addLineToAim(aim, line, shapeIndex, imageId, frameNum) {
  const { start, end } = line.handles;
  const markupId = aim.addMarkupEntity(
    "TwoDimensionMultiPoint",
    shapeIndex,
    [start, end],
    imageId,
    frameNum
  );

  const lengthId = aim.createLengthCalcEntity({
    value: line.length,
    unit: line.unit,
  });
  aim.createImageAnnotationStatement(1, markupId, lengthId);
}

function addCircleToAim(aim, circle, shapeIndex, imageId, frameNum) {
  const { start, end } = circle.handles;
  const markupId = aim.addMarkupEntity(
    "TwoDimensionCircle",
    shapeIndex,
    [start, end],
    imageId,
    frameNum
  );

  let unit;
  if (circle.unit === "HU") unit = "hu";
  else if (circle.unit === "SUV") unit = "suv";

  const { mean, stdDev, min, max } = circle.cachedStats;

  const meanId = aim.createMeanCalcEntity({ mean, unit });
  aim.createImageAnnotationStatement(1, markupId, meanId);

  const stdDevId = aim.createStdDevCalcEntity({ stdDev, unit });
  aim.createImageAnnotationStatement(1, markupId, stdDevId);

  const minId = aim.createMinCalcEntity({ min, unit });
  aim.createImageAnnotationStatement(1, markupId, minId);

  const maxId = aim.createMaxCalcEntity({ max, unit });
  aim.createImageAnnotationStatement(1, markupId, maxId);

  // aim.add;
}

function addBidirectionalToAim(
  aim,
  bidirectional,
  shapeIndex,
  imageId,
  frameNum,
  getAxisOfBidirectional
) {
  if (!bidirectional.longestDiameter || !bidirectional.shortestDiameter) {
    const { longAxis, shortAxis } = getAxisOfBidirectional(bidirectional);

    // add longAxis
    const longAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex,
      [longAxis.start, longAxis.end],
      imageId,
      frameNum
    );
    console.error('idd', longAxisMarkupId);
    const longAxisLengthId = aim.createLongAxisCalcEntity({
      value: longAxis.length,
      unit: "mm",
    });
    aim.createImageAnnotationStatement(1, longAxisMarkupId, longAxisLengthId);

    // add shortAxis
    const shortAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex + 1,
      [shortAxis.start, shortAxis.end],
      imageId,
      frameNum
    );
    const shortAxisLengthId = aim.createShortAxisCalcEntity({
      value: shortAxis.length,
      unit: "mm",
    });
    aim.createImageAnnotationStatement(1, shortAxisMarkupId, shortAxisLengthId);
  } else {
    // first shape coming from cornerstone tools is long axis
    const longAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex,
      [bidirectional.handles.start, bidirectional.handles.end],
      imageId,
      frameNum
    );
    console.error('idd', longAxisMarkupId);
    const longAxisLengthId = aim.createLongAxisCalcEntity({
      value: bidirectional.longestDiameter,
      unit: "mm",
    });
    aim.createImageAnnotationStatement(1, longAxisMarkupId, longAxisLengthId);

    // second shape coming from cornerstone tools is long axis
    const shortAxisMarkupId = aim.addMarkupEntity(
      "TwoDimensionMultiPoint",
      shapeIndex + 1,
      [bidirectional.handles.perpendicularStart, bidirectional.handles.perpendicularEnd],
      imageId,
      frameNum
    );
    const shortAxisLengthId = aim.createShortAxisCalcEntity({
      value: bidirectional.shortestDiameter,
      unit: "mm",
    });
    aim.createImageAnnotationStatement(1, shortAxisMarkupId, shortAxisLengthId);
  }
}

export function createAimMarkups(aim, markupsToSave) {
  Object.entries(markupsToSave).forEach(([key, values]) => {
    values.map((value) => {
      const { type, markup, shapeIndex, imageId, frameNum } = value;
      switch (type.toLowerCase()) {
        case "point":
          addPointToAim(aim, markup, shapeIndex, imageId, frameNum);
          break;
        case "line":
          addLineToAim(aim, markup, shapeIndex, imageId, frameNum);
          break;
        case "circle":
          addCircleToAim(aim, markup, shapeIndex, imageId, frameNum);
          break;
        case "polygon":
          addPolygonToAim(aim, markup, shapeIndex, imageId, frameNum);
          break;
        case "bidirectional":
          addBidirectionalToAim(
            aim,
            markup,
            shapeIndex,
            imageId,
            frameNum
          );
      }
    });
  });
}

export function storeMarkupsToBeSaved(imageId, markupData, markupsToSave) {
  if (!markupsToSave[imageId]) markupsToSave[imageId] = [];
  markupsToSave[imageId].push(markupData);
}

export function getQualitativeEvaluationsFromSR(dataset) {
  if (dataset.ContentSequence) {
    const qualitativeEvaluations = toArray(dataset.ContentSequence).find(
      group => group.ConceptNameCodeSequence.CodeValue === QUALITATIVE_EVALUATIONS
    );
    return qualitativeEvaluations.ContentSequence;
  }
  return [];
}