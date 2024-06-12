import { RWSError } from "../errors";

export type ControllerActionErrorResponse = {
    success: false
    data: {
        error?: RWSError
    }
};

export type ControllerActionResponse<ActionResponse = null> = {
    success: true
    data: ActionResponse
};