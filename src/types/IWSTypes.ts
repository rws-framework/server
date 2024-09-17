interface BaseResponse<T> {
    data?: T;
    success: boolean;
    error?: Error;
}

export type JSONMessage = {
    method: string;
    msg: any;
    user_id: string;
}

export interface ErrorWSResponse extends BaseResponse<any> {
    error: Error;
    success: false;
}

export interface SocketWSResponse<T> extends BaseResponse<T> {
    method: string;
}
