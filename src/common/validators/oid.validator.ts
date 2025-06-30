import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'IsObjectId' })
export class IsObjectId implements ValidatorConstraintInterface {
  validate(value: string) {
    return Types.ObjectId.isValid(value);
  }
  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid ObjectId`;
  }
}
