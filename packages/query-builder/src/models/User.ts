import { AccessToken } from './AccessToken';
import { DeviceToken } from './DeviceToken';

export type User = {
  /** {"primaryKey":true,"map":"_id","auto":true} */
  id: string
  /** {"autoNowAdd":true,"auto":true} */
  firstSave: Date
  /** {"autoNow":true,"auto":true} */
  lastSave: Date
  userName: string
  firstName: string
  lastName: string
  /** {"optional":true} */
  password?: string
  /** {"to":"AccessToken","field":"user","relation":"OneToMany","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}],["token",{"generator":"uuid","type":"string","unique":true,"auto":true}]],"relationFields":[["device","ManyToOne",false],["refreshToken","OneToMany",true],["user","ManyToOne",false]]} */
  accessToken?: AccessToken[]
  /** {"to":"DeviceToken","field":"user","relation":"OneToMany","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}],["token",{"generator":"uuid","type":"string","unique":true,"auto":true}]],"relationFields":[["user","ManyToOne",false],["accessToken","OneToMany",true]]} */
  device?: DeviceToken[]
  /** This is only for type extraction, not a real field */
  $relationFields: 'accessToken' | 'device';
  /** This is only for type extraction, not a real field */
  $autoFields: 'id' | 'firstSave' | 'lastSave';
};
export const components: string[] = [];
export const identifier = {
  "name": "User",
  "collectionArgs": {
    "indexes": {
      "userNameIndex": {
        "unique": true,
        "keys": {
          "userName": 1
        }
      }
    },
    "dbName": "tagi-test",
    "collectionName": "user"
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
    "userName": {
      "name": "userName",
      "type": "string",
      "args": {}
    },
    "firstName": {
      "name": "firstName",
      "type": "string",
      "args": {}
    },
    "lastName": {
      "name": "lastName",
      "type": "string",
      "args": {}
    },
    "password": {
      "name": "password",
      "type": "string",
      "args": {
        "optional": true
      }
    },
    "accessToken": {
      "name": "accessToken",
      "type": "AccessToken[]",
      "args": {
        "to": "AccessToken",
        "field": "user",
        "relation": "OneToMany",
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
            "device",
            "ManyToOne",
            false
          ],
          [
            "refreshToken",
            "OneToMany",
            true
          ],
          [
            "user",
            "ManyToOne",
            false
          ]
        ],
        "db": "tagi-test",
        "collection": "access_token"
      },
      "array": true
    },
    "device": {
      "name": "device",
      "type": "DeviceToken[]",
      "args": {
        "to": "DeviceToken",
        "field": "user",
        "relation": "OneToMany",
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
      "array": true
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
    ]
  ],
  "relationFields": [
    [
      "accessToken",
      "OneToMany",
      true
    ],
    [
      "device",
      "OneToMany",
      true
    ]
  ]
};
