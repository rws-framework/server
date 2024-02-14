const fs = require('fs');
const path = require('path');

const externals = (codeBase, nodeModules) => ({context, request}, callback) => {

    const moduleDir = path.resolve(path.dirname(module.id))

    const inc_list_context = [
      codeBase      
    ];

    const inc_list = [
      'rws-js-server',
      codeBase
    ];

    const not_inc_list_context = [        
      'node_modules' 
    ];

    const not_inc_list = [
       
    ];

    const exceptions_context = [ 
      path.resolve(nodeModules, 'rws-js-server'),     
    ];

    const exceptions = [
       path.resolve(moduleDir, 'exec')     
    ];

    const regexList = (list) => {
      return new RegExp(list.map(ext => ext.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'));
    }

   const includedCondition = (regexList(inc_list).test(request) || (regexList(inc_list_context).test(context) && request[0] === '.'));
   const excludedCondition = (regexList(not_inc_list_context).test(context));
   const contextExceptionCondition = regexList(exceptions_context).test(context) && request[0] === '.';
   const requestExceptionCondition = (regexList(exceptions).test(request));

    if ( 
      (includedCondition
      && !excludedCondition)
      || (requestExceptionCondition || contextExceptionCondition)
    ) {
      
      return callback();
    }
    

    return callback(null, 'commonjs ' + request);
  }

module.exports = externals;