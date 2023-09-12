import TheService from "./_service";


  class UtilsService extends TheService {
    filterNonEmpty<T>(arr: T[]): T[]
    {
      return arr.filter((argElement: T) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
    }
  }

  export default UtilsService.getSingleton();