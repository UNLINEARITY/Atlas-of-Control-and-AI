const { getGraph } = require("../../helpers/linkUtils");
const { getFileTree } = require("../../helpers/filetreeUtils");
const { userComputed } = require("../../helpers/userUtils");


module.exports = async function (data) {
  return {
    graph: await getGraph(data),
    filetree: await getFileTree(data),        
    userComputed: await userComputed(data)     
  };
};
