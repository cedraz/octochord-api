import { isCuid } from '@paralleldrive/cuid2';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCUID(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isCuid(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um CUID válido`;
        },
      },
    });
  };
}
