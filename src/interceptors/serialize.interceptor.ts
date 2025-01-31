import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  // List of keys to ignore during serialization
  static readonly ignoredKeys = new Set<string>([
    'dbService',
    'configService',
    '_client',
    '_originalClient',
    'allModels',
    'connection',
    // Add any other keys you want to ignore
  ]);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Convert the handler result to an Observable if it isn't one
    const handle = next.handle();
    const observable = handle instanceof Observable ? handle : from(Promise.resolve(handle));

    return observable.pipe(
      map(data => {
        if (data === undefined || data === null) {
          return null; // Return null for undefined/null data
        }            

        return SerializeInterceptor.serialize(data);
      }),
    );
  }

  public static serialize(data: any){
    const serialized = JSON.stringify(data, SerializeInterceptor.getCircularReplacer());    
    return serialized === undefined ? null : JSON.parse(serialized);
  }

  public static getCircularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      // First check if this is a key we want to ignore
      if (SerializeInterceptor.ignoredKeys.has(key)) {
        return undefined; // This will remove the key from the output
      }

      // Handle null/undefined values
      if (value === undefined) {
        return null; // Convert undefined to null for valid JSON
      }

      // Then handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return null; // Convert circular references to null
        }
        seen.add(value);
      }
      return value;
    };
  }
}