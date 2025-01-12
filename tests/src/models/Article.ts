import { User } from './User';

export type Article = {
  /** {"primaryKey":true,"map":"_id","auto":true} */
  id: string
  /** {"autoNowAdd":true,"auto":true} */
  firstSave: Date
  /** {"autoNow":true,"auto":true} */
  lastSave: Date
  /** {"generator":"uuid","type":"string","unique":true,"auto":true} */
  token: string
  title: string
  content: string
  /** {"tag":true} */
  tags: string[]
  /** {"to":"User","field":"articles","relation":"ManyToOne","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}]],"relationFields":[["articles","OneToMany",true]]} */
  owner?: User
  /** This is only for type extraction, not a real field */
  $relationFields: 'owner';
  /** This is only for type extraction, not a real field */
  $autoFields: 'id' | 'firstSave' | 'lastSave' | 'token';
};
export const components: string[] = [];
export const identifier = {
  "name": "Article",
  "collectionArgs": {
    "dbName": "tagi-test",
    "collectionName": "article"
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
    "title": {
      "name": "title",
      "type": "string",
      "args": {}
    },
    "content": {
      "name": "content",
      "type": "string",
      "args": {}
    },
    "tags": {
      "name": "tags",
      "type": "string",
      "array": true,
      "args": {
        "tag": true
      }
    },
    "owner": {
      "name": "owner",
      "type": "User",
      "args": {
        "to": "User",
        "field": "articles",
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
            "articles",
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
      "owner",
      "ManyToOne",
      false
    ]
  ],
  "events": {
    "after:save": [
      {
        "process": "checkTags",
        "payload": {
          "fields": [
            "tags"
          ]
        }
      }
    ],
    "after:delete": [
      {
        "process": "notifyDeletedTags",
        "payload": {
          "fields": [
            "tags"
          ]
        }
      }
    ]
  }
};
