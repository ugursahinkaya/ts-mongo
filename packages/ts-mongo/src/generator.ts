import fs from "fs";
import path from "path";
import { cleanLiteral, result } from "./read-file";
import { ModelIdentifier, ModelField } from "@ugursahinkaya/ts-mongo-types";
export function generate(res: any, jsonFilePath: string) {
  let importedTypes: Record<string, string> = {};
  res.imports.forEach((importItem: { imports: string[]; from: string }) => {
    importItem.imports.forEach((importedType) => {
      importedTypes[importedType] = cleanLiteral(importItem.from);
    });
  });
  const usingTag: Record<string, string[]> = {};
  const identifierObjects: Record<string, ModelIdentifier> = {};
  const modelDefinitions: Record<string, any> = {};
  function analyzeFieldType(field: any, modelName: string): ModelField {
    const { type, optional } = field;
    let baseArgs =
      type.args && type.args[0] && typeof type.args[0] === "object"
        ? type.args[0]
        : {};
    if (optional) {
      baseArgs.optional = true;
    }

    const handleObjectField = (): ModelField => {
      return {
        name: field.name,
        type: type.typeText,
        array: type.args[0]?.multiple,
        args: { object: true },
        typeArgs: type.args[0],
      };
    };

    const handleStringField = (): ModelField => ({
      name: field.name,
      type: "string",
      array: type.args[0]?.multiple,
      args: baseArgs,
    });
    const handleEnumField = (): ModelField => {
      let enumDefinition = res.enums.find(
        (e: any) => e.name === type.args[0].replace("typeof ", "")
      );
      let options = [];
      if (enumDefinition) {
        options = enumDefinition.members.map((m: any) => ({
          label: m.initializer,
          value: m.name,
        }));
      } else {
        enumDefinition = res.types.find(
          (e: any) => e.name === type.args[0].replace("typeof ", "")
        );
        if (enumDefinition && enumDefinition.typeAliasType) {
          options = enumDefinition.typeAliasType.types.map((o: any) =>
            cleanLiteral(o)
          );
        } else {
          throw new Error(`Enum not found for field: ${field.name}`);
        }
      }
      baseArgs.enum = type.args[0].replace("typeof ", "");
      if (type.args[1]) {
        baseArgs.default = type.args[1]?.replace(`${type.args[0]}.`, "");
      }
      baseArgs.options = options;
      return {
        name: field.name,
        type: "enum",
        array: type.args[0]?.multiple,
        args: baseArgs,
      };
    };
    const handleTagField = (): ModelField => {
      if (!usingTag[modelName]) usingTag[modelName] = [];
      usingTag[modelName]?.push(field.name);
      baseArgs.tag = true;
      return {
        name: field.name,
        type: "string",
        array: true,
        args: baseArgs,
      };
    };
    const handleAutoField = (): ModelField => {
      if (type.args[1] === "Increment") {
        baseArgs.autoIncrement = true;
      } else if (type.args[1]?.type === "slug") {
        baseArgs.from = type.args[1].from;
        baseArgs.slug = true;
      }
      return {
        name: field.name,
        type: type.args[0],
        array: type.args[0]?.multiple,
        args: baseArgs,
      };
    };
    const handleImageField = (): ModelField => {
      const keys =
        type.args[0] && type.args[0].thumbnail
          ? [
              "'original'",
              ...Object.keys(type.args[0].thumbnail).map((k) => `'${k}'`),
            ]
          : [];
      let fieldType = `Record<${keys.join(" | ")}, string>`;
      if (keys.length === 0) {
        fieldType = "string";
      } else {
        baseArgs.keys = keys;
      }
      return {
        name: field.name,
        type: fieldType,
        args: baseArgs,
      };
    };
    const handleFileField = (): ModelField => {
      if (type.args[0]) {
        baseArgs = { ...baseArgs, ...type.args[0] };
      }
      baseArgs.file = true;
      return {
        name: field.name,
        type: "string",
        array: type.args[0]?.multiple,
        args: baseArgs,
      };
    };
    const handlePrimaryKeyField = (): ModelField => {
      if (type.args[0]) {
        baseArgs = { ...baseArgs, ...type.args[0] };
      }
      baseArgs.primaryKey = true;
      return {
        name: field.name,
        type: type.args[0],
        array: type.args[0]?.multiple,
        args: baseArgs,
      };
    };
    const handleChoicesField = () => {
      delete baseArgs.args;
      if (typeof field.type.args[0] === "string") {
        const typeDefinition = result.types.find(
          (e) => e.name === field.type.args[0].replace("typeof ", "")
        );
        if (typeDefinition) {
          const aliasStr = typeDefinition.typeAliasType
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/;/g, ",")
            .replace(/\,\n\}/g, "\n}");
          baseArgs.options = JSON.parse(aliasStr);
        }
      }
      if (type.args[1]) {
        baseArgs.default = type.args[1].replace(/"/g, "");
      }
      return {
        name: field.name,
        type: "string",
        array: type.args[0]?.multiple,
        args: baseArgs,
      };
    };
    const handleUniqueField = (): ModelField => {
      if (type.args[1]) {
        baseArgs = { ...baseArgs, ...type.args[1] };
      }
      baseArgs.unique = true;
      if (type.args[0].generator) {
        baseArgs.auto = true;
        baseArgs.generator = type.args[0].generator;
      }
      return {
        name: field.name,
        type: baseArgs.type || "string",
        array: type.args[0]?.multiple,
        args: baseArgs,
      };
    };

    const handleJsonField = (): ModelField => ({
      name: field.name,
      type: "Json",
      array: type.args[0]?.multiple,
      args: baseArgs,
    });
    const handleDateTimeField = (): ModelField => ({
      name: field.name,
      type: "Date",
      array: type.args[0]?.multiple,
      args: baseArgs,
    });
    const handleNumberField = (): ModelField => ({
      name: field.name,
      type: "number",
      array: type.args[0]?.multiple,
      args: baseArgs,
    });
    const handleBooleanField = (): ModelField => ({
      name: field.name,
      type: "boolean",
      array: type.args[0]?.multiple,
      args: baseArgs,
    });
    const handleRelationField = (): ModelField => {
      let model = type.args[0].type;
      if (type.type === "Many" || type.type.includes("ToMany")) {
        model += "[]";
      }
      const args = {
        to: type.args[0].type,
        field: type.args[1]?.replace(/"/g, ""),
        relation: type.type.split(".")[1],
        relationName: type.args[2]?.relationName ?? type.args[2],
        db: type.args[2]?.db,
        collection: type.args[2]?.db,
        optional: field.optional,
      };
      return {
        name: field.name,
        type: model,
        array: type.args[0]?.multiple,
        args,
      };
    };
    const handleUndefinedType = () => {
      const definedType = res.types.find(
        (t: { name: string }) => t.name === field.type.type
      );

      if (definedType) {
        importedTypes[definedType.name] = "./index";
        return {
          name: field.name,
          type: definedType.name,
          array: type.args[0]?.multiple,
          args: {
            typeText: definedType.text,
          },
        };
      }
      console.warn(`Undefined field type found for field:`, field);
      return {
        name: field.name,
        type: "Undefined Type",
        array: type.args[0]?.multiple,
        args: type.args || {},
      };
    };

    switch (type.type) {
      case "Field.Object":
        return handleObjectField();
      case "Field.String":
        return handleStringField();
      case "Field.Enum":
        return handleEnumField();
      case "Field.Tag":
        return handleTagField();
      case "Field.Auto":
        return handleAutoField();
      case "Field.File":
        return handleFileField();
      case "Field.PrimaryKey":
        return handlePrimaryKeyField();
      case "Field.Choices":
        return handleChoicesField();
      case "Field.Unique":
        return handleUniqueField();
      case "Field.Image":
        return handleImageField();
      case "Field.Array":
      case "Field.JSON":
        return handleJsonField();
      case "Field.DateTime":
        return handleDateTimeField();
      case "Field.Int":
      case "Field.Decimal":
      case "Field.Timestamp":
        return handleNumberField();
      case "Field.Boolean":
        return handleBooleanField();
      case "Relation.Single":
      case "Relation.Many":
      case "Relation.ManyToOne":
      case "Relation.OneToOne":
      case "Relation.OneToMany":
      case "Relation.ManyToMany":
        return handleRelationField();
      default:
        return handleUndefinedType();
    }
  }

  function extractModels(model: any): ModelIdentifier {
    const updateFieldTypes: Record<string, ModelField> = {
      firstSave: {
        name: "firstSave",
        type: "Date",
        args: { autoNowAdd: true, auto: true },
      },
      lastSave: {
        name: "lastSave",
        type: "Date",
        args: { autoNow: true, auto: true },
      },
    };
    const collectionFieldTypes: Record<string, ModelField> = {
      id: {
        name: "id",
        type: "ObjectId",
        args: { primaryKey: true, map: "_id", auto: true },
      },
      ...updateFieldTypes,
    };
    const collectionFields = model.extends[0].includes("Collection")
      ? collectionFieldTypes
      : {};
    let collectionArgs = {};
    if (model.extends[0].includes("Collection<")) {
      const jsonString = model.extends[0]
        .replace(/Collection<|>/g, "")
        .replace(/(\w+):/g, '"$1":')
        .replace(/;\s+/g, ", ")
        .replace(/(\s*{)/g, " $1")
        .replace(/(\s*})/g, " $1")
        .replace(/\n/g, "")
        .replace(/  /g, "")
        .replace(/\,\}/g, "}");

      try {
        collectionArgs = JSON.parse(jsonString);
      } catch (error) {
        console.error("JSON dönüştürme hatası:");
      }
    }

    const modelFields = model.properties.map((field: any) => {
      return {
        ...analyzeFieldType(field, model.name),
      };
    });
    const modelFieldTypes: Record<string, ModelField> = {};
    const autoFields: [string, any][] = [];
    const relationFields: [string, string, boolean][] = [];
    if (model.extends[0].includes("Collection")) {
      Object.entries(updateFieldTypes).forEach(([key, value]) => {
        autoFields.push([key, value.args]);
      });
    }

    modelFields.forEach((field: ModelField) => {
      modelFieldTypes[field.name] = field;
      if (field.args?.auto) {
        autoFields.push([field.name, field.args]);
      }
      if (field.args?.relation) {
        const rel: [string, string, boolean] = [
          field.name,
          field.args.relation,
          field.args?.relation.includes("ToMany") ?? false,
        ];
        relationFields.push(rel);
      }
    });

    const modelJson: ModelIdentifier = {
      name: model.name,
      collectionArgs,
      fields: {
        ...collectionFields,
        ...modelFieldTypes,
      },
      autoFields,
      relationFields,
    };
    if (Object.keys(usingTag).includes(model.name)) {
      if (!modelJson.events) {
        modelJson.events = {};
      }
      modelJson.events["after:save"] = [
        {
          process: "checkTags",
          payload: { fields: usingTag[model.name] },
        },
      ];
      modelJson.events["after:delete"] = [
        {
          process: "notifyDeletedTags",
          payload: { fields: usingTag[model.name] },
        },
      ];
    }
    return modelJson;
  }
  function injectRelations(model: ModelIdentifier) {
    const relationFields = Object.entries(model.fields).filter(
      ([_key, value]) => value.args?.relation
    );
    relationFields.forEach(([key, value]) => {
      const type = value.type.replace("[]", "");
      if (!type) {
        throw new Error(`where is field type? ${model.name} ${key}`);
      }
      const relatedModel = models.find((m) => m.name === type);
      if (relatedModel && value.args) {
        const auto = relatedModel.autoFields;
        value.args.autoFields = auto;
        value.args.relationFields = relatedModel.relationFields;
      }
    });
    return model;
  }
  let models: ModelIdentifier[] = res.interfaces.map((m: any) =>
    extractModels(m)
  );
  models = models.map(injectRelations);
  const identifiersPaths: Record<string, string> = {};
  if (Object.keys(usingTag).length > 0) {
    const model: ModelIdentifier = {
      name: "AutoTag",
      events: {
        "before:delete": [
          {
            process: "confirmDeleteTagFromRecords",
            resolve: { process: "deleteTagFromRecords" },
            reject: { process: "cancelDeleteTag" },
          },
        ],
        "before:save": [
          {
            process: "confirmUpdateTagFromRecords",
            resolve: { process: "updateTagFromRecords" },
            reject: { process: "cancelUpdateTag" },
          },
        ],
      },
      fields: {
        id: {
          name: "id",
          type: "ObjectId",
          args: { primaryKey: true, map: "_id", auto: true },
        },
        firstSave: {
          name: "firstSave",
          type: "Date",
          args: { autoNowAdd: true, auto: true },
        },
        lastSave: {
          name: "lastSave",
          type: "Date",
          args: { autoNow: true, auto: true },
        },
        name: {
          name: "name",
          type: "string",
        },
        color: {
          name: "color",
          type: "string",
          args: { optional: true },
        },
        category: {
          name: "category",
          type: "string",
          array: true,
          args: { default: [] },
        },
        usingRecords: {
          name: "usingRecords",
          type: "string",
          array: true,
          args: { default: [], readonly: true },
        },
      },
    };
    models.push(model);
  }

  models.forEach((model: any) => {
    const identifierPath = path.join(
      jsonFilePath,
      "identifiers",
      `${model.name}.ts`
    );
    const jsonModel = JSON.stringify(model, null, 2);
    identifiersPaths[identifierPath] = jsonModel;
  });

  const typeNames: string[] = [];
  function generateEnum(enumType: any): string {
    typeNames.push(enumType.type.replace("typeof ", ""));
    let enumStr = `export enum ${enumType.type.replace("typeof ", "")} {\n`;
    if (typeof enumType.args.options[0] === "object") {
      enumType.args.options.forEach((option: any) => {
        enumStr += `  ${option.value} = '${option.label}',\n`;
      });
    } else {
      enumStr = `export type ${enumType.type.replace("typeof ", "")} = '${enumType.options.join("' | '")}'\n`;
      return enumStr;
    }

    enumStr += "}\n";
    return enumStr;
  }

  const typeDefinitions: string[] = [];
  let typesIndexContent = "";
  let indexContent = "";
  let identifiers = "export const idendifiers = {\n";
  let endpoints = "export type Endpoints = {\n";
  let componentsObj = "export const components = {\n";
  let componentNames: string[] = [];
  let modelNames: string[] = [];

  Object.entries(identifiersPaths).forEach(([_identifierPath, jsonModel]) => {
    const model = JSON.parse(jsonModel);
    const modelName = model.name.replace("typeof ", "");
    modelNames.push(modelName);
    //const modelName2 = modelName.charAt(0).toLowerCase() + model.name.slice(1);
    typesIndexContent += `import * as ${modelName} from './${modelName}'; \n`;

    identifiers += `  ${modelName}: ${modelName}.identifier,\n`;
    componentsObj += `  ${modelName}: ${modelName}.components,\n`;
    endpoints += `  ${modelName}: {
    get: ${modelName}.Get;
    pull: ${modelName}.Pull;
    push: ${modelName}.Push;
    delete: ${modelName}.Delete;
  };\n`;

    indexContent += `export { ${modelName} } from './${modelName}.js' \n`;

    let tsModel = `export type ${modelName} = {\n`;
    let editableFields: string[] = [];
    let relationFields: string[] = [];

    const modelImports: Record<string, string[]> = {};
    const modelObj = JSON.parse(jsonModel) as ModelIdentifier;
    const addedFields: string[] = [];
    const modelComponents: string[] = [];
    type TypeArgs = {
      type: string;
      args: (string | TypeArgs)[];
      typeText: string;
    };
    function addToImports(element: string, source?: string) {
      const el = importedTypes[element];
      source = !source ? el : source;
      if (!source) return;

      if (!modelImports[source]) {
        modelImports[source] = [];
      }
      if (modelImports[source]!.indexOf(element) === -1) {
        modelImports[source]!.push(element);
      }
    }
    function checkTypeArgs(args: TypeArgs) {
      if (!args) return;
      if (typeof args.type === "string") {
        addToImports(args.type);
      }
      if (args.args) {
        args.args.forEach((arg) => {
          if (typeof arg === "object") {
            if (arg.args.length > 1) checkTypeArgs(arg);
          }
        });
      }
    }
    const allFields: string[] = [];
    Object.entries(modelObj.fields).forEach(([fieldName, field]) => {
      if (addedFields.indexOf(fieldName) > -1) {
        return;
      }
      let comment = "";
      addedFields.push(fieldName);
      let fieldType = field.type;
      if (field.typeArgs) {
        if (field.typeArgs.args.length === 0) {
          addToImports(field.typeArgs.type);
          fieldType = field.typeArgs.type;
        }
        field.typeArgs.args.forEach((arg: any) => {
          checkTypeArgs(arg);
        });
      } else if (
        typeof fieldType === "string" &&
        fieldType.includes("typeof")
      ) {
        typeDefinitions.push(generateEnum(field));

        addToImports(fieldType, "./index");

        fieldType = fieldType.replace("typeof ", "");
      } else if (fieldType === "image" || fieldType === "image?") {
        fieldType = "Object";
      } else if (field.args && field.args.relation) {
        if (field.args.to !== modelObj.name) {
          addToImports(field.args.to!, `./${field.args.to}`);
        }
        fieldType = field.args.to as string;
        field.array = field.args.relation.includes("ToMany");
      }
      if (field.args?.typeText) {
        typeDefinitions.push("export " + field.args.typeText);
        addToImports(field.type, "./index");
      }

      if (field.args) {
        if (
          field.args.ui?.component &&
          modelComponents.indexOf(field.args.ui?.component) === -1
        ) {
          modelComponents.push(field.args.ui?.component);
        }
        const jsonargs = JSON.stringify(field.args);

        if (Object.keys(field.args).length > 0) {
          comment = "  /** " + jsonargs + " */\n";
        }
      }
      tsModel += `${comment}  ${field.name}${field.args?.optional ? "?" : ""}: ${fieldType === "ObjectId" ? "string" : fieldType}${field.array ? "[]" : ""}\n`;
      if (
        !field.args ||
        (!field.args.relation &&
          !field.args.readonly &&
          !field.args.primaryKey &&
          !field.args.autoIncrement &&
          !field.args.autoNow &&
          !field.args.slug &&
          !field.args.auto &&
          !field.args.autoNowAdd)
      ) {
        if (editableFields.indexOf(field.name) === -1) {
          editableFields.push(field.name);
        }
      }
      if (field.args?.relation) {
        if (relationFields.indexOf(field.name) === -1) {
          relationFields.push(field.name);
        }
      }
      allFields.push(field.name);
    });
    if (relationFields.length > 0) {
      tsModel += `  /** This is only for type extraction, not a real field */\n`;
      tsModel += `  $relationFields: '${relationFields.join("' | '")}';\n`;
    }
    const autoFields = allFields.filter(
      (x) => !editableFields.includes(x) && !relationFields.includes(x)
    );
    if (autoFields.length > 0) {
      tsModel += `  /** This is only for type extraction, not a real field */\n`;
      tsModel += `  $autoFields: '${autoFields.join("' | '")}';\n`;
    }
    tsModel += "};\n";

    identifierObjects[modelName] = modelObj;
    const modelComponentsStr =
      modelComponents.length > 0 ? `'${modelComponents.join("' , '")}'` : "";
    const components = `export const components: string[] = [${modelComponentsStr}];\n`;
    if (modelComponents.length > 0) {
      componentNames.push(...modelComponents);
    }

    let modelImportsStr = "";

    Object.entries(modelImports).forEach(([source, elements]) => {
      modelImportsStr += `import { ${elements.join(", ")} } from '${source}';\n`;
    });
    const res = modelImportsStr + "\n" + tsModel + components;
    const modelPath = path.join(jsonFilePath, "models", `${model.name}.ts`);
    modelDefinitions[modelName] = { filePath: modelPath, content: res };
    /*
    fs.writeFile(
      path.join(jsonFilePath, "models", `${model.name}.ts`),
      res,
      (err) => {
        if (err) {
          console.log("Bir hata oluştu:", err);
        }
      }
    );
    */
  });
  Object.entries(identifierObjects).forEach(([, jsonModel]) => {
    if (jsonModel && jsonModel.fields) {
      Object.entries(jsonModel.fields)
        .filter(([_key, value]) => value.args?.relation)
        .forEach(([, value]) => {
          if (value.args) {
            const model =
              identifierObjects[
                value.args.to as keyof typeof identifierObjects
              ];
            if (model) {
              value.args.db = model.collectionArgs?.dbName;
              value.args.collection = model.collectionArgs?.collectionName;
            }
          }
        });
    }
  });
  Object.entries(modelDefinitions).forEach(([modelName, val]) => {
    let content = val.content;
    const identifier = identifierObjects[modelName];
    if (identifier) {
      content += `export const identifier = ${JSON.stringify(identifier, null, 2)};\n`;
    }
    fs.writeFile(val.filePath, content, (err) => {
      if (err) {
        console.log("Bir hata oluştu:", err);
      }
    });
  });
  identifiers += "};\n";
  componentsObj += "};\n";
  endpoints += "};\n";
  let typesContent = "";
  res.types.forEach((type: { imports?: Record<string, string> }) => {
    if (type.imports) {
      Object.entries(type.imports).forEach(([key, from]) => {
        typesContent += `import { ${key} } from '${from}';\n`;
      });
    }
  });
  typeDefinitions.forEach((typeStr) => {
    typesContent += typeStr;
  });

  if (typesContent.length > 0) {
    fs.writeFile(
      path.join(jsonFilePath, "models", "index.ts"),
      typesContent,
      (err) => {
        if (err) {
          console.log("Bir hata oluştu:", err);
        }
      }
    );
  }

  /*
  fs.writeFile(
    path.join(jsonFilePath, "models", "index.ts"),
    typesIndexContent,
    (err) => {
      if (err) {
        console.log("Bir hata oluştu:", err);
      }
    }
  );

  fs.writeFile(
    path.join(jsonFilePath, "identifiers", "index.ts"),
    indexContent,
    (err) => {
      if (err) {
        console.log("Bir hata oluştu:", err);
      }
    }
  );
  */
}
