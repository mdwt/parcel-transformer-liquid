const Liquid = require('liquidjs');
const engine = Liquid();
const { Transformer } = require('@parcel/plugin');

module.exports = new Transformer({
  async loadConfig({ config }) {
    const { contents, filePath } =
      (await config.getConfig(['.liquidrc', '.liquidrc.js', 'liquid.config.js'])) || {};

    if (contents) {
      if (filePath.endsWith('.js')) {
        config.invalidateOnStartup();
      }
      config.invalidateOnFileChange(filePath);
    } else {
      config.invalidateOnFileCreate({
        fileName: '.liquidrc' || '.liquidrc.js' || 'liquid.config.js',
        aboveFilePath: config.searchPath,
      });
    }

    return contents;
  },
  async transform({ asset, config }) {
    const source = await asset.getCode();

    const data = await config.getConfig(['data-liquid.json']);
    const result = await engine.parseAndRender(source, data);

    asset.type = 'html';
    asset.setCode(result);

    return [asset];
  },
});
