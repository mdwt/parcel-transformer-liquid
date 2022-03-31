const {Liquid} = require('liquidjs');
const engine = new Liquid();
const {Transformer} = require('@parcel/plugin');

module.exports = new Transformer({
  async loadConfig({config, logger}) {
    const {contents, filePath} =
    (await config.getConfig(['liquid.config.js'])) || {};

    if (contents) {
      config.invalidateOnStartup();
      config.invalidateOnFileChange(filePath);
    } else {
      logger.log({message: 'Your liquid config file is empty.  Add "liquid.config.js" in the project root and add a "data" object'}, config)
      config.invalidateOnFileCreate({
        fileName: 'liquid.config.js',
        aboveFilePath: config.searchPath,
      });
    }

    return contents;
  },
  async transform(props) {
    const {asset, config, logger} = props;
    const source = await props.asset.getCode();
    logger.log({message: 'Parsing liquid'}, config)

    const result = await engine.parseAndRender(source, config.data);

    asset.setCode(result);

    return [asset];
  },
});
