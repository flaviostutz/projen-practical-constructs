import { Project, PropertySignature, Node, TypeChecker, Type, TypeNode } from 'ts-morph';
import {
  CollectionTypeReference,
  PrimitiveTypeReference,
  Property,
  TypeReference,
  UnionTypeReference,
} from '@jsii/spec';
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

  // console.log(sourceFile.getFullText());

  // Try to find interface
  const iface = sourceFile.getInterface(typeName);
  if (iface) {
    return { properties: iface.getProperties().map((prop) => toJsiiProperty(prop)) };
  }

  // Try to find type alias (object type)
  const typeAlias = sourceFile.getTypeAlias(typeName);
  const typeNode = typeAlias?.getTypeNode();
  if (typeNode) {
    // console.log(`>>> Type node: ${typeNode?.getText()}`);
    const props = resolveJsiiPropertiesFromTypeNode(typeNode, project.getTypeChecker());
    // console.log(`>>> Resolved properties: ${JSON.stringify(props, null, 2)}`);

    return {
      properties: props,
    };
  }

  throw new Error(`Type or interface '${typeName}' not found in ${filePath}`);
};

const mapTypeToJsii = (t: Type, checker: TypeChecker): TypeReference => {
  if (t.isString()) {
    return { primitive: 'string' } as PrimitiveTypeReference;
  }
  if (t.isNumber()) {
    return { primitive: 'number' } as PrimitiveTypeReference;
  }
  if (t.isBoolean()) {
    return { primitive: 'boolean' } as PrimitiveTypeReference;
  }
  if (t.isArray()) {
    const elementType = t.getArrayElementType();
    return {
      collection: {
        kind: 'array',
        elementtype: elementType ? mapTypeToJsii(elementType, checker) : { primitive: 'any' },
      },
    } as CollectionTypeReference;
  }
  if (t.isUnion()) {
    return {
      union: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        types: t.getUnionTypes().map((ut: any) => mapTypeToJsii(ut, checker)),
      },
    } as UnionTypeReference;
  }
  if (t.isIntersection()) {
    // jsii spec does not support intersection, treat as union for compatibility
    return {
      union: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        types: t.getIntersectionTypes().map((it: any) => mapTypeToJsii(it, checker)),
      },
    } as UnionTypeReference;
  }
  if (t.isObject()) {
    const symbol = t.getSymbol();
    if (symbol) {
      return {
        fqn: checker.getFullyQualifiedName(symbol),
      };
    }
  }
  return { primitive: 'any' } as PrimitiveTypeReference;
};

const toJsiiProperty = (prop: PropertySignature): Property => {
  // console.log(`Processing property: name=${prop.getName()}; type=${prop.getType().getText()}`);
  const type = prop.getType();
  // Use the TypeChecker from the source file context
  const checker = prop.getSourceFile().getProject().getTypeChecker();

  return {
    name: prop.getName(),
    optional: prop.hasQuestionToken(),
    type: mapTypeToJsii(type, checker),
    // jsii Property.docs expects an object, not an array
    docs:
      prop.getJsDocs().length > 0 && typeof prop.getJsDocs()[0].getComment() === 'string'
        ? { summary: prop.getJsDocs()[0].getComment() as string }
        : {},
  };
};

const resolveJsiiPropertiesFromTypeNode = (
  typeNode: TypeNode,
  checker: TypeChecker,
): Property[] => {
  const propsWithAll = resolveJsiiPropertiesFromTypeNodeWithAll(typeNode, checker);
  // during union and intersection types resolution, we might have overrides in definitions
  // so we need to filter out duplicates in a certain order
  // let's keep the last occurrence as it's related to the latest definition in the chain
  const uniqueProps = new Map<string, Property>();
  // eslint-disable-next-line no-restricted-syntax
  for (const prop of propsWithAll) {
    uniqueProps.set(prop.name, prop);
  }
  return Array.from(uniqueProps.values());
};

// returns an array with all jsii properties (including duplicates from unions and intersections)
const resolveJsiiPropertiesFromTypeNodeWithAll = (
  typeNode: TypeNode,
  checker: TypeChecker,
): Property[] => {
  if (Node.isTypeElementMembered(typeNode)) {
    // console.log(`>>>> Type ElementMembered found: ${typeNode.getText()}`);
    return typeNode
      .getMembers()
      .filter((element) => Node.isPropertySignature(element))
      .map((prop) => toJsiiProperty(prop));
  }
  // if not membered, load properties from the type itself
  const type = checker.getTypeAtLocation(typeNode);
  if (type.isObject()) {
    // console.log(`>>>> Type Object found: ${type.getText()}`);
    return type
      .getProperties()
      .map((prop) => toJsiiProperty(prop.getDeclarations()[0] as PropertySignature));
  }

  if (Node.isUnionTypeNode(typeNode)) {
    //   console.log(`>>>> Union type node found: ${typeNode.getText()}`);
    return typeNode.getTypeNodes().flatMap((t) => {
      // console.log(`>>>>>> Processing intersection type node: ${t.getText()}`);
      return resolveJsiiPropertiesFromTypeNode(t, checker);
    });
  }

  if (Node.isIntersectionTypeNode(typeNode)) {
    // console.log(`>>>> Intersection Type found: ${typeNode.getText()}`);
    return typeNode.getTypeNodes().flatMap((t) => {
      // console.log(`>>>>>> Processing intersection type node: ${t.getText()}`);
      return resolveJsiiPropertiesFromTypeNode(t, checker);
    });
  }
  throw new Error(`Unsupported type node: ${typeNode.getText()}`);
};
