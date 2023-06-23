(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.aimapi = {}));
})(this, (function (exports) { 'use strict';

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
    aimVersion: "AIMv4_3",
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
      codeMeaning: "Digital Radiography",
      codingSchemeDesignator: dcmDesignator,
      codingSchemeVersion: lexVersion
    },
    DX: {
      codeValue: "DX",
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
    },
    "PET-CT": {
      codeValue: "RID10341",
      codeMeaning: "PET-CT",
      codingSchemeDesignator: "RADLEX",
      codingSchemeVersion: "4.1"
    },
    "PET-MR": {
      codeValue: "RID10342",
      codeMeaning: "PET-MR",
      codingSchemeDesignator: "RADLEX",
      codingSchemeVersion: "4.1"
    },
    "US-RF": {
      codeValue: "RID49581",
      codeMeaning: "US-RF",
      codingSchemeDesignator: "RADLEX",
      codingSchemeVersion: "4.1"
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
    constructor(data, aimType, updatedAimId, _trackingUId = generateUid()) {
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
          Dimension: [Object.assign({}, this._createObject("index", index), this._createObject("size", size), this._createObject("label", label))]
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
        const {
          unit,
          value
        } = length;
        const obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("G-D7FE", "SRT", "Length")];
        obj["description"] = {
          value: "Length"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "LineLength", value)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createLongAxisCalcEntity", longAxis => {
        const {
          unit,
          value
        } = longAxis;
        const obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("G-A185", "SRT", "LongAxis")];
        obj["description"] = {
          value: "LongAxis"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "LongAxis", value)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createShortAxisCalcEntity", shortAxis => {
        const {
          unit,
          value
        } = shortAxis;
        const obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("G-A186", "SRT", "ShortAxis")];
        obj["description"] = {
          value: "ShortAxis"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "ShortAxis", value)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createAreaCalcEntity", area => {
        const {
          unit,
          value
        } = area;
        const obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("99EPADA4", "99EPAD", "Area")];
        obj["description"] = {
          value: "Area"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "Area", value)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createVolumeCalcEntity", volume => {
        const {
          unit,
          value
        } = volume;
        const obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [this._createTypeCode("RID28668", "Radlex", "Volume")];
        obj["description"] = {
          value: "Volume"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "Volume", value)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createMeanCalcEntity", (value, preLabel) => {
        let typeCodeDcm,
            {
          unit,
          mean
        } = value;
        ({
          unit,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit));
        var obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("R-00317", "SRT", "Mean")];
        obj["description"] = {
          value: "Mean"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "Mean", mean, preLabel)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection.CalculationEntity.push(obj);
        return uId;
      });

      _defineProperty(this, "createStdDevCalcEntity", (value, preLabel) => {
        let typeCodeDcm,
            {
          unit,
          stdDev
        } = value;
        ({
          unit,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit));
        var obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("R-10047", "SRT", "Standard Deviation")];
        obj["description"] = {
          value: "Standard Deviation"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "Standard Deviation", stdDev, preLabel)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createMinCalcEntity", (value, preLabel) => {
        let typeCodeDcm,
            {
          unit,
          min
        } = value;
        ({
          unit,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit));
        var obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("R-404FB", "SRT", "Minimum")];
        obj["description"] = {
          value: "Minimum"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "Minimum", min, preLabel)]
        };
        this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection["CalculationEntity"].push(obj);
        return uId;
      });

      _defineProperty(this, "createMaxCalcEntity", (value, preLabel) => {
        let typeCodeDcm,
            {
          unit,
          max
        } = value;
        ({
          unit,
          typeCodeDcm
        } = this._getAimUnitAndDcmTypeCode(unit));
        var obj = {};
        const uId = generateUid();
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["typeCode"] = [typeCodeDcm, this._createTypeCode("G-A437", "SRT", "Maximum")];
        obj["description"] = {
          value: "Maximum"
        };
        obj["calculationResultCollection"] = {
          CalculationResult: [this._createCalcResult(unit, "Maximum", max, preLabel)]
        };
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
        return {
          unit,
          typeCodeDcm: this._createTypeCode()
        };
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
        obj["coordinateIndex"] = {
          value: index
        };
        obj["x"] = {
          value: coordinate.x
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

      _defineProperty(this, "addMarkupEntity", (type, shapeIndex, points, imageUid, frameNum, lineStyle) => {
        if (!this.imageAnnotations.ImageAnnotation[0]["markupEntityCollection"]) this.imageAnnotations.ImageAnnotation[0]["markupEntityCollection"] = {
          MarkupEntity: []
        };
        var obj = {};
        obj["includeFlag"] = {
          value: true
        };
        obj["twoDimensionSpatialCoordinateCollection"] = {
          TwoDimensionSpatialCoordinate: this._createCoordinateArray(points)
        };
        const uId = generateUid();
        obj["xsi:type"] = type;
        this.imageAnnotations.ImageAnnotation[0].markupEntityCollection.MarkupEntity.push(obj);
        obj["uniqueIdentifier"] = {
          root: uId
        };
        obj["shapeIdentifier"] = {
          value: shapeIndex
        };
        obj["includeFlag"] = {
          value: true
        };
        obj["imageReferenceUid"] = {
          root: imageUid
        };
        obj["referencedFrameNumber"] = {
          value: frameNum
        };

        if (lineStyle) {
          obj["lineStyle"] = {
            value: lineStyle
          };
        }

        obj["twoDimensionSpatialCoordinateCollection"] = {
          TwoDimensionSpatialCoordinate: this._createCoordinateArray(points)
        };
        return uId;
      });

      _defineProperty(this, "_createModality", () => {
        if (this.temp.aimType !== enumAimType.studyAnnotation) {
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
        } else {
          //Study annotation
          const modality = this.temp.study.modality;

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

          if (this.temp.aimType === enumAimType.imageAnnotation) {
            sopClassUid = {
              root: sopClassUid
            };
            sopInstanceUid = {
              root: sopInstanceUid
            };
          } else {
            sopClassUid = {
              root: ""
            };
            sopInstanceUid = {
              root: ""
            };
          }

          obj["Image"].push({
            sopClassUid,
            sopInstanceUid
          });
        });
        return obj;
      });

      _defineProperty(this, "_createImageSeries", () => {
        var obj = {}; // Study Annotation

        if (this.temp.aimType === enumAimType.studyAnnotation) {
          obj["instanceUid"] = {
            root: ""
          };
        } else obj["instanceUid"] = {
          root: this.temp.series.instanceUid
        };

        obj["modality"] = this._createModality();
        obj["imageCollection"] = this._createImageCollection();
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
        obj["instanceUid"] = {
          root: instanceUid
        };
        obj["startDate"] = {
          value: startDate
        };
        obj["startTime"] = {
          value: startTime
        };
        obj["accessionNumber"] = {
          value: accessionNumber
        };
        obj["imageSeries"] = this._createImageSeries();
        return obj;
      });

      _defineProperty(this, "_createImageReferenceEntity", () => {
        var obj = {};
        obj["xsi:type"] = "DicomImageReferenceEntity";
        obj["uniqueIdentifier"] = {
          root: generateUid()
        };
        obj["imageStudy"] = this._createImageStudy();
        return obj;
      });

      _defineProperty(this, "_createImageReferanceEntityCollection", () => {
        var obj = {};
        obj["ImageReferenceEntity"] = [this._createImageReferenceEntity()];
        return obj;
      });

      _defineProperty(this, "_createImageAnnotations", () => {
        const {
          name,
          comment,
          typeCode,
          imagingPhysicalEntityCollection,
          imagingObservationEntityCollection,
          inferenceEntityCollection,
          trackingUId
        } = this.temp.aim;
        var obj = {};
        obj["uniqueIdentifier"] = {
          root: generateUid()
        };
        obj["trackingUniqueIdentifier"] = {
          root: trackingUId
        };
        obj["typeCode"] = typeCode;
        obj["dateTime"] = {
          value: this.getDate()
        };
        obj["name"] = name;
        obj["comment"] = this._getComment(comment);
        obj["precedentReferencedAnnotationUid"] = {
          root: ""
        };
        if (imagingPhysicalEntityCollection) obj["imagingPhysicalEntityCollection"] = imagingPhysicalEntityCollection;

        if (this.temp.aimType === enumAimType.imageAnnotation) {
          //if this is an image annotation
          obj["calculationEntityCollection"] = {
            "CalculationEntity": []
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

      _defineProperty(this, "_getComment", comment => {
        if (comment && comment.value) {
          if (comment.value.length) comment.value = this._getProgrammedComment().concat("~~", comment.value);
        } else comment.value = this._getProgrammedComment();

        return comment;
      });

      _defineProperty(this, "_getProgrammedComment", () => {
        const SEPERATOR = " / ";
        let {
          modality,
          description,
          instanceNumber,
          number
        } = this.temp.series;

        if (this.temp.aimType !== enumAimType.imageAnnotation) {
          instanceNumber = "";
        }

        if (this.temp.aimType === enumAimType.studyAnnotation) {
          modality = "";
        }

        const comment = modality + SEPERATOR + description + SEPERATOR + instanceNumber + SEPERATOR + number;
        return comment;
      });

      _defineProperty(this, "createImageAnnotationStatement", (referenceType, objectId, subjectId) => {
        //this is called externally
        var obj = {};
        var references;
        referenceType === 1 ? references = "CalculationEntityReferencesMarkupEntityStatement" : references = "CalculationEntityReferencesSegmentationEntityStatement";
        obj["xsi:type"] = references;
        obj["subjectUniqueIdentifier"] = {
          root: subjectId
        };
        obj["objectUniqueIdentifier"] = {
          root: objectId
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
          name: {
            value: name
          },
          id: {
            value: patientId
          },
          birthDate: {
            value: birthDate
          },
          sex: {
            value: sex
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
          name,
          loginName
        } = user;
        return {
          name: {
            value: name
          },
          loginName: {
            value: loginName
          }
        };
      });

      _defineProperty(this, "getAim", () => {
        const temp = this["temp"];
        delete this["temp"];
        const stringAim = JSON.stringify(this);
        const wrappedAim = `{"ImageAnnotationCollection": ${stringAim} } `;
        this["temp"] = temp;
        return wrappedAim;
      });

      _defineProperty(this, "getAimJSON", () => {
        return JSON.parse(this.getAim());
      });

      _defineProperty(this, "getType", () => {
        return this.temp.aimType;
      });

      let aimData;
      const {
        image: _image,
        study,
        answers,
        user: _user
      } = data; // new aim creation (data includes image||study data and answers)

      if (_image || study || answers) {
        if (aimType === enumAimType.imageAnnotation) {
          aimData = getAimImageData(_image);
        }

        if (aimType === enumAimType.studyAnnotation) {
          aimData = getStudyAimData(study);
        }

        addSemanticAnswersToAimData(answers, aimData); // addUserToAimData(user, aimData);
      } else {
        //old way of aim creation to support functionalities that depend on aimapi
        aimData = data;
      }

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
      } = aimData);
      this.temp.aimType = aimType;
      this.temp.aim.trackingUId = _trackingUId; // this.xmlns = aimConf.xmlns;
      // this["xmlns:rdf"] = aimConf["xmlns:rdf"];
      // this["xmlns:xsi"] = aimConf["xmlns:xsi"];

      this.aimVersion = aimConf.aimVersion; // this["xsi:schemaLocation"] = aimConf["xsi:schemaLocation"];

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
      this.user = _user; // this.user = this._createUser(this.temp.user);

      this.equipment = this._createEquipment(this.temp.equipment);
      this.person = this._createPerson(this.temp.person);
      this.imageAnnotations = {
        ImageAnnotation: [this._createImageAnnotations()]
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

    try {
      aims.forEach(aim => parseAim(aim, imageIdSpecificMarkups));
    } catch (err) {
      console.error("Preparing ImageIdAnnotations", err);
    }

    return imageIdSpecificMarkups;
  }

  function parseAim(aim, imageIdSpecificMarkups) {
    var imageAnnotation = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];

    if ((!imageAnnotation.markupEntityCollection || imageAnnotation.markupEntityCollection.MarkupEntity.length === 0) && (!imageAnnotation.segmentationEntityCollection || imageAnnotation.segmentationEntityCollection.SegmentationEntity.length === 0)) {
      const series = imageAnnotation.imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy.imageSeries;
      imageIdSpecificMarkups[series.imageCollection.Image[0].sopInstanceUid.root] = [{
        aimUid: aim.ImageAnnotationCollection.uniqueIdentifier.root
      }];
    } //check if the aim has markup


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
    let data = {};
    data["markupType"] = markupEntity["xsi:type"];
    let imageId = markupEntity["imageReferenceUid"]["root"];
    const frameNumber = markupEntity["referencedFrameNumber"] ? markupEntity["referencedFrameNumber"]["value"] : 1; // if (frameNumber > -1) imageId = imageId + "&frame=" + frameNumber; //if multiframe reconstruct the imageId

    imageId = imageId + "&frame=" + frameNumber;
    const markupUid = markupEntity["uniqueIdentifier"]["root"];
    data["markupUid"] = markupUid;
    let calculations = [];

    try {
      calculations = getCalculationEntitiesOfMarkUp(aim, markupUid);
    } catch (error) {
      console.error("Can not get calculations", error);
    }

    if (calculations.length) data["calculations"] = calculations;
    data["coordinates"] = markupEntity.twoDimensionSpatialCoordinateCollection.TwoDimensionSpatialCoordinate;
    const aimUid = aim.ImageAnnotationCollection["uniqueIdentifier"]["root"];
    data["aimUid"] = aimUid;
    const color = markupEntity?.lineColor?.value;
    data["color"] = color;
    if (markupEntity["lineStyle"]) data["lineStyle"] = markupEntity["lineStyle"];
    let retData = {
      imageId,
      data
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
    return aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageAnnotationStatementCollection ? aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageAnnotationStatementCollection.ImageAnnotationStatement : [];
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
    aim.studyInstanceUid = image.data?.string("x0020000d") || image.metadata.x0020000d || "";
    study.startTime = image.data?.string("x00080030") || image.metadata?.x00080030 || "";
    study.instanceUid = image.data?.string("x0020000d") || image.metadata?.x0020000d || "";
    study.startDate = image.data?.string("x00080020") || image.metadata?.x00080020 || "";
    study.accessionNumber = image.data?.string("x00080050") || image.metadata?.x00080050 || "";
    series.instanceUid = image.data?.string("x0020000e") || image.metadata?.x0020000e || "";
    series.modality = image.data?.string("x00080060") || image.metadata?.x00080060 || "";
    series.number = image.data?.string("x00200011") || image.metadata?.x00200011 || "";
    series.description = image.data?.string("x0008103e") || image.metadata?.x0008103e || "";
    series.instanceNumber = image.data?.string("x00200013") || image.metadata?.x00200013 || "";
    obj.image.push(getSingleImageData(image));
    equipment.manufacturerName = image.data?.string("x00080070") || image.metadata?.x00080070 || "";
    equipment.manufacturerModelName = image.data?.string("x00081090") || image.metadata?.x00081090 || "";
    equipment.softwareVersion = image.data?.string("x00181020") || image.metadata?.x00181020 || "";
    person.sex = image.data?.string("x00100040") || image.metadata?.x00100040 || "";
    person.name = image.data?.string("x00100010") || image.metadata?.x00100010 || "";
    person.patientId = image.data?.string("x00100020") || image.metadata?.x00100020 || "";
    person.birthDate = image.data?.string("x00100030") || image.metadata?.x00100030 || "";
    return obj;
  }
  function getStudyAimData(study) {
    var obj = {};
    obj.aim = {};
    obj.study = {};
    obj.series = {};
    obj.equipment = {};
    obj.person = {};
    obj.image = [];
    const {
      aim,
      study: _study,
      series,
      equipment,
      person,
      image
    } = obj;
    const {
      studyUID,
      studyTime,
      studyDate,
      studyAccessionNumber,
      sex,
      patientName,
      patientID,
      birthdate,
      examTypes
    } = study;
    aim.studyInstanceUid = studyUID || "";
    _study.startTime = studyTime || "";
    _study.instanceUid = studyUID || "";
    _study.startDate = studyDate || "";
    _study.accessionNumber = studyAccessionNumber || "";
    _study.modality = getStudyModalityFromExamTypes(examTypes) || "";
    series.instanceUid = "";
    series.modality = "";
    series.number = "";
    series.description = "";
    series.instanceNumber = "";
    image.push({
      sopClassUid: "",
      sopInstanceUid: ""
    });
    equipment.manufacturerName = "";
    equipment.manufacturerModelName = "";
    equipment.softwareVersion = "";
    person.sex = sex || "";
    person.name = patientName || "";
    person.patientId = patientID || "";
    person.birthDate = birthdate || "";
    return obj;
  }
  function addSemanticAnswersToAimData(answers, aimData) {
    const {
      name,
      comment,
      imagingPhysicalEntityCollection,
      imagingObservationEntityCollection,
      inferenceEntity,
      typeCode
    } = answers;
    aimData.aim.name = name;
    if (comment) aimData.aim.comment = comment;
    if (imagingPhysicalEntityCollection) aimData.aim.imagingPhysicalEntityCollection = imagingPhysicalEntityCollection;
    if (imagingObservationEntityCollection) aimData.aim.imagingObservationEntityCollection = imagingObservationEntityCollection;
    if (inferenceEntity) aimData.aim.inferenceEntity = inferenceEntity;
    if (typeCode) aimData.aim.typeCode = typeCode;
  }
  function addUserToAimData({
    name,
    loginName
  }, aimData) {
    aimData.user = {
      name,
      loginName
    };
  }

  function getSingleImageData(image) {
    consolelog(" ====> image in aim api getSingleImageData");
    console.log(image);
    return {
      sopClassUid: image.data?.string("x00080016") || image.metadata?.x00080016 || "",
      sopInstanceUid: image.data?.string("x00080018") || image.metadata?.x00080018 || ""
    };
  }

  const getStudyModalityFromExamTypes = examTypes => {
    console.log("Exam types", examTypes); // remove SEG from examTypes

    var index = examTypes.indexOf("SEG");

    if (index > -1) {
      examTypes.splice(index, 1);
    }

    if (!examTypes.length) {
      console.log("Returning empty");
      return "";
    }

    if (examTypes.length === 1) {
      console.log("Returning ", examTypes[0]);
      return examTypes[0];
    }

    if (examTypes.includes("CT")) {
      if (examTypes.includes("PT")) return "PET-CT";else return "CT";
    }

    if (examTypes.includes("MR")) {
      if (examTypes.includes("PT")) return "PET-MR";else return "MR";
    }

    if (examTypes.includes("US") && examTypes.includes("RF")) return "US-RF";
    console.log("Returning default value");
    return {
      code: "99EPADM0",
      codeSystemName: "99EPAD",
      "iso:displayName": {
        "xmlns:iso": "uri:iso.org:21090",
        value: "NA"
      }
    };
  }; // ---------- aimapi additional methods --------
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

    addSegmentationToAim(aim, segEntityData, {}); // console.log('AIM in segmentation', aim);
    // remove extra entities

    delete aim.imageAnnotations.ImageAnnotation[0].calculationEntityCollection;
    delete aim.imageAnnotations.ImageAnnotation[0].markupEntityCollection;
    delete aim.imageAnnotations.ImageAnnotation[0].imageAnnotationStatementCollection; // get the segment sequence as an array. we are going to use the first one for aim anyway
    // TODO what to do for multi-segment if there is no series description

    if (segmentation.SegmentSequence.constructor.name !== "Array") {
      segmentation.SegmentSequence = [segmentation.SegmentSequence];
    } // add name, comment and segmentation


    aim.imageAnnotations.ImageAnnotation[0].name = {
      value: segmentation.SeriesDescription || segmentation.SegmentSequence[0].SegmentLabel
    }; // TODO there is no way to fill programmed comment without opening the source image

    aim.imageAnnotations.ImageAnnotation[0].comment = {
      value: ""
    };
    aim.imageAnnotations.ImageAnnotation[0].typeCode = [{
      code: "SEG",
      codeSystemName: "99EPAD",
      "iso:displayName": {
        "xmlns:iso": "uri:iso.org:21090",
        value: "SEG Only"
      }
    }];
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
      obj.loginName = sessionStorage.getItem("username");
      obj.name = sessionStorage.getItem("displayName");
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
        unit: "mm3"
      });
      aim.createImageAnnotationStatement(2, segId, volumeId);
    }
  } // new method inspired by moved getSegmentationEntityData from aimEditor.jsx


  function getSegmentationEntityDataFromSeg(dataset) {
    const refImage = getRefImageFromSeg(dataset);
    let obj = {};
    obj["referencedSopInstanceUid"] = refImage.ReferencedSOPInstanceUID;
    obj["seriesInstanceUid"] = dataset.SeriesInstanceUID;
    obj["studyInstanceUid"] = dataset.StudyInstanceUID;
    obj["sopClassUid"] = dataset.SOPClassUID;
    obj["sopInstanceUid"] = dataset.SOPInstanceUID;
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

    aim.studyInstanceUid = image.StudyInstanceUID || "";
    aim.comment = {
      value: ""
    };
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
    const firstFrame = Array.isArray(dataset.PerFrameFunctionalGroupsSequence) ? dataset.PerFrameFunctionalGroupsSequence[0] : dataset.PerFrameFunctionalGroupsSequence;

    if (firstFrame.DerivationImageSequence) {
      const derivation = Array.isArray(firstFrame.DerivationImageSequence) ? firstFrame.DerivationImageSequence[0] : firstFrame.DerivationImageSequence;
      refImage = Array.isArray(derivation.SourceImageSequence) ? derivation.SourceImageSequence[0] : derivation.SourceImageSequence;
    } else if (dataset.ReferencedSeriesSequence) {
      const refSeries = Array.isArray(dataset.ReferencedSeriesSequence) ? dataset.ReferencedSeriesSequence[0] : dataset.ReferencedSeriesSequence;
      refImage = Array.isArray(refSeries.ReferencedInstanceSequence) ? refSeries.ReferencedInstanceSequence[0] : refSeries.ReferencedInstanceSequence;
    }

    return refImage;
  } // new method inspired by getSingleImageData to get data from segmentations


  function getSingleImageDataFromSeg(image) {
    const refImage = getRefImageFromSeg(image);
    return {
      sopClassUid: refImage.ReferencedSOPClassUID || "",
      sopInstanceUid: refImage.ReferencedSOPInstanceUID || ""
    };
  }

  exports.Aim = Aim;
  exports.addSemanticAnswersToAimData = addSemanticAnswersToAimData;
  exports.addUserToAimData = addUserToAimData;
  exports.createOfflineAimSegmentation = createOfflineAimSegmentation;
  exports.enumAimType = enumAimType;
  exports.getAimImageData = getAimImageData;
  exports.getImageIdAnnotations = getImageIdAnnotations;
  exports.getStudyAimData = getStudyAimData;
  exports.getStudyModalityFromExamTypes = getStudyModalityFromExamTypes;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=aimapi.js.map
