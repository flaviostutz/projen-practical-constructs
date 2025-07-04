import { Project, PropertySignature, Node } from 'ts-morph';
import { Property } from '@jsii/spec';
import { HasProperties } from '@mrgrain/jsii-struct-builder/lib/builder';

/**
 * Loads properties from a TypeScript interface or type alias as a jsii Property array.
 * @param filePath Path to the TypeScript file.
 * @param typeName Name of the interface or type alias.
 * @param tsConfigFilePath Optional path to the tsconfig file.
 * @throws Error if the type or interface is not found.
 */
export const tsToJsii = (
  filePath: string,
  typeName: string,
  tsConfigFilePath?: string,
): HasProperties => {
  if (!filePath || !typeName) {
    throw new Error('Both filePath and typeName are required.');
  }

  const project = new Project({ tsConfigFilePath });
  const sourceFile = project.addSourceFileAtPath(filePath);

  console.log(sourceFile.getFullText());

  // Try to find interface
  const iface = sourceFile.getInterface(typeName);
  if (iface) {
    return { properties: iface.getProperties().map((prop) => toProperty(prop)) };
  }

  // Try to find type alias (object type)
  const typeAlias = sourceFile.getTypeAlias(typeName);
  console.log(`>> ${typeAlias?.getText()}`);
  // If type alias exists, check if it is a type literal
  if (typeAlias) {
    const typeNode = typeAlias.getTypeNode();
    console.log(`>>> Type node: ${typeNode?.getText()}`);
    if (typeNode && Node.isTypeElementMembered(typeNode)) {
      console.log(`>>>> Type literal found: ${typeNode.getText()}`);
      return {
        properties: typeNode
          .getMembers()
          .filter((element) => Node.isPropertySignature(element))
          .map((prop) => toProperty(prop)),
      };
    }
  }

  throw new Error(`Type or interface '${typeName}' not found in ${filePath}`);
};

const toProperty = (prop: PropertySignature): Property => {
  const type = prop.getType();
  // Use the TypeChecker from the source file context
  const checker = prop.getSourceFile().getProject().getTypeChecker();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mapType(t: any): any {
    if (t.isString()) {
      return { primitive: 'string' };
    }
    if (t.isNumber()) {
      return { primitive: 'number' };
    }
    if (t.isBoolean()) {
      return { primitive: 'boolean' };
    }
    if (t.isArray()) {
      const elementType = t.getArrayElementType();
      return {
        collection: {
          kind: 'array',
          elementtype: elementType ? mapType(elementType) : { primitive: 'any' },
        },
      };
    }
    if (t.isUnion()) {
      return {
        union: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          types: t.getUnionTypes().map((ut: any) => mapType(ut)),
        },
      };
    }
    if (t.isIntersection()) {
      // jsii spec does not support intersection, treat as union for compatibility
      return {
        union: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          types: t.getIntersectionTypes().map((it: any) => mapType(it)),
        },
      };
    }
    if (t.isObject() && t.getSymbol()) {
      return {
        fqn: checker.getFullyQualifiedName(t.getSymbol()),
      };
    }
    return { primitive: 'any' };
  }

  return {
    name: prop.getName(),
    optional: prop.hasQuestionToken(),
    type: mapType(type),
    // jsii Property.docs expects an object, not an array
    docs:
      prop.getJsDocs().length > 0 && typeof prop.getJsDocs()[0].getComment() === 'string'
        ? { summary: prop.getJsDocs()[0].getComment() as string }
        : {},
  };
};
