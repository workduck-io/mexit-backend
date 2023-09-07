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

// const ElementsWithProperties = [ELEMENT_PARAGRAPH]
// const ElementsWithURL = [ELEMENT_LINK, ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED]

// Direct properties are collated in the properties for api
// and then unfurled when converting back to editor content
export const directPropertyKeys = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'highlight',
  'code',
  'email',
  'url',
  'caption',
  'value',
  'blockValue',
  'checked',
  'blockId',
  'body',
  'align',
  'questionId',
  'question',
  'answer',
  'actionContext',
  'blockMeta',
  'status',
  'lang',
  'workspace',
  'properties',
];

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
