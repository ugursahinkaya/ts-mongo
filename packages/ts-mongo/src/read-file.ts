import ts from "typescript";
// StringLiteral'deki tırnakları temizlemek için yardımcı fonksiyon
export const cleanLiteral = (literal: string): string => {
  return (literal.startsWith("'") && literal.endsWith("'")) ||
    (literal.startsWith('"') && literal.endsWith('"'))
    ? literal.slice(1, -1)
    : literal;
};

// Decorator'lerin fonksiyon adlarını ve parametrelerini analiz eden fonksiyon
const parseDecoratorExpression = (
  expression: ts.Expression
): { fn?: string; params?: string[]; name?: string } => {
  if (ts.isCallExpression(expression)) {
    const fnName = expression.expression.getText(); // Fonksiyon adı
    const args = expression.arguments.map((arg) => {
      if (ts.isStringLiteral(arg)) {
        return cleanLiteral(arg.getText());
      }
      return arg.getText();
    });

    return {
      fn: fnName,
      params: args,
    };
  }

  return { name: expression.getText() }; // Eğer CallExpression değilse
};
export const result: Record<
  | "imports"
  | "classes"
  | "interfaces"
  | "types"
  | "enums"
  | "namespaces"
  | "modules"
  | "exports"
  | "statements",
  any[]
> = {
  imports: [],
  classes: [],
  interfaces: [],
  types: [],
  enums: [],
  namespaces: [],
  modules: [],
  exports: [],
  statements: [],
};
const parseType = (type: ts.TypeNode | undefined): any => {
  if (!type) return "any";

  const convertToJson = (str: string): any => {
    let jsonString = str.replace(/\n /g, ";");

    jsonString = jsonString.replace(/ {2}/g, "");
    jsonString = jsonString.replace(/;/g, ",");
    jsonString = jsonString.replace(/(\w+):/g, '"$1":');
    jsonString = jsonString.replace(/'/g, '"');
    jsonString = jsonString.replace(/{,/g, "{");
    jsonString = jsonString.replace(/, }/g, "}");
    jsonString = jsonString.replace(/,,/g, ",");
    jsonString = jsonString.replace(/},}/g, "}}");
    jsonString = jsonString.replace(/,}/g, "}");
    jsonString = jsonString.replace(/\[\,/g, "[");
    jsonString = jsonString.replace(/\, \]/g, "]");
    jsonString = jsonString.replace(/\,\]/g, "]");
    return JSON.parse(jsonString);
  };

  if (ts.isTypeReferenceNode(type)) {
    const typeName = type.typeName.getText();
    const typeArguments = type.typeArguments?.map(parseType) || [];
    const typeText = type.typeArguments?.[0]?.getText();

    const res = {
      type: typeName,
      args: typeArguments.map((t) => {
        return typeof t === "string" && t.startsWith("'") && t.endsWith("'")
          ? t.slice(1, -1)
          : typeof t === "string" && t.startsWith("{") && t.endsWith("}")
            ? convertToJson(t)
            : t;
      }),
      typeText,
    };
    return res;
  }

  if (ts.isArrayTypeNode(type)) {
    return {
      type: "Array",
      elementType: parseType(type.elementType),
    };
  }

  if (ts.isUnionTypeNode(type)) {
    return {
      type: "Union",
      types: type.types.map(parseType),
    };
  }

  if (ts.isIntersectionTypeNode(type)) {
    return {
      type: "Intersection",
      types: type.types.map(parseType),
    };
  }

  if (ts.isLiteralTypeNode(type) || ts.isStringLiteral(type)) {
    return type.getText();
  }

  return type.getText();
};

function findImportedTypes(
  sourceFile: ts.SourceFile,
  typeAliasNode: ts.TypeAliasDeclaration
) {
  const importedTypes: Record<string, string> = {};

  // Kaynak dosyada bulunan import bildirimlerini buluyoruz
  const imports = sourceFile.statements.filter(ts.isImportDeclaration);

  // Type Alias'ın içinde kullanılan tipleri gez
  const visitor = (node: ts.Node) => {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      const typeName = node.typeName.text;

      // Bu tip başka bir dosyadan mı import edilmiş?
      const matchingImport = imports.find((importDecl) => {
        if (
          importDecl.importClause?.namedBindings &&
          ts.isNamedImports(importDecl.importClause.namedBindings)
        ) {
          return importDecl.importClause.namedBindings.elements.some(
            (element) => element.name.text === typeName
          );
        }
        return false;
      });

      if (matchingImport) {
        const moduleName = (matchingImport.moduleSpecifier as ts.StringLiteral)
          .text;
        importedTypes[typeName] = moduleName;
      }
    }

    ts.forEachChild(node, visitor);
  };

  visitor(typeAliasNode);

  return importedTypes;
}

