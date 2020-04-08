(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.aimapi = {}));
}(this, (function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var aimConf = {
    aimVersion: "AIMv4_2",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    xmlns: "gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM",
    "xsi:schemaLocation": "gme://caCORE.caCORE/4.4/edu.northwestern.radiology.AIM AIM_v4.2_rv2_XML.xsd"
  };

  var dcmDesignator = "DCM";
  var lexVersion = "20121129"; //from the link below
  //http://dicom.nema.org/medical/dicom/current/output/chtml/part16/sect_CID_29.html
  //http://www.dicomlibrary.com/dicom/sop/
  //Default Values=> codeValue:99EPADM0 codeMaeaning:NA codingSchemeDesignator:99EPAD

  var modalities = {
    "1.2.840.10008.5.1.4.1.1.2": {
      codeValue: "CT",
      codeMeaning: "Computed Tomography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    "1.2.840.10008.5.1.4.1.1.1": {
      codeValue: "CR",
      codeMeaning: "Computed Radiography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    "1.2.840.10008.5.1.4.1.1.128": {
      codeValue: "PT",
      codeMeaning: "Positron emission tomography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    "1.2.840.10008.5.1.4.1.1.4": {
      codeValue: "MR",
      codeMeaning: "Magnetic Resonance",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    "1.2.840.10008.5.1.4.1.1.6.1": {
      codeValue: "US",
      codeMeaning: "Ultrasound",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    "1.2.840.10008.5.1.4.1.1.1.2": {
      codeValue: "MG",
      codeMeaning: "Mammography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    "1.2.840.10008.5.1.4.1.1.1.2.1": {
      codeValue: "MG",
      codeMeaning: "Mammography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    CT: {
      codeValue: "CT",
      codeMeaning: "Computed Tomography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    CR: {
      codeValue: "CR",
      codeMeaning: "Computed Radiography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    PT: {
      codeValue: "PT",
      codeMeaning: "Positron emission tomography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    MR: {
      codeValue: "MR",
      codeMeaning: "Magnetic Resonance",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    US: {
      codeValue: "US",
      codeMeaning: "Ultrasound",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    MG: {
      codeValue: "MG",
      codeMeaning: "Mammography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    }
  };

  /**
   * For creating DICOM uids
   * Taken from dcmjs MetaDictionary
   * https://github.com/dcmjs-org/dcmjs/blob/master/src/DicomMetaDictionary.js#L5
   */
  function generateUid() {
    let uid = "2.25." + Math.floor(1 + Math.random() * 9);

    for (let index = 0; index < 38; index++) {
      uid = uid + Math.floor(Math.random() * 10);
    }

    return uid;
  }

  class Aim {
    constructor(imageData, _aimType, updatedAimId) {
      _defineProperty(this, "getDate", () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = ("0" + (now.getMonth() + 1)).slice(-2);
        const day = ("0" + now.getDate()).slice(-2);
        const hours = ("0" + now.getHours()).slice(-2);
        const minutes = ("0" + now.getMinutes()).slice(-2);
        const seconds = ("0" + now.getSeconds()).slice(-2);
        return year + month + day + hours + minutes + seconds;
      });

      _defineProperty(this, "_createObject", (name, value) => {
        var obj = {};
        obj[name] = {
          value
        };
        return obj;
      });

      _defineProperty(this, "_createDimension", (label, index = 0, size = 1) => {
        return {
          Dimension: [Object.assign({}, this._createObject("size", size), this._createObject("index", index), this._createObject("label", label))]
        };
      });

      _defineProperty(this, "_createDoubleDataType", () => {
        var obj = {
          dataType: {
            code: "C48870",
            codeSystem: "NCI",
            "iso:displayName": {
              "xmlns:iso": "uri:iso.org:21090",
              value: "Double"
            }
          }
        };
        return obj;
      });

      _defineProperty(this, "_createCalcResult", (unit, label, value, preLabel = "") => {
        var obj = this._createObject("unitOfMeasure", unit);

        Object.assign(obj, this._createDoubleDataType());
        obj["xsi:type"] = "CompactCalculationResult";
        obj["dimensionCollection"] = this._createDimension(preLabel + label);
        obj["type"] = "Scalar";
        Object.assign(obj, this._createObject("value", `${value}`));
        return obj;
      });

      _defineProperty(this, "_createTypeCode", (code = "11203", codeSystemName = "DCM", displayNameValue = "Attenuation Coefficient") => {
        var obj = {};
        obj["code"] = code;
        obj["codeSystemName"] = codeSystemName;
        obj["iso:displayName"] = {
          "xmlns:iso": "uri:iso.org:21090",
          value: displayNameValue
        };
        return obj;
      });

      _defineProperty(this, "createLengthCalcEntity", length => {
        let {
          unit,
          value
        } = length;
        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "LineLength", value)]
        };
        obj["description"] = {
          value: "Length"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("G-D7FE", "SRT", "Length")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createLongAxisCalcEntity", longAxis => {
        let {
          unit,
          value
        } = longAxis;
        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "LongAxis", value)]
        };
        obj["description"] = {
          value: "LongAxis"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("G-A185", "SRT", "LongAxis")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createShortAxisCalcEntity", shortAxis => {
        let {
          unit,
          value
        } = shortAxis;
        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "ShortAxis", value)]
        };
        obj["description"] = {
          value: "ShortAxis"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("G-A186", "SRT", "ShortAxis")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createMeanCalcEntity", (value, preLabel) => {
        var {
          unit,
          mean
        } = value;
        console.log("Unit", unit);

        const {
          unitObj,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit);

        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unitObj, "Mean", mean, preLabel)]
        };
        obj["description"] = {
          value: "Mean"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("R-00317", "SRT", "Mean")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection.CalculationEntity.push(obj);
        return uId;
      });

      _defineProperty(this, "createStdDevCalcEntity", (value, preLabel) => {
        var {
          unit,
          stdDev
        } = value;

        const {
          unitObj,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit);

        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unitObj, "Standard Deviation", stdDev, preLabel)]
        };
        obj["description"] = {
          value: "Standard Deviation"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("R-10047", "SRT", "Standard Deviation")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createMinCalcEntity", (value, preLabel) => {
        var {
          unit,
          min
        } = value;

        const {
          unitObj,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit);

        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unitObj, "Minimum", min, preLabel)]
        };
        obj["description"] = {
          value: "Minimum"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("R-404FB", "SRT", "Minimum")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createMaxCalcEntity", (value, preLabel) => {
        var {
          unit,
          max
        } = value;

        const {
          unitObj,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit);

        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unitObj, "Maximum", max, preLabel)]
        };
        obj["description"] = {
          value: "Maximum"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("G-A437", "SRT", "Maximum")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "_getAimUnitAndDcmTypeCode", unit => {
        if (unit === "hu") return {
          unit: "[hnsf'U]",
          typeCodeDcm: this._createTypeCode()
        };else if (unit === "suv") return {
          unit: "{SUVbw}g/ml",
          typeCodeDcm: this._createTypeCode(126401, "DCM", "SUVbw")
        };
      });

      _defineProperty(this, "createVolumeCalcEntity", (value, preLabel) => {
        var {
          unit,
          volume
        } = value;
        var obj = {};
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "Volume", volume, preLabel)]
        };
        obj["description"] = {
          value: "Volume"
        };
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("RID28668", "Radlex", "Volume")];
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createCommonCalcEntites", (mean, stdDev, min, max, preLabel) => {
        var entities = [];
        entities.push(this.createMeanCalcEntity(mean, preLabel));
        entities.push(this.createStdDevCalcEntity(stdDev, preLabel));
        entities.push(this.createMinCalcEntity(min, preLabel));
        entities.push(this.createMaxCalcEntity(max, preLabel));
        return entities;
      });

      _defineProperty(this, "createLongAxisCalcEntities", (longAxis, mean, stdDev, min, max) => {
        var entities = [];
        entities.push(this.createLongAxisCalcEntity(longAxis));
        return entities.concat(this.createCommonCalcEntites(mean, stdDev, min, max, "LongAxis_"));
      });

      _defineProperty(this, "createShortAxisCalcEntities", (shortAxis, mean, stdDev, min, max) => {
        var entities = [];
        entities.push(this.createShortAxisCalcEntity(shortAxis));
        return entities.concat(this.createCommonCalcEntites(mean, stdDev, min, max, "ShortAxis_"));
      });

      _defineProperty(this, "createCalculationEntityCollection", entities => {
        var obj = {};
        obj["calculationEntityCollection"] = {
          CalculationEntity: entities
        };
        return obj;
      });

      _defineProperty(this, "_createCoordinate", (coordinate, index) => {
        var obj = {};
        obj["x"] = {
          value: coordinate.x
        };
        obj["coordinateIndex"] = {
          value: index
        };
        obj["y"] = {
          value: coordinate.y
        };
        return obj;
      });

      _defineProperty(this, "_createCoordinateArray", points => {
        var coordinates = [];
        points.forEach((point, index) => {
          coordinates.push(this._createCoordinate(point, index));
        });
        return coordinates;
      });

      _defineProperty(this, "addMarkupEntity", (type, shapeIndex, points, imageReferenceUid) => {
        const frameNumber = this._getFrameNumber(imageReferenceUid);

        if (frameNumber > -1) imageReferenceUid = imageReferenceUid.split("&frame=")[0]; //if multiframe strip the frame number from imageUID

        var obj = {};
        obj["includeFlag"] = {
          value: true
        };
        obj["twoDimensionSpatialCoordinateCollection"] = {
          TwoDimensionSpatialCoordinate: this._createCoordinateArray(points)
        };
        const uId = generateUid();
        obj["shapeIdentifier"] = {
          value: shapeIndex
        };
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["xsi:type"] = type;
        obj["imageReferenceUid"] = {
          root: imageReferenceUid
        };
        obj["referencedFrameNumber"] = {
          value: frameNumber
        };
        this.imageAnnotations.ImageAnnotation[0].markupEntityCollection.MarkupEntity.push(obj);
        return uId;
      });

      _defineProperty(this, "_getFrameNumber", imageReferenceUid => {
        const frameNumber = imageReferenceUid.split("frame=");
        if (frameNumber.length > 1) return frameNumber[1];
        return 1;
      });

      _defineProperty(this, "_createModality", () => {
        const sopClassUid = this.temp.image[0].sopClassUid;
        if (sopClassUid && modalities[sopClassUid]) var {
          codeValue,
          codingSchemeDesignator,
          codeMeaning,
          codingSchemeVersion
        } = modalities[sopClassUid];else {
          const modality = this.temp.series.modality;

          if (modality && modalities[modality]) {
            var {
              codeValue,
              codingSchemeDesignator,
              codeMeaning,
              codingSchemeVersion
            } = modalities[modality];
          }
        }
        var obj = {};
        obj["code"] = codeValue || "";
        obj["codeSystemName"] = codingSchemeDesignator || "";
        obj["iso:displayName"] = {
          "xmlns:iso": "uri:iso.org:21090",
          value: codeMeaning || ""
        };
        obj["codeSystemVersion"] = codingSchemeVersion || "";
        return obj;
      });

      _defineProperty(this, "_createImageCollection", () => {
        let obj = {};
        obj["Image"] = [];
        this.temp.image.forEach(image => {
          let {
            sopClassUid,
            sopInstanceUid
          } = image;
          sopClassUid = {
            root: sopClassUid
          };
          sopInstanceUid = {
            root: sopInstanceUid
          };
          obj["Image"].push({
            sopClassUid,
            sopInstanceUid
          });
        });
        return obj;
      });

      _defineProperty(this, "_createImageSeries", () => {
        var obj = {};
        obj["modality"] = this._createModality();
        obj["imageCollection"] = this._createImageCollection();
        obj["instanceUid"] = {
          root: this.temp.series.instanceUid
        };
        return obj;
      });

      _defineProperty(this, "_createImageStudy", () => {
        const {
          accessionNumber,
          startTime,
          instanceUid,
          startDate
        } = this.temp.study;
        var obj = {};
        obj["imageSeries"] = this._createImageSeries();
        obj["startTime"] = {
          value: startTime
        };
        obj["instanceUid"] = {
          root: instanceUid
        };
        obj["startDate"] = {
          value: startDate
        };
        obj["accessionNumber"] = {
          value: accessionNumber
        };
        return obj;
      });

      _defineProperty(this, "_createImageReferenceEntity", () => {
        var obj = {};
        obj["imageStudy"] = this._createImageStudy();
        obj["xsi:type"] = "DicomImageReferenceEntity";
        obj["uniqueIdentifier"] = {
          root: generateUid()
        };
        return obj;
      });

      _defineProperty(this, "_createImageReferanceEntityCollection", () => {
        var obj = {};
        obj["ImageReferenceEntity"] = [this._createImageReferenceEntity()];
        return obj;
      });

      _defineProperty(this, "_createImageAnnotations", aimType => {
        const {
          name,
          comment,
          typeCode,
          imagingPhysicalEntityCollection,
          imagingObservationEntityCollection,
          inferenceEntityCollection
        } = this.temp.aim;
        var obj = {};
        obj["uniqueIdentifier"] = {
          root: generateUid()
        };
        obj["typeCode"] = typeCode;
        obj["dateTime"] = {
          value: this.getDate()
        };
        obj["name"] = name;
        obj["comment"] = comment;
        obj["precedentReferencedAnnotationUid"] = {
          root: ""
        };
        if (imagingPhysicalEntityCollection) obj["imagingPhysicalEntityCollection"] = imagingPhysicalEntityCollection;

        if (aimType === 1) {
          //if this is an image annotation
          obj["calculationEntityCollection"] = {
            CalculationEntity: []
          };
          obj["markupEntityCollection"] = {
            MarkupEntity: []
          };
          obj["imageAnnotationStatementCollection"] = {
            ImageAnnotationStatement: []
          };
        }

        if (imagingObservationEntityCollection) obj["imagingObservationEntityCollection"] = imagingObservationEntityCollection;
        if (inferenceEntityCollection) obj["inferenceEntityCollection"] = inferenceEntityCollection;
        obj["imageReferenceEntityCollection"] = this._createImageReferanceEntityCollection();
        return obj;
      });

      _defineProperty(this, "createImageAnnotationStatement", (referenceType, objectId, subjectId) => {
        //this is called externally
        var obj = {};
        var references;
        referenceType === 1 ? references = "CalculationEntityReferencesMarkupEntityStatement" : references = "CalculationEntityReferencesSegmentationEntityStatement";
        obj["xsi:type"] = references;
        obj["objectUniqueIdentifier"] = {
          root: objectId
        };
        obj["subjectUniqueIdentifier"] = {
          root: subjectId
        };
        this.imageAnnotations.ImageAnnotation[0].imageAnnotationStatementCollection.ImageAnnotationStatement.push(obj);
      });

      _defineProperty(this, "createSegmentationEntity", segmentation => {
        var obj = {};
        obj["referencedSopInstanceUid"] = {
          root: segmentation.referencedSopInstanceUid
        };
        obj["segmentNumber"] = {
          value: 1
        };
        obj["seriesInstanceUid"] = {
          root: segmentation.seriesInstanceUid
        };
        obj["studyInstanceUid"] = {
          root: segmentation.studyInstanceUid
        };
        obj["xsi:type"] = "DicomSegmentationEntity";
        obj["sopClassUid"] = {
          root: "1.2.840.10008.5.1.4.1.1.66.4"
        };
        obj["sopInstanceUid"] = {
          root: segmentation.sopInstanceUid
        };
        obj["uniqueIdentifier"] = {
          root: generateUid()
        };
        const imageAnnotation = this.imageAnnotations.ImageAnnotation[0];

        if (!imageAnnotation.segmentationEntityCollection) {
          imageAnnotation.segmentationEntityCollection = {};
          imageAnnotation.segmentationEntityCollection.SegmentationEntity = [];
        }

        imageAnnotation.segmentationEntityCollection.SegmentationEntity.push(obj);
        return obj["uniqueIdentifier"];
      });

      _defineProperty(this, "_createPerson", person => {
        const {
          sex,
          name,
          patientId,
          birthDate
        } = person;
        return {
          sex: {
            value: sex
          },
          name: {
            value: name
          },
          id: {
            value: patientId
          },
          birthDate: {
            value: birthDate
          }
        };
      });

      _defineProperty(this, "_createEquipment", equipment => {
        const {
          manufacturerName,
          manufacturerModelName,
          softwareVersion
        } = equipment;
        return {
          manufacturerName: {
            value: manufacturerName
          },
          manufacturerModelName: {
            value: manufacturerModelName
          },
          softwareVersion: {
            value: softwareVersion
          }
        };
      });

      _defineProperty(this, "_createUser", user => {
        const {
          loginName,
          name
        } = user;
        return {
          loginName: {
            value: loginName
          },
          name: {
            value: name
          }
        };
      });

      _defineProperty(this, "getAim", () => {
        delete this["temp"];
        const stringAim = JSON.stringify(this);
        const wrappedAim = `{"ImageAnnotationCollection": ${stringAim} } `;
        return wrappedAim;
      });

      this.temp = {};
      ({
        aim: this.temp.aim,
        study: this.temp.study,
        series: this.temp.series,
        image: this.temp.image,
        segmentation: this.temp.segmentation,
        equipment: this.temp.equipment,
        user: this.temp.user,
        person: this.temp.person
      } = imageData);
      this.xmlns = aimConf.xmlns;
      this["xmlns:rdf"] = aimConf["xmlns:rdf"];
      this["xmlns:xsi"] = aimConf["xmlns:xsi"];
      this.aimVersion = aimConf.aimVersion;
      this["xsi:schemaLocation"] = aimConf["xsi:schemaLocation"];
      this.uniqueIdentifier = "";
      this.studyInstanceUid = {
        root: this.temp.aim.studyInstanceUid
      };
      this.seriesInstanceUid = {
        root: generateUid()
      };
      this.accessionNumber = {
        value: this.temp.study.accessionNumber
      };
      this.dateTime = {
        value: this.getDate()
      };
      this.user = this._createUser(this.temp.user);
      this.equipment = this._createEquipment(this.temp.equipment);
      this.person = this._createPerson(this.temp.person);
      this.imageAnnotations = {
        ImageAnnotation: [this._createImageAnnotations(_aimType)]
      };
      if (updatedAimId === undefined) this.uniqueIdentifier = {
        root: generateUid()
      };else this.uniqueIdentifier = {
        root: updatedAimId
      };
    }

    static parse(data) {
      return new Aim(data);
    } // static getMarkups(aim) {
    //   let annotations = [];
    //   let annotation = {};
    //   const markupEntities =
    //     aim.imageAnnotations.ImageAnnotation.markupEntityCollection.MarkupEntity;
    //   if (markupEntities.constructor === Array) {
    //     markupEntities.map(markupEntity => {
    //       var imageId = markupEntity["imageReferenceUid"]["root"];
    //       var markupUid = markupEntity["uniqueIdentifier"]["root"];
    //       var calculations = this.getCalculationEntitiesOfMarkUp(aim, markupUid);
    //       annotations.push({
    //         imageId: imageId,
    //         markupType: markupEntity["xsi:type"],
    //         coordinates:
    //           markupEntity.twoDimensionSpatialCoordinateCollection
    //             .TwoDimensionSpatialCoordinate,
    //         calculations: calculations
    //       });
    //       this.getCalculationEntitiesOfMarkUp(aim);
    //     });
    //     return annotations;
    //   } else if (
    //     Object.entries(markupEntities).length !== 0 &&
    //     markupEntities.constructor === Object
    //   ) {
    //     const imageId = markupEntities["imageReferenceUid"]["root"];
    //     const markupUid = markupEntities["uniqueIdentifier"]["root"];
    //     const calculations = this.getCalculationEntitiesOfMarkUp(aim, markupUid);
    //     return {
    //       imageId: imageId,
    //       markupType: markupEntities["xsi:type"],
    //       coordinates:
    //         markupEntities.twoDimensionSpatialCoordinateCollection
    //           .TwoDimensionSpatialCoordinate,
    //       calculations: calculations
    //     };
    //   }
    // }


  }

  const enumAimType = {
    imageAnnotation: 1,
    seriesAnnotation: 2,
    studyAnnotation: 3
  };
  function getImageIdAnnotations(aims) {
    let imageIdSpecificMarkups = {};
    aims.forEach(aim => parseAim(aim, imageIdSpecificMarkups));
    return imageIdSpecificMarkups;
  }

  function parseAim(aim, imageIdSpecificMarkups) {
    var imageAnnotation = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]; //check if the aim has markup

    if (imageAnnotation.markupEntityCollection) {
      var markupEntities = imageAnnotation.markupEntityCollection.MarkupEntity;
      markupEntities.forEach(markupEntity => {
        const {
          imageId,
          data
        } = getMarkup(markupEntity, aim);
        if (!imageIdSpecificMarkups[imageId]) imageIdSpecificMarkups[imageId] = [data];else imageIdSpecificMarkups[imageId].push(data);
      });
    } //check if it has segmentation


    if (imageAnnotation.segmentationEntityCollection) {
      var segmentationEntities = imageAnnotation.segmentationEntityCollection.SegmentationEntity;
      segmentationEntities.forEach(segmentationEntity => {
        const {
          imageId,
          data
        } = getSegmentation(segmentationEntity, aim);
        if (!imageIdSpecificMarkups[imageId]) imageIdSpecificMarkups[imageId] = [data];else imageIdSpecificMarkups[imageId].push(data);
      });
    }
  }

  function getMarkup(markupEntity, aim) {
    let imageId = markupEntity["imageReferenceUid"]["root"];
    const frameNumber = markupEntity["referencedFrameNumber"]["value"]; // if (frameNumber > -1) imageId = imageId + "&frame=" + frameNumber; //if multiframe reconstruct the imageId

    imageId = imageId + "&frame=" + frameNumber;
    const markupUid = markupEntity["uniqueIdentifier"]["root"];
    let calculations = [];

    try {
      calculations = getCalculationEntitiesOfMarkUp(aim, markupUid);
    } catch (error) {
      console.log("Can not get calculations", error);
    }

    const aimUid = aim.ImageAnnotationCollection["uniqueIdentifier"]["root"];
    return {
      imageId,
      data: {
        markupType: markupEntity["xsi:type"],
        calculations,
        coordinates: markupEntity.twoDimensionSpatialCoordinateCollection.TwoDimensionSpatialCoordinate,
        markupUid,
        aimUid
      }
    };
  }

  function getSegmentation(segmentationEntity, aim) {
    const imageId = segmentationEntity["referencedSopInstanceUid"]["root"];
    const markupUid = segmentationEntity["uniqueIdentifier"]["root"];
    const calculations = getCalculationEntitiesOfMarkUp(aim, markupUid);
    const aimUid = aim.ImageAnnotationCollection["uniqueIdentifier"]["root"];
    return {
      imageId,
      data: {
        markupType: segmentationEntity["xsi:type"],
        calculations,
        markupUid,
        aimUid
      }
    };
  }

  function getCalculationEntitiesOfMarkUp(aim, markupUid) {
    const imageAnnotationStatements = getImageAnnotationStatements(aim);
    let calculations = [];
    imageAnnotationStatements.forEach(statement => {
      if (statement.objectUniqueIdentifier.root === markupUid) {
        const calculationUid = statement.subjectUniqueIdentifier.root;
        const calculationEntities = getCalculationEntities(aim);
        calculationEntities.forEach(calculation => {
          if (calculation.uniqueIdentifier.root === calculationUid) calculations.push(parseCalculation(calculation));
        });
      }
    });
    return calculations;
  }

  function getImageAnnotationStatements(aim) {
    return aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageAnnotationStatementCollection.ImageAnnotationStatement;
  }

  function getCalculationEntities(aim) {
    return aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].calculationEntityCollection.CalculationEntity;
  }

  function parseCalculation(calculation) {
    var obj = {};
    const calcResult = calculation.calculationResultCollection.CalculationResult[0];

    if (calculation.calculationResultCollection.CalculationResult[0].calculationDataCollection) {
      const calcValue = calculation.calculationResultCollection.CalculationResult[0].calculationDataCollection.CalculationData[0];
      obj["value"] = calcValue["value"]["value"];
    } else obj["value"] = calcResult["value"]["value"];

    obj["type"] = calculation["description"]["value"];
    obj["unit"] = calcResult["unitOfMeasure"]["value"];
    return obj;
  }

  function getAimImageData(image) {
    var obj = {};
    obj.aim = {};
    obj.study = {};
    obj.series = {};
    obj.equipment = {};
    obj.person = {};
    obj.image = [];
    const {
      aim,
      study,
      series,
      equipment,
      person
    } = obj;
    aim.studyInstanceUid = image.data.string("x0020000d") || "";
    study.startTime = image.data.string("x00080030") || "";
    study.instanceUid = image.data.string("x0020000d") || "";
    study.startDate = image.data.string("x00080020") || "";
    study.accessionNumber = image.data.string("x00080050") || "";
    series.instanceUid = image.data.string("x0020000e") || "";
    series.modality = image.data.string("x00080060") || "";
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
      sopInstanceUid: image.data.string("x00080018") || ""
    };
  }
  // new method inspired by createAimSegmentation in aimEditor.jsx


  function createOfflineAimSegmentation(segmentation, userInfo) {
    // prapare the seed data and create aim
    const seedData = getAimImageDataFromSeg(segmentation); //aimhelper
    // admin/ upload user

    addUserToSeedData(seedData, userInfo);
    const aim = new Aim(seedData, enumAimType.imageAnnotation); // no this.updatedAimId.
    // let dataset = await getDatasetFromBlob(segmentation);
    // if update segmentation Uid should be same as the previous one
    // console.log('Dataset series uid', segmentation);
    // fill the segmentation related aim parts

    const segEntityData = getSegmentationEntityDataFromSeg(segmentation); // TODO fill in stats

    const segStats = {};
    addSegmentationToAim(aim, segEntityData, segStats);
    console.log('AIM in segmentation', aim);
    return {
      aim
    };
  } // moved from aimEditor.jsx

  function addUserToSeedData(seedData, userInfo) {
    // this is ui specific, should be changed
    if (userInfo) {
      seedData.user = userInfo;
    } else {
      let obj = {};
      obj.loginName = sessionStorage.getItem('username');
      obj.name = sessionStorage.getItem('displayName');
      seedData.user = obj;
    }
  } // moved from aimEditor.jsx


  function addSegmentationToAim(aim, segEntityData, segStats) {
    const segId = aim.createSegmentationEntity(segEntityData);
    const {
      volume,
      min,
      max,
      mean,
      stdDev
    } = segStats;

    if (mean) {
      const meanId = aim.createMeanCalcEntity({
        mean,
        unit: "[hnsf'U]"
      });
      aim.createImageAnnotationStatement(2, segId, meanId);
    }

    if (stdDev) {
      const stdDevId = aim.createStdDevCalcEntity({
        stdDev,
        unit: "[hnsf'U]"
      });
      aim.createImageAnnotationStatement(2, segId, stdDevId);
    }

    if (min) {
      const minId = aim.createMinCalcEntity({
        min,
        unit: "[hnsf'U]"
      });
      aim.createImageAnnotationStatement(2, segId, minId);
    }

    if (max) {
      const maxId = aim.createMaxCalcEntity({
        max,
        unit: "[hnsf'U]"
      });
      aim.createImageAnnotationStatement(2, segId, maxId);
    }

    if (volume) {
      const volumeId = aim.createMaxCalcEntity({
        volume,
        unit: 'mm3'
      });
      aim.createImageAnnotationStatement(2, segId, volumeId);
    }
  } // new method inspired by moved getSegmentationEntityData from aimEditor.jsx


  function getSegmentationEntityDataFromSeg(dataset) {
    const refImage = getRefImageFromSeg(dataset);
    let obj = {};
    obj['referencedSopInstanceUid'] = refImage.ReferencedSOPInstanceUID;
    obj['seriesInstanceUid'] = dataset.SeriesInstanceUID;
    obj['studyInstanceUid'] = dataset.StudyInstanceUID;
    obj['sopClassUid'] = dataset.SOPClassUID;
    obj['sopInstanceUid'] = dataset.SOPInstanceUID;
    return obj;
  } // new method to populate image data from segmentation dicom image


  function getAimImageDataFromSeg(image) {
    var obj = {};
    obj.aim = {};
    obj.study = {};
    obj.series = {};
    obj.equipment = {};
    obj.person = {};
    obj.image = [];
    const {
      aim,
      study,
      series,
      equipment,
      person
    } = obj; // seg data is coming in dcmjs format

    aim.studyInstanceUid = image.StudyInstanceUID || '';
    study.startTime = image.StudyTime || '';
    study.instanceUid = image.StudyInstanceUID || '';
    study.startDate = image.StudyDate || '';
    study.accessionNumber = image.AccessionNumber || '';
    series.instanceUid = image.ReferencedSeriesSequence.SeriesInstanceUID || '';
    obj.image.push(getSingleImageDataFromSeg(image));
    equipment.manufacturerName = image.Manufacturer || '';
    equipment.manufacturerModelName = image.ManufacturerModelName || '';
    equipment.softwareVersion = image.SoftwareVersions || '';
    person.sex = image.PatientSex || '';
    person.name = image.PatientName || '';
    person.patientId = image.PatientID || '';
    person.birthDate = image.PatientBirthDate || '';
    return obj;
  }

  function getRefImageFromSeg(dataset) {
    // I needed to check if the sequence is array in each step as dcmjs makes it an object if there is only one item
    const firstFrame = Array.isArray(dataset.PerFrameFunctionalGroupsSequence) ? dataset.PerFrameFunctionalGroupsSequence[0] : dataset.PerFrameFunctionalGroupsSequence;
    const derivation = Array.isArray(firstFrame.DerivationImageSequence) ? firstFrame.DerivationImageSequence[0] : firstFrame.DerivationImageSequence;
    const refImage = Array.isArray(derivation.SourceImageSequence) ? derivation.SourceImageSequence[0] : derivation.SourceImageSequence;
    return refImage;
  } // new method inspired by getSingleImageData to get data from segmentations


  function getSingleImageDataFromSeg(image) {
    const refImage = getRefImageFromSeg(image);
    return {
      sopClassUid: refImage.ReferencedSOPClassUID || '',
      sopInstanceUid: refImage.ReferencedSOPInstanceUID || ''
    };
  }

  exports.createOfflineAimSegmentation = createOfflineAimSegmentation;
  exports.getAimImageData = getAimImageData;
  exports.getImageIdAnnotations = getImageIdAnnotations;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=aimapi.js.map
