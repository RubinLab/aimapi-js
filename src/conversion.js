window = {};
import dcmjs from 'dcmjs';
import {getMarkup} from './aimHelper';
import {createTool} from './cornerstoneHelper'
export function aim2dicomsr(aim) {
  try {
    // check if it has image
    // TODO how about study/series aims @Clunie

    const { toolstate, metaDataProvider } = generateMetadataProviderAndToolState(aim);
    const { MeasurementReport } = dcmjs.adapters.Cornerstone;

    const report = MeasurementReport.generateReport(toolstate, metaDataProvider);
    // remove ImageComments throwing warnings in dciodvfy
    delete report.dataset.ImageComments;
    // console.log(report);
    // const reportBlob = dcmjs.data.datasetToBlob(report.dataset);
    const reportBuffer = dcmjs.data.datasetToBuffer(report.dataset);

    return(reportBuffer);
  } catch (err) {
    console.error(err);
    return null;
  }
}

function generateMetadataProviderAndToolState(aim) {
      // get image ref
      const {
        imageStudy,
      } = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity[0];
      const studyInstanceUID = imageStudy.instanceUid.root;
      const seriesInstanceUID = imageStudy.imageSeries.instanceUid.root;
  
      const markupEntities =
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].markupEntityCollection
          .MarkupEntity;
      const toolstate = {};
      // imageId is sopInstanceUID-frameNumber
      const imageIds = markupEntities.map((me) => {
        const { imageId, data } = getMarkup(me, aim);
        // const imageId = `${me.imageReferenceUid.root}-${me.referencedFrameNumber.value}`;
        const tool = createTool(data);
        console.log('tool', tool, 'markup', me);
        if (!toolstate[imageId]) toolstate[imageId] = {};
        if (!toolstate[imageId][tool.type]) toolstate[imageId][tool.type] = { data: [] };
        toolstate[imageId][tool.type].data.push(tool.data);
        return imageId;
      });
  
      return {
        metaDataProvider: {
          get(type, imageId) {
            if (type === 'generalSeriesModule') {
              if (imageIds.includes(imageId)) {
                return {
                  studyInstanceUID,
                  seriesInstanceUID,
                };
              }
            }
            if (type === 'sopCommonModule') {
              if (imageIds.includes(imageId)) {
                return {
                  sopInstanceUID: imageId.split('&frame=')[0],
                  sopClassUID: imageStudy.imageSeries.imageCollection.Image[0].sopClassUid.root, // assume all classuids are the same
                };
              }
            }
            if (type === 'frameNumber') {
              if (imageIds.includes(imageId)) {
                return imageId.split('&frame=')[1] ? imageId.split('&frame=')[1] : 1;
              }
            }
            return null;
          },
        },
        toolstate,
      };
}
