/*
 Author: Jayamurugan
 Description: all request response data bind the output
 */
module.exports = {
  res: function (res, statusCode, status, data) {
    res.status(statusCode);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    var mergeResponse = {
      ...data,
      status: status,
    };
    if (statusCode === 500) {
      mergeResponse = {
        ...data
      };
    }
    res.json(mergeResponse);
  },
};
