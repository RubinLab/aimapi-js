window = {};
import dcmjs from "dcmjs";
import btoa from "btoa-lite";
import Aim from "./Aim.jsx";
import { getMarkup, fixAimControlledTerms, getAimImageDataFromSR, getUserFromSR, addUserToSeedData, enumAimType, createAimMarkups, storeMarkupsToBeSaved, getQualitativeEvaluationsFromSR } from "./aimHelper";
import { createTool, linesToPerpendicular } from "./cornerstoneHelper";
import { generateUid } from "../utils/aid";
import RECIST_v2 from "../templates/RECIST_v2_radelement";
import ROI from "../templates/ROI-Only_Template";
export function aim2dicomsr(aim) {
  try {
    aim = fixAimControlledTerms(aim);
    // check if it has image
    // TODO how about study/series aims @Clunie
    // TODO fill in study date/time??
    const {
      toolstate,
      metaDataProvider,
    } = generateMetadataProviderAndToolState(aim);
    const { MeasurementReport } = dcmjs.adapters.Cornerstone;

    const qualitativeEvaluations = getQualitativeEvaluations(aim);
    const procedureReported = getProcedureReported(aim);
    const options = {
      qualitativeEvaluations,
      PersonName: aim.ImageAnnotationCollection.user.name.value,
      ProcedureReported: procedureReported,
      SeriesInstanceUID: aim.ImageAnnotationCollection.seriesInstanceUid.root,
    };
    // TODO add loginname
    const report = MeasurementReport.generateReport(
      toolstate,
      metaDataProvider,
      options
    );

    // remove ImageComments throwing warnings in dciodvfy
    delete report.dataset.ImageComments;
    // console.log(report);
    // const reportBlob = dcmjs.data.datasetToBlob(report.dataset);
    const reportBuffer = dcmjs.data.datasetToBuffer(report.dataset);

    return reportBuffer;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function getToolClass(measurementGroup, dataset, registeredToolClasses) {
  const shapes = {};
  measurementGroup.ContentSequence.forEach(cs => {
    if (cs.ContentSequence && cs.ContentSequence.RelationshipType && cs.ContentSequence.RelationshipType ==='INFERRED FROM') {
      // it is a shape, use cs.ContentSequence.GraphicData and cs.ContentSequence.GraphicType to define the shape
      // "GraphicData": [
      //   97.90877532958984,
      //   313.48773193359375,
      //   123.95789337158203,
      //   294.62457275390625
      // ],
      // "GraphicType": "POLYLINE"
      if (!shapes[cs.ContentSequence.GraphicType]) shapes[cs.ContentSequence.GraphicType] = {};
      shapes[cs.ContentSequence.GraphicType][btoa(JSON.stringify(cs.ContentSequence.GraphicData))] = cs.ContentSequence.GraphicData;
    }
    if (cs.ValueType && (cs.ValueType ==='SCOORD3D' || cs.ValueType ==='SCOORD')) {
            if (!shapes[cs.GraphicType]) shapes[cs.GraphicType] = {};
      shapes[cs.GraphicType][btoa(JSON.stringify(cs.GraphicData))] = cs.GraphicData;
    }
  });
  let type;
  if (shapes["POLYLINE"]) {
    // TODO check if lines are perpendicular
    if (Object.keys(shapes["POLYLINE"]).length === 2) type ='Bidirectional';
    if (Object.keys(shapes["POLYLINE"]).length === 1) {
      if (Object.values(shapes["POLYLINE"])[0].length > 2)
        type ='Freehand';
      else
        type ='Length';
    }
  }
  if (shapes["POINT"] && Object.keys(shapes["POINT"]).length === 1) type ='Probe';
  // find which class it is by checking the shapes
  return registeredToolClasses.find(tc =>
    tc.toolType === type
  );

}

export function dicomsr2aim(srBuffer) {
  try {
    // load the templates
    // just RECIST_v2 for now
    const templates = {};
    templates['RECIST_v2'] =  RECIST_v2;//JSON.parse(fs.readFileSync('../templates/RECIST_v2_radelement.json'));
    templates['ROI'] =  ROI;

    const dicomDict = dcmjs.data.DicomMessage.readFile(srBuffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict);

    const { MeasurementReport } = dcmjs.adapters.Cornerstone;
    const toolstate = MeasurementReport.generateToolState(dataset, {getToolClass});
    console.error('toolstate', JSON.stringify(toolstate));
    const tools = [...toolstate.Length, ...toolstate.Freehand, ...toolstate.Bidirectional, ...toolstate.EllipticalRoi, ...toolstate.ArrowAnnotate];
    const markupsToSave = {};
    let shapeIndex = 1;
    const findings = {};
    const findingSites = {};
    const names = [];
    const comments = [];
    const uniqueIdentifiers = [];
    tools.map(tool => { 
      storeMarkupsToBeSaved(tool.sopInstanceUid, {type: tool.toolType.toLowerCase(), markup: tool, shapeIndex: shapeIndex++, imageId: tool.sopInstanceUid, frameNum:tool.frameIndex }, markupsToSave);
      if (!names.includes(tool.trackingIdentifier)) names.push(tool.trackingIdentifier);
      if (!uniqueIdentifiers.includes(tool.trackingUniqueIdentifier)) uniqueIdentifiers.push(tool.trackingUniqueIdentifier);
      if (!comments.includes(tool.comment)) comments.push(tool.comment);
      if (!findings[tool.finding.CodeValue]) findings[tool.finding.CodeValue] = tool.finding;
      tool.findingSites.forEach(findingSite => { if (!findingSites[findingSite.CodeValue]) findingSites[findingSite.CodeValue] = findingSite; }); 
      // two shapes for bidirectional
      if (tool.toolType.toLowerCase() === 'bidirectional') shapeIndex++; 
    });
    
    // add qualitative evaluations
    // get template first (finding), there is no way to differentiate between characteristics and observations otherwise
    if (Object.keys(findings).length === 1) { // this should be the case
      if (names.length === 1 && uniqueIdentifiers.length === 1 && comments.length <= 1) {
        // get the seed from the first tool
        const tool = Object.values(tools)[0];
        // create base aim
        const seedData = getAimImageDataFromSR(dataset, tool.trackingIdentifier, tool.comment); 
        seedData.aim.typeCode = SRCD2epadCD(Object.values(findings)[0]);
        addUserToSeedData(seedData, getUserFromSR(dataset));
        // ?? should we get aim uid? should it be the uid of the dicom sr?
        const aim = new Aim(seedData, enumAimType.imageAnnotation, undefined, tool.trackingUniqueIdentifier);
        // add shapes, calculations and annotation statements
        createAimMarkups(aim, markupsToSave);
        console.log('generated aim', JSON.stringify(aim.getAimJSON()));
        // default template is ROI
        const template = templates[Object.keys(findings)[0]] || templates['ROI'];
        const aimJSON = addQualitativeEvaluations(aim.getAimJSON(), template, findingSites, dataset);
        console.log('edited aim', JSON.stringify(aimJSON));
        return aimJSON;
      } else {
        console.error('DICOM SR with multiple annotations are not supported!', names, uniqueIdentifiers, comments);
      }

    } else {
      console.error('DICOM SR with multiple findings is not supported!', findings);
      
    }
    // physical entity (finding site)
    // should we return an array??  
    return aim.getAimJSON();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function createEntityCharacteristic(typeCode, label) {
  if (label === 'Timepoint') {
    // this is quantification!!!
    // quite manual/static right now. can we make it more generic
    return {
      "typeCode": [
        {
            "code": "S90",
            "codeSystemName": "99EPAD",
            "codeSystemVersion": "1.0",
            "iso:displayName": {
                "value": "FU Number (0=Baseline)",
                "xmlns:iso": "uri:iso.org:21090"
            }
        }
      ],
      "annotatorConfidence": {
          "value": 0
      },
      label: { value: label },
      "characteristicQuantificationCollection": {
        "CharacteristicQuantification": [
            {
                "type": "Nominal",
                "xsi:type": "Scale",
                "annotatorConfidence": {
                    "value": 0
                },
                "label": {
                    "value": "Timepoint"
                },
                "valueLabel": {
                    "value": typeCode === '0' ? "Baseline" : "Followup" 
                },
                "value": {
                    "value": typeCode
                }
            }
        ]
      }
    }
  }
  return {
    typeCode: [ SRCD2epadCD(typeCode) ],
    "annotatorConfidence": {
        "value": 0
    },
    label: { value: label },
  }
}

function createEntity(typeCode, label) {
  return {
    typeCode: [ SRCD2epadCD(typeCode) ],
    "annotatorConfidence": {
        "value": 0
    },
    label: { value: label },
    "uniqueIdentifier": {
      "root": generateUid()
    },
  }
}

function createQualitativeEvaluationsMap(srQualitativeEvaluations) {
  const map = {};
  srQualitativeEvaluations.forEach(qualEval => {
    switch (qualEval.ValueType) {
      case "CODE":
        map[qualEval.ConceptNameCodeSequence.CodeMeaning] = qualEval.ConceptCodeSequence;
        break;
      case "TEXT":
        map[qualEval.ConceptNameCodeSequence.CodeMeaning] = qualEval.TextValue;
        break;
      default:
        console.error(`ValueType other than CODE and TEXT is not supported. Found ${qualEval.ValueType}`);
    }
  })
  return map;
}

function getSRLabel(obj) {
  if (obj.QuestionType)
    return obj.QuestionType.codeMeaning;
  return obj.label;
}

function addQualitativeEvaluations(aim, template, findingSites, srDataset) {
  // get qualitative evaluations from the dataset and create a map
  const srQualitativeEvaluations = getQualitativeEvaluationsFromSR(srDataset);
  if (srQualitativeEvaluations) {
    const qualitativeEvaluations = createQualitativeEvaluationsMap(srQualitativeEvaluations);
    template.TemplateContainer.Template[0].Component.forEach(component => {
      if (component.AnatomicEntity) { // finding site
        if (!aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingPhysicalEntityCollection)
          aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingPhysicalEntityCollection = { ImagingPhysicalEntity : [] };
        if (Object.keys(findingSites).length !== 1) {
          console.warning('Multiple finding sites are not supported. Getting only the first one');
        }
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingPhysicalEntityCollection.ImagingPhysicalEntity.push(createEntity(Object.values(findingSites)[0], component.label));
        // TODO imagingPhysicalEntityCharacteristicCollection
      } else if (component.ImagingObservation) {
        if (!aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingObservationEntityCollection)
          aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingObservationEntityCollection = { ImagingObservationEntity : [] };    
        const io = createEntity(qualitativeEvaluations[getSRLabel(component)], component.label);
        // TODO imagingPhysicalEntityCharacteristicCollection
        if (component.ImagingObservation.ImagingObservationCharacteristic) {
          component.ImagingObservation.ImagingObservationCharacteristic.forEach(characteristic => {
            if (!io.imagingObservationCharacteristicCollection)
              io.imagingObservationCharacteristicCollection = { ImagingObservationCharacteristic : [] };    
            io.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic.push(createEntityCharacteristic(qualitativeEvaluations[getSRLabel(characteristic)], characteristic.label));
          });
        }
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingObservationEntityCollection.ImagingObservationEntity.push(io);
      }
    });
  }
  return aim;
}

function epadCD2SRCD(typecode) {
  return {
    CodeValue: typecode.code,
    CodingSchemeDesignator: typecode.codeSystemName,
    CodeMeaning: typecode["iso:displayName"].value,
    CodingSchemeVersion: typecode.codeSystemVersion || undefined
  };
}

function SRCD2epadCD(typecode) {
  return {
    code: typecode.CodeValue,
    codeSystemName: typecode.CodingSchemeDesignator,
    "iso:displayName": { value: typecode.CodeMeaning, "xmlns:iso": "uri:iso.org:21090"},
    codeSystemVersion: typecode.CodingSchemeVersion || undefined
  };
}

function cqToSRMeasuredValueSequence(value, units) {
  return {
    MeasurementUnitsCodeSequence: units || {
      CodeValue: "linear",
      CodingSchemeDesignator: "UCUM",
      CodeMeaning: "linear"
  },
  NumericValue: value
  };
}
// obj can be observation entity or observation entity characteristic
// TODO what about physical entity characteristic
function createQualitativeEvaluationWQuestionTypeCode(obj, upperQuestion) {
  // we need typecode and either question type or upper question (observation for characteristic)
  if (obj.typeCode && (obj.questionTypeCode || upperQuestion)) {
    // if the obj does not have question type use the imaging observation
    const conceptName = epadCD2SRCD(obj.questionTypeCode ? obj.questionTypeCode[0]: upperQuestion[0]);
    if (obj.characteristicQuantificationCollection && obj.characteristicQuantificationCollection.CharacteristicQuantification[0]) {
      // TODO other characteristic quantifications
      // TODO getting the first cq only, do we need to support the array?
      switch (obj.characteristicQuantificationCollection.CharacteristicQuantification[0]['xsi:type']) {
        case 'Scale':
          const value = obj.characteristicQuantificationCollection.CharacteristicQuantification[0].value.value;
          return {
            RelationshipType: "CONTAINS",
            ValueType: "TEXT",
            ConceptNameCodeSequence: conceptName,
            TextValue: value,
          };
      }
    } else {
      const concept = epadCD2SRCD(obj.typeCode[0]);
      return {
        RelationshipType: "CONTAINS",
        ValueType: "CODE",
        ConceptNameCodeSequence: conceptName,
        ConceptCodeSequence: concept,
      };
    }
  } 
  return null;
}

// TODO handle observation characteristic under physical entity
function getQualitativeEvaluations(aim) {
  const imagingObservations =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      .imagingObservationEntityCollection;
  if (!imagingObservations) return undefined;
  const qualitativeEvaluations = [];
  imagingObservations.ImagingObservationEntity.forEach((io) => {
    // we have the question type, make question type question, typecode as answer
    // assuming if one has it all does
    if (io.questionTypeCode) {
      const qeIO = createQualitativeEvaluationWQuestionTypeCode(io);
      if (qeIO) qualitativeEvaluations.push(qeIO);
      else console.error('Could not generate qualitative evaluation entity for imaging observation', 'label:', io.label.value, 'questionTypeCode:', io.questionTypeCode, 'typeCode:', io.typeCode );
      if (io.imagingObservationCharacteristicCollection) {
        io.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic.forEach(
          (ioc) => {
            // still supporting ioc with no question type
            const qeIOC = createQualitativeEvaluationWQuestionTypeCode(ioc, io.questionTypeCode || io.typeCode);
            if (qeIOC) qualitativeEvaluations.push(qeIOC);
            else console.error('Could not generate qualitative evaluation entity for imaging observation characteristic', 'label:', ioc.label.value, 'questionTypeCode:', ioc.questionTypeCode, 'typeCode:', ioc.typeCode, 'io questionTypeCode:', io.questionTypeCode, 'io typeCode:', io.typeCode );
     
          }
        );
      }
    } else { // fallback for old aims
      const conceptName = epadCD2SRCD(io.typeCode[0]);
      if (io.imagingObservationCharacteristicCollection) {
        io.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic.forEach(
          (ioc) => {
            const concept = epadCD2SRCD(ioc.typeCode[0]);
            qualitativeEvaluations.push({
              RelationshipType: "CONTAINS",
              ValueType: "CODE",
              ConceptNameCodeSequence: conceptName,
              ConceptCodeSequence: concept,
            });
          }
        );
      }
    }
  });
  return qualitativeEvaluations.length > 0 ? qualitativeEvaluations : undefined;
}

function getFindingSites(aim) {
  const imagingPhysicalEntities =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      .imagingPhysicalEntityCollection;
  if (!imagingPhysicalEntities) return [];
  const findingSites = [];
  imagingPhysicalEntities.ImagingPhysicalEntity.forEach((ip) => {
    findingSites.push(epadCD2SRCD(ip.typeCode[0]));
  });
  return findingSites;
}

// using the method David Clunie used for xslt
function getProcedureReported(aim) {
  const imageReferenceEntities =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      .imageReferenceEntityCollection;
  let procedureReported;
  if (imageReferenceEntities && imageReferenceEntities.ImageReferenceEntity[0] && imageReferenceEntities.ImageReferenceEntity[0].imageStudy.imageSeries.modality.codeSystemName === 'DCM')
  {
    switch (imageReferenceEntities.ImageReferenceEntity[0].imageStudy.imageSeries.modality.code) {
      case "CT":
        procedureReported = {
          CodeValue: "25045-6",
          CodingSchemeDesignator: "LN",
          CodeMeaning: "CT unspecified body region",
        }
        break;
      case "MR": 
        procedureReported = {
          CodeValue: "25056-3",
          CodingSchemeDesignator: "LN",
          CodeMeaning: "MRI unspecified body region",
        }
        break;
      case "NM": 
        procedureReported = {
          CodeValue: "49118-3",
          CodingSchemeDesignator: "LN",
          CodeMeaning: "NM unspecified body region",
        }
        break;
      case "PT": 
        procedureReported = {
          CodeValue: "44136-0",
          CodingSchemeDesignator: "LN",
          CodeMeaning: "PET unspecified body region",
        }
        break;
      default:
        console.error(`Unrecognised modality ${imageReferenceEntities.ImageReferenceEntity[0].imageStudy.imageSeries.modality.code} when deriving procedure reported - using default code`)
        procedureReported = {
          CodeValue: "P0-0099A",
          CodingSchemeDesignator: "SRT",
          CodeMeaning: "Imaging procedure",
        }
    }
  }
  return procedureReported;
}

function generateMetadataProviderAndToolState(aim) {
  // get image ref
  const {
    imageStudy,
  } = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity[0];
  const studyInstanceUID = imageStudy.instanceUid.root;
  const seriesInstanceUID = imageStudy.imageSeries.instanceUid.root;

  const patientID = aim.ImageAnnotationCollection.person.id.value;
  const patientName = aim.ImageAnnotationCollection.person.name.value;
  const patientBirthDate = aim.ImageAnnotationCollection.person.birthDate.value;
  const patientSex = aim.ImageAnnotationCollection.person.sex.value;
  const markupEntities =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      .markupEntityCollection.MarkupEntity;
  const toolstate = {};
  // imageId is sopInstanceUID-frameNumber
  const markupMap = {};
  markupEntities.map((me) => {
    // const imageId = `${me.imageReferenceUid.root}-${me.referencedFrameNumber.value}`;
    const { imageId, data } = getMarkup(me, aim);
    if (!markupMap[imageId]) markupMap[imageId] = [];
    markupMap[imageId].push(data);
  });
  const imageIds = [];
  Object.entries(markupMap).forEach(([imageId, markups]) => {
    if (!imageIds.includes(imageId)) imageIds.push(imageId);
    markups = linesToPerpendicular(markups);
    markups.forEach((markup) => {
      const tool = createTool(markup);
      tool.data.trackingIdentifier = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value; // add type to the end? or shape uid
      if (
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
          .trackingUniqueIdentifier
      )
        tool.data.trackingUniqueIdentifier =
          aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].trackingUniqueIdentifier.root;
      // template
      tool.data.finding = epadCD2SRCD(
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
          .typeCode[0]
      );
      // physical entities
      tool.data.findingSites = getFindingSites(aim);
      tool.data.comment = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value.replace('~~',' \/\/ ') || '';
      if (!toolstate[imageId]) toolstate[imageId] = {};
      if (!toolstate[imageId][tool.type])
        toolstate[imageId][tool.type] = { data: [] };
      toolstate[imageId][tool.type].data.push(tool.data);
    });
  });

  return {
    metaDataProvider: {
      get(type, imageId) {
        if (type === "generalSeriesModule") {
          if (imageIds.includes(imageId)) {
            return {
              studyInstanceUID,
              seriesInstanceUID,
            };
          }
        }
        if (type === "sopCommonModule") {
          if (imageIds.includes(imageId)) {
            return {
              sopInstanceUID: imageId.split("&frame=")[0],
              sopClassUID:
                imageStudy.imageSeries.imageCollection.Image[0].sopClassUid
                  .root, // assume all classuids are the same
            };
          }
        }
        if (type === "frameNumber") {
          if (imageIds.includes(imageId)) {
            return imageId.split("&frame=")[1]
              ? imageId.split("&frame=")[1]
              : 1;
          }
        }
        if (type === "patientModule") {
          if (imageIds.includes(imageId)) {
            return {
              patientID,
              patientName,
              patientBirthDate,
              patientSex
            };
          }
        }
        return null;
      },
    },
    toolstate,
  };
}
