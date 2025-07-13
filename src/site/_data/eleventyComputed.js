const { getGraph } = require("../../helpers/linkUtils");
const { getFileTree } = require("../../helpers/filetreeUtils");
const { userComputed } = require("../../helpers/userUtils");

module.exports = async function (data) {
  return {
    graph: await getGraph(data),
    filetree: await getFileTree(data),         // 仅当 getFileTree 也是 async
    userComputed: await userComputed(data)     // 同理，若非 async 可省略 await
  };
};
