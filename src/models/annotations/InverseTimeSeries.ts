import 'reflect-metadata';

interface InverseTimeSeriesOpts{
    timeSeriesModel: string
    hydrationField: string
  }
  
function InverseTimeSeries(timeSeriesModel: string, hydrationField: string) {

  let metaOpts: InverseTimeSeriesOpts = {
    timeSeriesModel: timeSeriesModel,
    hydrationField: hydrationField
  };


  return function(target: any, key: string) {          
    Reflect.defineMetadata(`InverseTimeSeries:${key}`, metaOpts, target);
  };
}

  export default InverseTimeSeries;
  export {InverseTimeSeriesOpts}