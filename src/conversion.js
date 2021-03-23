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
    const report = MeasurementReport.generateReport(
      toolstate,
      metaDataProvider,
      { quantitativeEvaluations }
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

// TODO handle observation characteristic under physical entity
function getQuantitativeEvaluations(aim) {
  const imagingObservations =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      .imagingObservationEntityCollection;
  if (!imagingObservations) return [];
  const quantitativeEvaluations = [];
  imagingObservations.ImagingObservationEntity.forEach((io) => {
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
      // template
      tool.data.finding = epadCD2SRCD(aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0]);
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
