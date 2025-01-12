import { User } from './User';
import { AccessToken } from './AccessToken';

export type DeviceToken = {
  /** {"primaryKey":true,"map":"_id","auto":true} */
  id: string
  /** {"autoNowAdd":true,"auto":true} */
  firstSave: Date
  /** {"autoNow":true,"auto":true} */
  lastSave: Date
  /** {"generator":"uuid","type":"string","unique":true,"auto":true} */
  token: string
  userAgent: string
  ip: string
  referer: string
  /** {"to":"User","field":"device","relation":"ManyToOne","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}]],"relationFields":[["accessToken","OneToMany",true],["device","OneToMany",true]]} */
  user?: User
  /** {"to":"AccessToken","field":"device","relation":"OneToMany","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}],["token",{"generator":"uuid","type":"string","unique":true,"auto":true}]],"relationFields":[["device","ManyToOne",false],["refreshToken","OneToMany",true],["user","ManyToOne",false]]} */
  accessToken?: AccessToken[]
  /** This is only for type extraction, not a real field */
  $relationFields: 'user' | 'accessToken';
  /** This is only for type extraction, not a real field */
  $autoFields: 'id' | 'firstSave' | 'lastSave' | 'token';
};
export const components: string[] = [];
export const identifier = {
  "name": "DeviceToken",
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
    "collectionName": "device_token"
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
    "userAgent": {
      "name": "userAgent",
      "type": "string",
      "args": {}
    },
    "ip": {
      "name": "ip",
      "type": "string",
      "args": {}
    },
    "referer": {
      "name": "referer",
      "type": "string",
      "args": {}
    },
    "user": {
      "name": "user",
      "type": "User",
      "args": {
        "to": "User",
        "field": "device",
        "relation": "ManyToOne",
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
        ],
        "db": "tagi-test",
        "collection": "user"
      },
      "array": false
    },
    "accessToken": {
      "name": "accessToken",
      "type": "AccessToken[]",
      "args": {
        "to": "AccessToken",
        "field": "device",
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
      "user",
      "ManyToOne",
      false
    ],
    [
      "accessToken",
      "OneToMany",
      true
    ]
  ]
};
