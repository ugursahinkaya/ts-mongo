import { DeviceToken } from './DeviceToken';
import { RefreshToken } from './RefreshToken';
import { User } from './User';

export type AccessToken = {
  /** {"primaryKey":true,"map":"_id","auto":true} */
  id: string
  /** {"autoNowAdd":true,"auto":true} */
  firstSave: Date
  /** {"autoNow":true,"auto":true} */
  lastSave: Date
  /** {"type":"AccessScope","default":"GUEST"} */
  scope: string
  /** {"generator":"uuid","type":"string","unique":true,"auto":true} */
  token: string
  /** {"to":"DeviceToken","field":"accessToken","relation":"ManyToOne","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}],["token",{"generator":"uuid","type":"string","unique":true,"auto":true}]],"relationFields":[["user","ManyToOne",false],["accessToken","OneToMany",true]]} */
  device?: DeviceToken
  /** {"to":"RefreshToken","field":"accessToken","relation":"OneToMany","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}],["token",{"generator":"uuid","type":"string","unique":true,"auto":true}]],"relationFields":[["accessToken","ManyToOne",false],["device","Single",false]]} */
  refreshToken?: RefreshToken[]
  /** {"to":"User","field":"accessToken","relation":"ManyToOne","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}]],"relationFields":[["accessToken","OneToMany",true],["device","OneToMany",true]]} */
  user?: User
  /** This is only for type extraction, not a real field */
  $relationFields: 'device' | 'refreshToken' | 'user';
  /** This is only for type extraction, not a real field */
  $autoFields: 'id' | 'firstSave' | 'lastSave' | 'token';
};
export const components: string[] = [];
export const identifier = {
  "name": "AccessToken",
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
    "collectionName": "access_token"
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
    "scope": {
      "name": "scope",
      "type": "string",
      "args": {
        "type": "AccessScope",
        "default": "GUEST"
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
        "field": "accessToken",
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
    },
    "refreshToken": {
      "name": "refreshToken",
      "type": "RefreshToken[]",
      "args": {
        "to": "RefreshToken",
        "field": "accessToken",
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
            "accessToken",
            "ManyToOne",
            false
          ],
          [
            "device",
            "Single",
            false
          ]
        ],
        "db": "tagi-test",
        "collection": "refresh_token"
      },
      "array": true
    },
    "user": {
      "name": "user",
      "type": "User",
      "args": {
        "to": "User",
        "field": "accessToken",
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
  ]
};
