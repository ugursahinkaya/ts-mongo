import { DeviceToken } from './DeviceToken';

export type QueryToken = {
  /** {"primaryKey":true,"map":"_id","auto":true} */
  id: string
  /** {"autoNowAdd":true,"auto":true} */
  firstSave: Date
  /** {"autoNow":true,"auto":true} */
  lastSave: Date
  /** {"generator":"uuid","type":"string","unique":true,"auto":true} */
  token: string
  /** {"to":"DeviceToken","relation":"Single","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}],["token",{"generator":"uuid","type":"string","unique":true,"auto":true}]],"relationFields":[["user","ManyToOne",false],["accessToken","OneToMany",true]]} */
  device?: DeviceToken
  /** This is only for type extraction, not a real field */
  $relationFields: 'device';
  /** This is only for type extraction, not a real field */
  $autoFields: 'id' | 'firstSave' | 'lastSave' | 'token';
};
export const components: string[] = [];
export const identifier = {
  "name": "QueryToken",
  "collectionArgs": {
    "indexes": {
      "tokenIndex": {
        "unique": true,
        "keys": {
          "token": 1
        }
      }
    },
    "dbName": "tagi-test",
    "collectionName": "query_token"
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
    "token": {
      "name": "token",
      "type": "string",
      "args": {
        "generator": "uuid",
        "type": "string",
        "unique": true,
        "auto": true
      }
    },
    "device": {
      "name": "device",
      "type": "DeviceToken",
      "args": {
        "to": "DeviceToken",
        "relation": "Single",
        "optional": true,
        "autoFields": [
          [
            "firstSave",
            {
              "autoNowAdd": true,
              "auto": true
            }
          ],
          [
            "lastSave",
            {
              "autoNow": true,
              "auto": true
            }
          ],
          [
            "token",
            {
              "generator": "uuid",
              "type": "string",
              "unique": true,
              "auto": true
            }
          ]
        ],
        "relationFields": [
          [
            "user",
            "ManyToOne",
            false
          ],
          [
            "accessToken",
            "OneToMany",
            true
          ]
        ],
        "db": "tagi-test",
        "collection": "device_token"
      },
      "array": false
    }
  },
  "autoFields": [
    [
      "firstSave",
      {
        "autoNowAdd": true,
        "auto": true
      }
    ],
    [
      "lastSave",
      {
        "autoNow": true,
        "auto": true
      }
    ],
    [
      "token",
      {
        "generator": "uuid",
        "type": "string",
        "unique": true,
        "auto": true
      }
    ]
  ],
  "relationFields": [
    [
      "device",
      "Single",
      false
    ]
  ]
};
