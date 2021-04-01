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

    const quantitativeEvaluations = getQuantitativeEvaluations(aim);
    const options = {
      quantitativeEvaluations,
      PersonName: aim.ImageAnnotationCollection.user.name.value,
      trackingIdentifierTextValue: // finding??
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name
          .value,
    };
    if (
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
        .trackingUniqueIdentifier
    )
      options.trackingUniqueIdentifier =
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].trackingUniqueIdentifier.root;

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
// obj can be observation entity or observation entity characteristic
// TODO what about physical entity characteristic
function createQuantitativeEvaluationWQuestionTypeCode(obj, upperQuestion) {
  // we need typecode and either question type or upper question (observation for characteristic)
  if (obj.typeCode && (obj.questionTypeCode || upperQuestion)) {
    // if the obj does not have question type use the imaging observation
    const conceptName = epadCD2SRCD(obj.questionTypeCode ? obj.questionTypeCode[0]: upperQuestion[0]);
    const concept = epadCD2SRCD(obj.typeCode[0]);
    return {
      RelationshipType: "CONTAINS",
      ValueType: "CODE",
      ConceptNameCodeSequence: conceptName,
      ConceptCodeSequence: concept,
    };
  } 
  return null;
}

// TODO handle observation characteristic under physical entity
function getQuantitativeEvaluations(aim) {
  const imagingObservations =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      .imagingObservationEntityCollection;
  if (!imagingObservations) return [];
  const quantitativeEvaluations = [];
  imagingObservations.ImagingObservationEntity.forEach((io) => {
    // we have the question type, make question type question, typecode as answer
    // assuming if one has it all does
    if (io.questionTypeCode) {
      const qeIO = createQuantitativeEvaluationWQuestionTypeCode(io);
      if (qeIO) quantitativeEvaluations.push(qeIO);
      else console.error('Could not generate quantitative evaluation entity for imaging observation', 'label:', io.label.value, 'questionTypeCode:', io.questionTypeCode, 'typeCode:', io.typeCode );
      if (io.imagingObservationCharacteristicCollection) {
        io.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic.forEach(
          (ioc) => {
            // this is just for nominal
            // TODO how about others
            // TODO it is no coded term need to figure out the correct way to put in sr
            // if I put it in concept I get this
            // Error - Missing attribute Type 1 Required Element=<NumericValue> Module=<NumericMeasurementMacro>
            // const val = (ioc.characteristicQuantificationCollection) ? 
            //   ioc.characteristicQuantificationCollection.CharacteristicQuantification[0].value.value
            //   : 
            //   undefined;
            // still supporting ioc with no question type
            const qeIOC = createQuantitativeEvaluationWQuestionTypeCode(ioc, io.questionTypeCode || io.typeCode);
            if (qeIOC) quantitativeEvaluations.push(qeIOC);
            else console.error('Could not generate quantitative evaluation entity for imaging observation characteristic', 'label:', ioc.label.value, 'questionTypeCode:', ioc.questionTypeCode, 'typeCode:', ioc.typeCode, 'io questionTypeCode:', io.questionTypeCode, 'io typeCode:', io.typeCode );
     
          }
        );
      }
    } else { // fallback for old aims
      const conceptName = epadCD2SRCD(io.typeCode[0]);
      if (io.imagingObservationCharacteristicCollection) {
        io.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic.forEach(
          (ioc) => {
            const concept = epadCD2SRCD(ioc.typeCode[0]);
            quantitativeEvaluations.push({
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
  return quantitativeEvaluations;
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

function generateMetadataProviderAndToolState(aim) {
  // get image ref
  const {
    imageStudy,
  } = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity[0];
  const studyInstanceUID = imageStudy.instanceUid.root;
  const seriesInstanceUID = imageStudy.imageSeries.instanceUid.root;

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
      // template
      tool.data.finding = epadCD2SRCD(
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
          .typeCode[0]
      );
      // physical entities
      tool.data.findingSites = getFindingSites(aim);
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
        return null;
      },
    },
    toolstate,
  };
}