export const analyzeTypeScriptCode = (tsCode: string) => {
  const sourceFile = ts.createSourceFile(
    "tempFile.ts", // Geçici dosya adı
    tsCode, // TypeScript kodu
    ts.ScriptTarget.Latest, // ECMAScript hedef sürümü
    true // Parent düğümleri ayarla
  );

  const findNodes = (): any => {
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        result.imports.push({
          from: node.moduleSpecifier.getText(),
          imports: node.importClause?.namedBindings
            ? ts.isNamedImports(node.importClause.namedBindings)
              ? node.importClause.namedBindings.elements.map((el) =>
                  el.getText()
                ) || []
              : node.importClause?.name
                ? [node.importClause.name.getText()]
                : []
            : [],
        });
      } else if (ts.isClassDeclaration(node)) {
        const name = node.name?.getText();
        const decorators = ts.getDecorators(node) || [];
        result.classes.push({
          type: "ClassDeclaration",
          name: name,
          decorators: decorators.map((decorator) => {
            const parsedDecorator = parseDecoratorExpression(
              decorator.expression
            );
            return {
              ...parsedDecorator,
              kind: ts.SyntaxKind[decorator.kind],
            };
          }),
          members: node.members
            .map((member) => {
              if (ts.isMethodDeclaration(member)) {
                return {
                  type: ts.SyntaxKind[member.kind],
                  name: member.name.getText(),
                  decorators: (ts.getDecorators(member) || []).map(
                    (decorator) => {
                      const parsedDecorator = parseDecoratorExpression(
                        decorator.expression
                      );
                      return {
                        ...parsedDecorator,
                        kind: ts.SyntaxKind[decorator.kind],
                      };
                    }
                  ),
                  parameters: (member.parameters || []).map((param) => ({
                    name: param.name.getText(),
                    type: parseType(param.type),
                  })),
                  //accessModifiers: getModifiers(member.modifiers),
                };
              } else if (ts.isPropertyDeclaration(member)) {
                return {
                  syntaxKind: ts.SyntaxKind[member.kind],
                  name: member.name.getText(),
                  type: parseType(member.type),
                };
              } else if (ts.isConstructorDeclaration(member)) {
                return {
                  type: "ConstructorDeclaration",
                  parameters: (member.parameters || []).map((param) => ({
                    name: param.name.getText(),
                    type: parseType(param.type),
                  })),
                };
              }
              return null;
            })
            .filter(Boolean),
        });
      } else if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.getText();

        if (!result.interfaces.find((i) => i.name === name)) {
          const extendsTypes: string[] = [];
          if (node.heritageClauses) {
            node.heritageClauses.forEach((heritageClause) => {
              if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                heritageClause.types.forEach((type) => {
                  extendsTypes.push(type.getText());
                });
              }
            });
          }
          const InterfaceDeclaration: {
            type: string;
            name: string;
            properties: { name: string; type: any; optional: boolean }[];
            methods: {
              name: string;
              parameters: { name: string; type: any }[];
            }[];
            extends?: string[];
          } = {
            type: "InterfaceDeclaration",
            name: name,
            properties: node.members
              .filter(ts.isPropertySignature)
              .map((prop) => {
                return {
                  name: prop.name.getText(),
                  type: parseType(prop.type),
                  optional: prop.questionToken !== undefined,
                };
              }),
            methods: node.members
              .filter(ts.isMethodSignature)
              .map((method) => ({
                name: method.name.getText(),
                parameters: (method.parameters || []).map((param) => ({
                  name: param.name.getText(),
                  type: parseType(param.type),
                })),
              })),
          };
          if (extendsTypes.length > 0) {
            InterfaceDeclaration["extends"] = extendsTypes;
          }
          result.interfaces.push(InterfaceDeclaration);
        }
      } else if (ts.isTypeAliasDeclaration(node)) {
        const name = node.name.getText();
        result.types.push({
          typeAlias: "TypeAliasDeclaration",
          name: name,
          typeAliasType: parseType(node.type),
          text: node.getText(),
          imports: findImportedTypes(sourceFile, node),
        });
      } else if (ts.isEnumDeclaration(node)) {
        const name = node.name.getText();
        const members = node.members.map((member) => ({
          name: member.name.getText(),
          initializer: member.initializer
            ? member.initializer.getText().startsWith("'") &&
              member.initializer.getText().endsWith("'")
              ? member.initializer.getText().slice(1, -1)
              : member.initializer.getText()
            : undefined,
        }));

        result.enums.push({
          type: "EnumDeclaration",
          name: name,
          members: members,
        });
      } else if (ts.isModuleDeclaration(node)) {
        const name = node.name.getText();
        result.modules.push({
          type: "ModuleDeclaration",
          name: name,
          //@ts-expect-error 123
          statements: node.body!.statements.map((statement) =>
            statement.getText()
          ),
        });
      } else if (ts.isExportDeclaration(node)) {
        result.exports.push({
          type: "ExportDeclaration",
          exportClause: node.exportClause
            ? node.exportClause.getText()
            : undefined,
          moduleSpecifier: node.moduleSpecifier
            ? node.moduleSpecifier.getText()
            : undefined,
        });
      }

      ts.forEachChild(node, visit); // Her alt düğüm için gez
    };

    visit(sourceFile);

    return result;
  };
  const res = findNodes();
  return res;
};
