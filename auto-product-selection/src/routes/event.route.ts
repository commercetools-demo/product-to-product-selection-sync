import { Router } from 'express';

import { logger } from '../utils/logger.utils';
import {
  HTTP_STATUS_SERVER_ERROR,
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from '../constants/http.status.constants';
import CustomError from '../errors/custom.error';
import { decodeToJson } from '../utils/decoder.utils';
import { doValidation } from '../validators/product-creation.validators';
import {
  getProductAttribute,
  getProductSelectionByKey,
} from '../client/query.client';
import { syncProductToProductSelection } from '../client/sync.client';

const eventRouter: Router = Router();

const PRODUCT_SELECTION_PREFIX = process.env.PRODUCT_SELECTION_PREFIX;
eventRouter.post('/', async (request, response) => {
  try {
    // Receive the Pub/Sub message
    const encodedMessageBody = request.body?.message?.data;
    if (!encodedMessageBody) {
      throw new CustomError(
        HTTP_STATUS_SUCCESS_ACCEPTED,
        'Missing message data from incoming event message.'
      );
    }

    const messageBody = decodeToJson(encodedMessageBody);
    doValidation(messageBody);
    
    const productId = messageBody?.resource?.id;
    const productAttributeValue = await getProductAttribute(productId);
    if (productAttributeValue) {
      const productSelectionKey =
        PRODUCT_SELECTION_PREFIX + productAttributeValue;
      const productSelection =
        await getProductSelectionByKey(productSelectionKey);

      await syncProductToProductSelection(productSelection, productId);
    }
  } catch (err: any) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(HTTP_STATUS_SERVER_ERROR).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
});

export default eventRouter;
