import * as handlebars from 'handlebars';
import * as fs from 'fs';

export const templateToString = (
  filePath: string,
  replacements: { [key: string]: string },
) => {
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  return template(replacements);
};
