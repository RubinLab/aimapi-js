window = {};
import dcmjs from "dcmjs";
import { getMarkup } from "./aimHelper";
import { createTool, linesToPerpendicular } from "./cornerstoneHelper";
export function aim2dicomsr(aim) {
  try {
    // check if it has image
    // TODO how about study/series aims @Clunie

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

function epadCD2SRCD(typecode) {
  return {
    CodeValue: typecode.code,
    CodingSchemeDesignator: typecode.codeSystemName,
    CodeMeaning: typecode["iso:displayName"].value,
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
  if (!imagingObservations) return [];
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
  return qualitativeEvaluations;
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
      tool.data.identifier = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value; // add type to the end? or shape uid
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
