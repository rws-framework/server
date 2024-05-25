import { Controller as NestController, ControllerOptions as NestControllerOptions } from '@nestjs/common';


export type RWSControllerOptions = {}

export function RWSControllerDecorator(
    prefixOrOptions?: string | string[] | RWSControllerOptions | NestControllerOptions,
  ): ClassDecorator {
    const ControllerDecorator: ClassDecorator = NestController(prefixOrOptions as NestControllerOptions);
    return ControllerDecorator;
}