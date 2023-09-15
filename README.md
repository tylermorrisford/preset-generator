## Preset and Test creator for test-data

Node script for reading csv data and populating Preset and Test (TS) files.

- clone
- install deps
- place your csv data in the cloned directory
- update the script for your use case

### Running

```js
node createFiles.js myData.csv /Users/me/Desktop/test-data/presets ModelName
```

The script can be updated to take more or less arguments, but as is it will take:

- name or path to your csv data file
- your desired output path
- the name of the data model used by your presets and tests
