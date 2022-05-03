const metadatas = require('./metadatas.json');

module.exports.getNonCommonCountByTokenIds = (tokenIds = []) => {
  const tokenIdsWithHash = tokenIds.map(t => `#${t}`);
  const tokens = metadatas.filter(metadata => tokenIdsWithHash.includes(metadata.name));
  const rareTokens = tokens.filter(token => {
    const attributesValue = token.attributes.map(attr => attr.value);
    return attributesValue.includes('rare');
  });
  return rareTokens.length;
};