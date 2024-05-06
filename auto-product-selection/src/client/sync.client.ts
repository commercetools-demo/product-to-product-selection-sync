import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';
import { ProductSelection } from '@commercetools/platform-sdk';
import { logger } from '../utils/logger.utils.js';

export async function syncProductToProductSelection(productSelection: ProductSelection, productId: string) {
  logger.info(`Syncing product ${productId} to product selection ${productSelection.id}`);
  return await createApiRoot()
    .productSelections()
    .withId({
      ID: productSelection.id,
    })
    .post({
      body:{
         version: productSelection.version,
         actions: [
           {
            action: 'addProduct',
            product: {
              typeId: 'product',
              id: productId
            }
           }
         ]
      }
    })
    .execute()
    .then((response) => response.body)
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });
}