import { createReadStream, writeFile } from "fs";
import { parse } from "csv-parse";

const args = process.argv.slice(2);

// update these arguments to match your needs
const fileName = args[0]; // assumes your csv file is in the same directory as this file
const outputPath = args[1];
const modelName = args[2]; // name of the model you are creating presets for

// Running this should look something like this:
// node createFiles.js myData.csv /Users/me/Desktop/test-data/presets ModelName

// update this function to properly rename your presets from your data
const createPresetFileName = (name) => `sku-${name.replace(/-/g, "")}`;
const createPresetVariableName = (name) => `sku${name.replace(/-/g, "")}`;

// update these functions to properly create the content of your presets
const createPresetContent = (nameOfPreset, nameOfModel, rawName, quantity) => `
import type { T${nameOfModel}DraftBuilder } from '../../../types';
import * as ${nameOfModel}Draft from '../../index';\n
const ${nameOfPreset} = (): T${nameOfModel}DraftBuilder => 
    ${nameOfModel}Draft.presets
        .empty()
        .sku('${rawName}')
        .quantityOnStock(${quantity});\n
export default ${nameOfPreset};\n
`;

const createTestContent = (nameOfPreset, nameOfModel, presetFileName) => `
import { T${nameOfModel}Draft, T${nameOfModel}DraftGraphql } from '../../../types';
import ${nameOfPreset} from './${presetFileName}';\n
describe(' with ${nameOfPreset} preset', () => {
    it('should return ${nameOfPreset} preset', () => {
        const ${nameOfPreset}Preset = ${nameOfPreset}.build<T${nameOfModel}Draft>();
        expect(${nameOfPreset}Preset).toMatchInlineSnapshot(\`\`);
    });\n
    it('should return ${nameOfPreset} preset when built for GraphQL', () => {
        const ${nameOfPreset}PresetGraphql = ${nameOfPreset}.buildGraphql<T${nameOfModel}DraftGraphql>();
        expect(${nameOfPreset}PresetGraphql).toMatchInlineSnapshot(\`\`);
    });
});
\n
`;

createReadStream(`./${fileName}`)
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    const presetName = createPresetVariableName(row[0]);
    const presetFileName = createPresetFileName(row[0]);
    const presetContent = createPresetContent(
      presetName,
      modelName,
      row[0],
      row[1]
    );
    const testContent = createTestContent(
      presetName,
      modelName,
      presetFileName
    );
    writeFile(`${outputPath}/${presetFileName}.ts`, presetContent, (err) => {
      if (err) throw err;
      console.log("Created preset:", presetName);
    });
    writeFile(`${outputPath}/${presetFileName}.spec.ts`, testContent, (err) => {
      if (err) throw err;
      console.log("Created test:", presetName);
    });
  });
