const fs = require('fs');
const path = require('path');

const tools = require('./_tools');

const _defaultOpts = {
  mode: 'all',
  conditions: {
    request_based: {
      include: [],
      exclude: [],
      exceptions: []
    },
    context_based: {
      include: [],
      exclude: [],
      exceptions: []
    }
  }
}

const externals = (declaredCodeBase, nodeModules, externalOptions = null) => ({context, request}, callback) => {
    let theOptions = _defaultOpts;

    if(externalOptions !== null){      
      theOptions = Object.assign(theOptions, externalOptions);
    }

    const moduleDir = path.resolve(path.dirname(module.id));    

    const codeBase = tools.getActiveWorkSpaces(declaredCodeBase, theOptions.mode);  
    

    const inc_list_context = [
      ...codeBase, 
      ...theOptions.conditions.context_based.include
    ];

    const inc_list = [
      'rws-js-server',
      ...codeBase, 
      ...theOptions.conditions.request_based.include
    ];

    const not_inc_list_context = [      
      'node_modules', ...theOptions.conditions.context_based.exclude
    ];

    const not_inc_list = [...theOptions.conditions.request_based.exclude];

    const exceptions_context = [path.resolve(nodeModules, 'rws-js-server'), ...theOptions.conditions.context_based.exceptions];

    const exceptions = [...[
       path.resolve(moduleDir, 'exec')     
    ], ...theOptions.conditions.request_based.exceptions];

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
      //merging to output
      return callback();
    }
    
    //using require from node_modules
    return callback(null, 'commonjs ' + request);
  }

module.exports = {rwsExternals: externals, _externalsDefaults: _defaultOpts};