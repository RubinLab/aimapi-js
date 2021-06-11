export default {
    "TemplateContainer": {
        "uid": "2.25.5886502342623758457547593170234",
        "name": "VK Template",
        "authors": "The AIM team",
        "version": "2.0",
        "creationDate": "2018-02-13",
        "description": "This template is used to collect annotations for RECIST evaluation",
        "xsi:schemaLocation": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate AIMTemplate_v2rv13.xsd",
        "xmlns": "gme://caCORE.caCORE/3.2/edu.northwestern.radiology.AIMTemplate",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "Template": [
            {
                "uid": "2.25.14127115639382804046523562737575775778671",
                "name": "RECIST_v2",
                "authors": "epaduser",
                "version": "2.0",
                "creationDate": "2018-02-13",
                "description": "Template used for RECIST measurements",
                "codeMeaning": "Tumor assessment",
                "codeValue": "RECIST_v2",
                "codingSchemeDesignator": "99EPAD",
                "codingSchemeVersion": "1.0",
                "Component": [
                    {
                        "label": "Location",
                        "itemNumber": 1,
                        "authors": "epaduser",
                        "explanatoryText": "Anatomic Location of lesion",
                        "minCardinality": 1,
                        "maxCardinality": 1,
                        "shouldDisplay": true,
                        "id": "2.25.4369054531089.1305416223173.217635712047",
                        "AnatomicEntity": {
                            "annotatorConfidence": false
                        },"AllowedTerm": [
                            {
                                "codeValue": "10200004",
                                "codeMeaning": "liver",
                                "codingSchemeDesignator": "SCT"
                            },
                            {
                                "codeValue": "RID170",
                                "codeMeaning": "pancreas",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID86",
                                "codeMeaning": "spleen",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1362",
                                "codeMeaning": "pleura",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "60046008",
                                "codeMeaning": "pleural effusion",
                                "codingSchemeDesignator": "SCT"
                            },
                            {
                                "codeValue": "RID1326",
                                "codeMeaning": "left lung",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1302",
                                "codeMeaning": "right lung",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1327",
                                "codeMeaning": "left upper lobe",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1338",
                                "codeMeaning": "left lower lobe",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1303",
                                "codeMeaning": "right upper lobe",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1310",
                                "codeMeaning": "right middle lobe",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1315",
                                "codeMeaning": "right lower lobe",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1310",
                                "codeMeaning": "middle lobe of lung",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1301",
                                "codeMeaning": "lung",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID29663",
                                "codeMeaning": "left kidney",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID29662",
                                "codeMeaning": "right kidney",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID205",
                                "codeMeaning": "kidney",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID6434",
                                "codeMeaning": "brain",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID397",
                                "codeMeaning": "peritoneal cavity",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID431",
                                "codeMeaning": "retroperitoneum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30325",
                                "codeMeaning": "left adrenal gland",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30324",
                                "codeMeaning": "right adrenal gland",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID88",
                                "codeMeaning": "adrenal gland",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID237",
                                "codeMeaning": "bladder",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID13197",
                                "codeMeaning": "bone",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID187",
                                "codeMeaning": "gallbladder",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID94",
                                "codeMeaning": "gastrointestinal tract",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID13296",
                                "codeMeaning": "lymph node",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID29251",
                                "codeMeaning": "omentum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID32830",
                                "codeMeaning": "left ovary",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID32829",
                                "codeMeaning": "right ovary",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID290",
                                "codeMeaning": "ovary",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID2617",
                                "codeMeaning": "pelvic cavity",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID2507",
                                "codeMeaning": "pelvis",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID302",
                                "codeMeaning": "uterus",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID325",
                                "codeMeaning": "vagina",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID343",
                                "codeMeaning": "prostate",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID38594",
                                "codeMeaning": "bone marrow",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID31011",
                                "codeMeaning": "colon",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID95",
                                "codeMeaning": "esophagus",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID28749",
                                "codeMeaning": "breast",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1384",
                                "codeMeaning": "mediastinum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID410",
                                "codeMeaning": "peritoneum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID163",
                                "codeMeaning": "rectum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID34290",
                                "codeMeaning": "skin",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID7578",
                                "codeMeaning": "thyroid gland",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID34854",
                                "codeMeaning": "tonsil",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID132",
                                "codeMeaning": "small intestine",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "S99",
                                "codeMeaning": "undefined organ",
                                "codingSchemeDesignator": "99EPAD"
                            },
                            {
                                "codeValue": "RID7488",
                                "codeMeaning": "neck",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID396",
                                "codeMeaning": "perineum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID32691",
                                "codeMeaning": "anal canal",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID164",
                                "codeMeaning": "anus",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID168",
                                "codeMeaning": "appendix",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID154",
                                "codeMeaning": "cecum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID134",
                                "codeMeaning": "duodenum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID31553",
                                "codeMeaning": "cervical part of esophagus",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30346",
                                "codeMeaning": "left uterine tube",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30345",
                                "codeMeaning": "right uterine tube",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID295",
                                "codeMeaning": "uterine tube",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "55603005",
                                "codeMeaning": "adipose tissue",
                                "codingSchemeDesignator": "SCT"
                            },
                            {
                                "codeValue": "RID1394",
                                "codeMeaning": "aortic valve",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID29225",
                                "codeMeaning": "apex of heart",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1391",
                                "codeMeaning": "left atrial appendage",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1388",
                                "codeMeaning": "right atrial appendage",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1390",
                                "codeMeaning": "left atrium",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1387",
                                "codeMeaning": "right atrium",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1404",
                                "codeMeaning": "interventricular septum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1395",
                                "codeMeaning": "mitral valve",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1396",
                                "codeMeaning": "pulmonic valve",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1397",
                                "codeMeaning": "tricuspid valve",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1392",
                                "codeMeaning": "left ventricle",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1389",
                                "codeMeaning": "right ventricle",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1385",
                                "codeMeaning": "heart",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID33180",
                                "codeMeaning": "mesentery",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID32802",
                                "codeMeaning": "musculature of back",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID39054",
                                "codeMeaning": "muscle of lower limb",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID2624",
                                "codeMeaning": "psoas muscle",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID31610",
                                "codeMeaning": "rectus abdominis",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID39501",
                                "codeMeaning": "muscle of pectoral girdle",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID39061",
                                "codeMeaning": "external anal sphincter",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID165",
                                "codeMeaning": "anal sphincter ",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID2694",
                                "codeMeaning": "skeletal muscle of thigh",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID39497",
                                "codeMeaning": "muscle of thorax",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID39053",
                                "codeMeaning": "muscle of upper limb",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID32753",
                                "codeMeaning": "musculature",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID9554",
                                "codeMeaning": "paranasal sinus",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID9544",
                                "codeMeaning": "nasal vestibule",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID10030",
                                "codeMeaning": "naris",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "280541000",
                                "codeMeaning": "orbital cavity",
                                "codingSchemeDesignator": "SCT"
                            },
                            {
                                "codeValue": "RID30091",
                                "codeMeaning": "major duodenal papilla",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30092",
                                "codeMeaning": "minor duodenal papilla",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID362",
                                "codeMeaning": "penis",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID1407",
                                "codeMeaning": "pericardium",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID32521",
                                "codeMeaning": "rectal ampulla",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID357",
                                "codeMeaning": "seminal vesicle",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID151",
                                "codeMeaning": "terminal ileum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID150",
                                "codeMeaning": "ileum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID148",
                                "codeMeaning": "jejunum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30014",
                                "codeMeaning": "wall of abdomen",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID7361",
                                "codeMeaning": "spinal cord",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID119",
                                "codeMeaning": "antrum of stomach",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID117",
                                "codeMeaning": "body of stomach",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID115",
                                "codeMeaning": "gastric cardia",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID116",
                                "codeMeaning": "gastric fundus",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID124",
                                "codeMeaning": "greater curvature of stomach",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID125",
                                "codeMeaning": "lesser curvature of stomach",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30332",
                                "codeMeaning": "pyloric canal",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID114",
                                "codeMeaning": "stomach",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID38997",
                                "codeMeaning": "left testis",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID38996",
                                "codeMeaning": "right testis",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID366",
                                "codeMeaning": "testis",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID33647",
                                "codeMeaning": "transverse fold of rectum",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30845",
                                "codeMeaning": "left ureter",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID30844",
                                "codeMeaning": "right ureter",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID229",
                                "codeMeaning": "ureter",
                                "codingSchemeDesignator": "RADLEX"
                            },
                            {
                                "codeValue": "RID272",
                                "codeMeaning": "vulva",
                                "codingSchemeDesignator": "RADLEX"
                            }
                        ]
                    },
                    {
                        "label": "Lesion Quality",
                        "itemNumber": 2,
                        "authors": "epaduser",
                        "minCardinality": 1,
                        "maxCardinality": 1,
                        "shouldDisplay": true,
                        "id": "2.25.4369054531658.1305416223742.217635712095",
                        "ImagingObservation": {
                            "annotatorConfidence": false,
                            "ImagingObservationCharacteristic": [
                                {
                                    "label": "Timepoint",
                                    "itemNumber": 1,
                                    "authors": "epaduser",
                                    "explanatoryText": "Timepoint of lesion",
                                    "minCardinality": 1,
                                    "maxCardinality": 1,
                                    "shouldDisplay": true,
                                    "id": "2.25.4369054532228.1305416224313.217635712143",
                                    "annotatorConfidence": false,
                                    "QuestionType": {
                                        "codeValue": "RDETBD2",
                                        "codeMeaning": "Timepoint",
                                        "codingSchemeDesignator": "RADELEMENT"
                                    },
                                    "AllowedTerm": [
                                        {
                                            "codeValue": "S90",
                                            "codeMeaning": "FU Number (0=Baseline)",
                                            "codingSchemeDesignator": "99EPAD",
                                            "codingSchemeVersion": "1.0",
                                            "CharacteristicQuantification": [
                                                {
                                                    "name": "Timepoint",
                                                    "annotatorConfidence": false,
                                                    "characteristicQuantificationIndex": 0,
                                                    "Scale": {
                                                        "scaleType": "Nominal",
                                                        "ScaleLevel": [
                                                            {
                                                                "value": "0",
                                                                "valueLabel": "Baseline",
                                                                "valueDescription": "T0"
                                                            },
                                                            {
                                                                "value": "1",
                                                                "valueLabel": "FU1",
                                                                "valueDescription": "T1"
                                                            },
                                                            {
                                                                "value": "2",
                                                                "valueLabel": "FU2",
                                                                "valueDescription": "T2"
                                                            },
                                                            {
                                                                "value": "3",
                                                                "valueLabel": "FU3",
                                                                "valueDescription": "T3"
                                                            },
                                                            {
                                                                "value": "4",
                                                                "valueLabel": "FU4",
                                                                "valueDescription": "T4"
                                                            },
                                                            {
                                                                "value": "5",
                                                                "valueLabel": "FU5",
                                                                "valueDescription": "T5"
                                                            },
                                                            {
                                                                "value": "6",
                                                                "valueLabel": "FU6",
                                                                "valueDescription": "T6"
                                                            },
                                                            {
                                                                "value": "7",
                                                                "valueLabel": "FU7",
                                                                "valueDescription": "T7"
                                                            },
                                                            {
                                                                "value": "8",
                                                                "valueLabel": "FU8",
                                                                "valueDescription": "T8"
                                                            },
                                                            {
                                                                "value": "9",
                                                                "valueLabel": "FU9",
                                                                "valueDescription": "T9"
                                                            },
                                                            {
                                                                "value": "10",
                                                                "valueLabel": "FU10",
                                                                "valueDescription": "T10"
                                                            },
                                                            {
                                                                "value": "11",
                                                                "valueLabel": "FU11",
                                                                "valueDescription": "T11"
                                                            },
                                                            {
                                                                "value": "12",
                                                                "valueLabel": "FU12",
                                                                "valueDescription": "T12"
                                                            },
                                                            {
                                                                "value": "13",
                                                                "valueLabel": "FU13",
                                                                "valueDescription": "T13"
                                                            },
                                                            {
                                                                "value": "14",
                                                                "valueLabel": "FU14",
                                                                "valueDescription": "T14"
                                                            },
                                                            {
                                                                "value": "15",
                                                                "valueLabel": "FU15",
                                                                "valueDescription": "T15"
                                                            },
                                                            {
                                                                "value": "16",
                                                                "valueLabel": "FU16",
                                                                "valueDescription": "T16"
                                                            },
                                                            {
                                                                "value": "17",
                                                                "valueLabel": "FU17",
                                                                "valueDescription": "T17"
                                                            },
                                                            {
                                                                "value": "18",
                                                                "valueLabel": "FU18",
                                                                "valueDescription": "T18"
                                                            },
                                                            {
                                                                "value": "19",
                                                                "valueLabel": "FU19",
                                                                "valueDescription": "T19"
                                                            },
                                                            {
                                                                "value": "20",
                                                                "valueLabel": "FU20",
                                                                "valueDescription": "T20"
                                                            },
                                                            {
                                                                "value": "21",
                                                                "valueLabel": "FU21",
                                                                "valueDescription": "T21"
                                                            },
                                                            {
                                                                "value": "22",
                                                                "valueLabel": "FU22",
                                                                "valueDescription": "T22"
                                                            },
                                                            {
                                                                "value": "23",
                                                                "valueLabel": "FU23",
                                                                "valueDescription": "T23"
                                                            },
                                                            {
                                                                "value": "24",
                                                                "valueLabel": "FU24",
                                                                "valueDescription": "T24"
                                                            },
                                                            {
                                                                "value": "25",
                                                                "valueLabel": "FU25",
                                                                "valueDescription": "T25"
                                                            },
                                                            {
                                                                "value": "26",
                                                                "valueLabel": "FU26",
                                                                "valueDescription": "T26"
                                                            },
                                                            {
                                                                "value": "27",
                                                                "valueLabel": "FU27",
                                                                "valueDescription": "T27"
                                                            },
                                                            {
                                                                "value": "28",
                                                                "valueLabel": "FU28",
                                                                "valueDescription": "T28"
                                                            },
                                                            {
                                                                "value": "29",
                                                                "valueLabel": "FU29",
                                                                "valueDescription": "T29"
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "label": "Type",
                                    "itemNumber": 2,
                                    "authors": "epaduser",
                                    "explanatoryText": "Type of lesion",
                                    "minCardinality": 1,
                                    "maxCardinality": 1,
                                    "shouldDisplay": true,
                                    "id": "2.25.43885828.13089996213.217635712143",
                                    "annotatorConfidence": false,
                                    "QuestionType": {
                                        "codeValue": "RDETBD3",
                                        "codeMeaning": "Lesion Type",
                                        "codingSchemeDesignator": "RADELEMENT"
                                    },
                                    "AllowedTerm": [
                                        {
                                            "codeValue": "S71",
                                            "codeMeaning": "Target Lesion",
                                            "codingSchemeDesignator": "99EPAD",
                                            "codingSchemeVersion": "1.0"
                                        },
                                        {
                                            "codeValue": "S72",
                                            "codeMeaning": "Non-Target Lesion",
                                            "codingSchemeDesignator": "99EPAD",
                                            "codingSchemeVersion": "1.0"
                                        },
                                        {
                                            "codeValue": "S75",
                                            "codeMeaning": "Non-cancer Lesion",
                                            "codingSchemeDesignator": "99EPAD",
                                            "codingSchemeVersion": "1.0"
                                        }
                                    ]
                                },
                                {
                                    "label": "Lesion Status",
                                    "itemNumber": 3,
                                    "authors": "epaduser",
                                    "explanatoryText": "Status of lesion",
                                    "minCardinality": 1,
                                    "maxCardinality": 1,
                                    "shouldDisplay": true,
                                    "annotatorConfidence": false,
                                    "id": "2.25.436905441089.13054168484973.21324571207",
                                    "QuestionType": {
                                        "codeValue": "RDE54",
                                        "codeMeaning": "Lesion Status",
                                        "codingSchemeDesignator": "RADELEMENT"
                                    },
                                    "AllowedTerm": [
                                        {
                                            "codeValue": "52101004",
                                            "codeMeaning": "Present",
                                            "codingSchemeDesignator": "SCT"
                                        },
                                        {
                                            "codeValue": "255314001",
                                            "codeMeaning": "Progressive",
                                            "codingSchemeDesignator": "SCT"
                                        },
                                        {
                                            "codeValue": "7147002",
                                            "codeMeaning": "New",
                                            "codingSchemeDesignator": "SCT"
                                        },
                                        {
                                            "codeValue": "723506003",
                                            "codeMeaning": "Resolved",
                                            "codingSchemeDesignator": "SCT"
                                        }
                                    ]
                                },
                                {
                                    "label": "Lesion Enhancement",
                                    "itemNumber": 3,
                                    "authors": "epaduser",
                                    "explanatoryText": "Enhancement state of lesion",
                                    "minCardinality": 0,
                                    "maxCardinality": 1,
                                    "shouldDisplay": true,
                                    "annotatorConfidence": false,
                                    "id": "2.25.436905441089.13054164543173.217634571207",
                                    "QuestionType": {
                                        "codeValue": "RDETBD4",
                                        "codeMeaning": "Lesion Enhancement",
                                        "codingSchemeDesignator": "RADELEMENT"
                                    },
                                    "AllowedTerm": [
                                        {
                                            "codeValue": "C113842",
                                            "codeMeaning": "Enhancing Lesion",
                                            "codingSchemeDesignator": "NCIt"
                                        },
                                        {
                                            "codeValue": "C81175",
                                            "codeMeaning": "Nonenhancing",
                                            "codingSchemeDesignator": "NCIt"
                                        }
                                    ]
                                }
                            ]
                        },
                        "QuestionType": {
                            "codeValue": "RDETBD1",
                            "codeMeaning": "Lesion Quality",
                            "codingSchemeDesignator": "RADELEMENT"
                        },
                        "AllowedTerm": [
                            {
                                "codeValue": "S86",
                                "codeMeaning": "Evaluable",
                                "codingSchemeDesignator": "99EPAD",
                                "codingSchemeVersion": "1.0",
                                "defaultAnswer": true
                            },
                            {
                                "codeValue": "RID39225",
                                "codeMeaning": "Nonevaluable",
                                "codingSchemeDesignator": "RADLEX"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}