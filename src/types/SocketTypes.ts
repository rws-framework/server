export interface JSONMessage{
    method: string;
    msg: any;
    user_id: string;
}

export interface BaseResponse<T> {
    data?: T;
    success: boolean;
    error?: Error;
}

export interface ErrorResponse extends BaseResponse<any> {
    error: Error;
    success: false;
}

export interface SocketWsResponse<T> extends BaseResponse<T> {
    method: string;
}