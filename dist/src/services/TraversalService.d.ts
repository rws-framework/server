import TheService from "./_service";
declare class TraversalService extends TheService {
    getAllFilesInFolder(folderPath: string, ignoreFilenames?: string[], recursive?: boolean): string[];
}
declare const _default: TraversalService;
export default _default;
