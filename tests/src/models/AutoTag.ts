
export type AutoTag = {
  /** {"primaryKey":true,"map":"_id","auto":true} */
  id: string
  /** {"autoNowAdd":true,"auto":true} */
  firstSave: Date
  /** {"autoNow":true,"auto":true} */
  lastSave: Date
  name: string
  /** {"optional":true} */
  color?: string
  /** {"default":[]} */
  category: string[]
  /** {"default":[],"readonly":true} */
  usingRecords: string[]
  /** This is only for type extraction, not a real field */
  $autoFields: 'id' | 'firstSave' | 'lastSave' | 'usingRecords';
};
export const components: string[] = [];
export const identifier = {
  "name": "AutoTag",
  "events": {
    "before:delete": [
      {
        "process": "confirmDeleteTagFromRecords",
        "resolve": {
          "process": "deleteTagFromRecords"
        },
        "reject": {
          "process": "cancelDeleteTag"
        }
      }
    ],
    "before:save": [
      {
        "process": "confirmUpdateTagFromRecords",
        "resolve": {
          "process": "updateTagFromRecords"
        },
        "reject": {
          "process": "cancelUpdateTag"
        }
      }
    ]
  },
  "fields": {
    "id": {
      "name": "id",
      "type": "ObjectId",
      "args": {
        "primaryKey": true,
        "map": "_id",
        "auto": true
      }
    },
    "firstSave": {
      "name": "firstSave",
      "type": "Date",
      "args": {
        "autoNowAdd": true,
        "auto": true
      }
    },
    "lastSave": {
      "name": "lastSave",
      "type": "Date",
      "args": {
        "autoNow": true,
        "auto": true
      }
    },
    "name": {
      "name": "name",
      "type": "string"
    },
    "color": {
      "name": "color",
      "type": "string",
      "args": {
        "optional": true
      }
    },
    "category": {
      "name": "category",
      "type": "string",
      "array": true,
      "args": {
        "default": []
      }
    },
    "usingRecords": {
      "name": "usingRecords",
      "type": "string",
      "array": true,
      "args": {
        "default": [],
        "readonly": true
      }
    }
  }
};
