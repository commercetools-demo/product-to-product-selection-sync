import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';
import { MESSAGE_TYPE } from '../constants/connectors.constants.js';
import { logger } from '../utils/logger.utils.js';

export function doValidation(messageBody: any) {
  if (!messageBody) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message body is missing. No further action is required. `
    );
  }

  // Make sure incoming message contains correct notification type
  if (!MESSAGE_TYPE.includes(messageBody.type)) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      ` Message type ${messageBody.type} is incorrect.`
    );
  }

  // Make sure incoming message contains the identifier of the changed product
  const resourceTypeId = messageBody?.resource?.typeId;
  const resourceId = messageBody?.resource?.id;

  if (resourceTypeId !== 'product' || !resourceId) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      ` No product ID is found in message.`
    );
  }
}