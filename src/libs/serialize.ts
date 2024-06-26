import { NodeMetadata } from '../interfaces/Node';

const removeNulls = (obj: any): any => {
  if (obj === null) {
    return undefined;
  }
  if (typeof obj === 'object') {
    for (const key in obj) {
      obj[key] = removeNulls(obj[key]);
    }
  }
  return obj;
};

const extractMetadata = (data: any): NodeMetadata => {
  const metadata: any = {
    lastEditedBy: data.lastEditedBy,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
    createdAt: data.createdAt,
  };
  return removeNulls(metadata);
};

// const ElementsWithProperties = [ELEMENT_PARAGRAPH]
// const ElementsWithURL = [ELEMENT_LINK, ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED]

// Direct properties are collated in the properties for api
// and then unfurled when converting back to editor content
const directPropertyKeys = ['bold', 'italic', 'underline', 'highlight', 'code', 'url', 'value', 'body'];

// From API to content
export const deserializeContent = (sanatizedContent: any[]) => {
  return sanatizedContent.map(el => {
    const newElement: any = {
      type: el.type,
      id: el.id,
    };

    // Properties
    if (el.properties) {
      const elProps = { ...el.properties };

      Object.keys(el.properties).forEach(k => {
        if (directPropertyKeys.includes(k)) {
          newElement[k] = el.properties[k];
          delete elProps[k];
        }
      });

      if (Object.keys(elProps).length > 0) {
        newElement.properties = elProps;
      }
    }

    if (el.children && el.children.length > 0) {
      newElement.children = deserializeContent(el.children ?? []);
    } else {
      newElement.text = el.content;
    }

    return newElement;
  });
};
