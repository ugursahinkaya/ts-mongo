import { Article } from './Article';

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
  /** {"to":"Article","field":"owner","relation":"OneToMany","optional":true,"autoFields":[["firstSave",{"autoNowAdd":true,"auto":true}],["lastSave",{"autoNow":true,"auto":true}],["token",{"generator":"uuid","type":"string","unique":true,"auto":true}]],"relationFields":[["owner","ManyToOne",false]]} */
  articles?: Article[]
  /** This is only for type extraction, not a real field */
  $relationFields: 'articles';
  /** This is only for type extraction, not a real field */
  $autoFields: 'id' | 'firstSave' | 'lastSave';
};
export const components: string[] = [];
export const identifier = {
  "name": "User",
  "collectionArgs": {
    "dbName": "blog-test",
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
    "articles": {
      "name": "articles",
      "type": "Article[]",
      "args": {
        "to": "Article",
        "field": "owner",
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
            "owner",
            "ManyToOne",
            false
          ]
        ],
        "db": "blog-test",
        "collection": "article"
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
      "articles",
      "OneToMany",
      true
    ]
  ]
};
